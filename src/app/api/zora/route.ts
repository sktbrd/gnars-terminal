import { createPublicClient, http, parseAbi, type ContractFunctionExecutionError } from 'viem';
import { base } from 'viem/chains';
import { NextRequest, NextResponse } from 'next/server';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';

// Create a public client for Base chain
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Minimal ABI for fallback attempts
const minimalAbi = parseAbi([
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)'
]);

// Types for contract call parameters
type ContractCallParams = {
  address: `0x${string}`;
  functionName: 'name' | 'ownerOf' | 'totalSupply' | 'saleDetails' | 'salesConfig' | 'mintedPerAddress' | 'zoraFeeForAmount' | 'tokenURI';
  args: readonly [] | readonly [bigint] | readonly [`0x${string}`] | undefined;
  abi: typeof zoraMintAbi | typeof minimalAbi;
};

/**
 * Safely execute a contract read call with proper error handling
 */
async function safeContractCall<T>(params: ContractCallParams): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  isInternalError?: boolean;
}> {
  try {
    const result = await publicClient.readContract(params);
    return { success: true, data: result as T };
  } catch (err) {
    const error = err as ContractFunctionExecutionError;
    const message = error?.message || 'Unknown error';
    const isInternalError = message.includes('Internal error');
    
    return {
      success: false,
      error: message,
      isInternalError
    };
  }
}

/**
 * Check if a contract consistently returns Internal Error
 */
async function isInternalErrorContract(address: `0x${string}`): Promise<boolean> {
  // Functions to test for internal errors
  const callsToTest: Array<{ functionName: ContractCallParams['functionName']; args: ContractCallParams['args'] }> = [
    { functionName: 'totalSupply', args: [] as readonly [] },
    { functionName: 'name', args: [] as readonly [] },
    { functionName: 'ownerOf', args: [1n] as readonly [bigint] }
  ];
  
  let internalErrorCount = 0;
  
  // Execute each call and count internal errors
  for (const call of callsToTest) {
    const result = await safeContractCall({
      address,
      abi: zoraMintAbi,
      functionName: call.functionName,
      args: call.args
    });
    
    if (result.isInternalError) {
      internalErrorCount++;
    }
  }
  
  // Contract likely has issues if 2+ calls result in internal errors
  return internalErrorCount >= 2;
}

export async function GET(request: NextRequest) {
  try {
    // Get and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const contractAddress = searchParams.get('contractAddress');
    const tokenId = searchParams.get('tokenId');
    
    console.log('API Request Parameters:', { contractAddress, tokenId });

    if (!contractAddress || !tokenId) {
      return NextResponse.json(
        { error: 'Missing contractAddress or tokenId parameter' },
        { status: 400 }
      );
    }

    // Format address and tokenId
    const formattedAddress = contractAddress.startsWith('0x') 
      ? contractAddress as `0x${string}`
      : `0x${contractAddress}` as `0x${string}`;
    
    let tokenIdBigInt: bigint;
    try {
      tokenIdBigInt = BigInt(tokenId);
    } catch (err) {
      return NextResponse.json(
        { error: `Invalid tokenId: ${tokenId}` },
        { status: 400 }
      );
    }

    // Check if contract name is available (basic validity check)
    const nameResult = await safeContractCall<string>({
      address: formattedAddress,
      abi: zoraMintAbi,
      functionName: 'name',
      args: []
    });
    
    if (nameResult.success) {
      console.log('Contract name:', nameResult.data);
    }

    // Check for internal error contract pattern
    if (await isInternalErrorContract(formattedAddress)) {
      return NextResponse.json({
        error: 'Contract returns internal error for standard ERC721 calls',
        isInternalErrorContract: true,
        exists: false
      }, { status: 200 });
    }

    // Try to get total supply (to validate token existence)
    const totalSupplyResult = await safeContractCall<bigint>({
      address: formattedAddress,
      abi: zoraMintAbi,
      functionName: 'totalSupply',
      args: []
    });
    
    if (totalSupplyResult.success && totalSupplyResult.data) {
      console.log('Total supply:', totalSupplyResult.data);
      
      if (tokenIdBigInt > totalSupplyResult.data) {
        return NextResponse.json({ 
          error: `Token #${tokenIdBigInt} does not exist yet. Total supply is ${totalSupplyResult.data}.`,
          exists: false 
        }, { status: 404 });
      }
    }

    // Attempt to get token owner
    const ownerResult = await safeContractCall<string>({
      address: formattedAddress,
      abi: zoraMintAbi,
      functionName: 'ownerOf',
      args: [tokenIdBigInt]
    });
    
    // Owner found successfully
    if (ownerResult.success && ownerResult.data) {
      console.log('Owner retrieved successfully:', ownerResult.data);
      return NextResponse.json({ owner: ownerResult.data, exists: true });
    }
    
    // Handle token non-existence
    if (ownerResult.error) {
      const nonexistentTokenErrors = [
        'nonexistent token',
        'owner query for nonexistent token',
        'erc721: invalid token id',
        'internal error'
      ];
      
      const errorMsg = ownerResult.error.toLowerCase();
      const tokenDoesNotExist = nonexistentTokenErrors.some(msg => 
        errorMsg.includes(msg.toLowerCase())
      );
      
      if (tokenDoesNotExist) {
        return NextResponse.json({ 
          error: `Token #${tokenIdBigInt} does not exist`,
          exists: false 
        }, { status: 404 });
      }
      
      // Try minimal ABI as fallback
      const fallbackResult = await safeContractCall<string>({
        address: formattedAddress,
        abi: minimalAbi,
        functionName: 'ownerOf',
        args: [tokenIdBigInt]
      });
      
      if (fallbackResult.success && fallbackResult.data) {
        console.log('Owner retrieved with minimal ABI:', fallbackResult.data);
        return NextResponse.json({ owner: fallbackResult.data, exists: true });
      }
      
      // If all attempts fail, return detailed error
      return NextResponse.json({
        error: `Failed to get token owner: ${ownerResult.error}`,
        exists: false
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}` 
      : 'Unknown error';
      
    return NextResponse.json(
      { 
        error: `Failed to get token owner: ${errorMessage}`,
        exists: false
      },
      { status: 500 }
    );
  }
}
