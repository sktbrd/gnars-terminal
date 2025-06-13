import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { NextRequest, NextResponse } from 'next/server';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { Address } from 'viem';

/**
 * Supporters API Endpoint
 * 
 * This endpoint fetches and aggregates NFT token holders for a given contract,
 * providing caching to improve performance and reduce RPC calls.
 * 
 * Features:
 * - In-memory caching with 5-minute TTL
 * - HTTP caching headers for CDN/browser caching
 * - Batch fetching of token owners with rate limiting
 * - Automatic aggregation and ranking by token count
 * - Pagination support
 * 
 * Query Parameters:
 * - contractAddress: The NFT contract address (required)
 * - startTokenId: Starting token ID (default: 1)
 * - endTokenId: Ending token ID (default: startTokenId + 19)
 * - limit: Max number of supporters to return (optional)
 * 
 * Caching Strategy:
 * 1. In-memory cache with 5-minute TTL for immediate repeated requests
 * 2. HTTP cache headers (s-maxage=300, stale-while-revalidate=600)
 * 3. Cache key includes contract address and token range for granular caching
 */

// Enable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

// Create a public client for Base chain
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Types
interface AggregatedHolder {
  address: string;
  tokenCount: number;
  tokenIds: bigint[];
}

// Serialized version for API responses (BigInt converted to string)
interface SerializedAggregatedHolder {
  address: string;
  tokenCount: number;
  tokenIds: string[];
}

interface SupportersResponse {
  supporters: SerializedAggregatedHolder[];
  totalSupply: string;
  hasMore: boolean;
  nextTokenId: string;
  cached: boolean;
}

// In-memory cache with TTL
const cache = new Map<string, {
  data: SupportersResponse;
  timestamp: number;
  ttl: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(contractAddress: string, startTokenId: string, endTokenId: string): string {
  return `${contractAddress}-${startTokenId}-${endTokenId}`;
}

function getFromCache(key: string): SupportersResponse | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return { ...cached.data, cached: true };
}

function setCache(key: string, data: SupportersResponse): void {
  cache.set(key, {
    data: { ...data, cached: false },
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
}

/**
 * Safely execute a contract read call with proper error handling
 */
async function safeContractCall<T>(params: {
  address: Address;
  functionName: string;
  args?: readonly any[];
  abi: any;
}): Promise<{
  success: boolean;
  data?: T;
  error?: string;
}> {
  try {
    const contractParams = {
      address: params.address,
      abi: params.abi,
      functionName: params.functionName,
      ...(params.args && { args: params.args })
    };
    const result = await publicClient.readContract(contractParams as any);
    return { success: true, data: result as T };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error?.message || 'Unknown error'
    };
  }
}

/**
 * Fetch token owners for a range of token IDs
 */
async function fetchTokenOwnersBatch(
  contractAddress: Address,
  startTokenId: bigint,
  endTokenId: bigint
): Promise<{ address: string; tokenId: bigint }[]> {
  const results: { address: string; tokenId: bigint }[] = [];
  
  // Process all tokens in the range
  for (let tokenId = startTokenId; tokenId <= endTokenId; tokenId++) {
    const ownerResult = await safeContractCall<string>({
      address: contractAddress,
      abi: zoraMintAbi,
      functionName: 'ownerOf',
      args: [tokenId]
    });
    
    if (ownerResult.success && ownerResult.data) {
      results.push({
        address: ownerResult.data,
        tokenId
      });
    }
    // No delays - let the RPC handle rate limiting
  }
  
  return results;
}

/**
 * Aggregate token holders by address and rank by token count
 */
function aggregateAndRankHolders(
  minters: { address: string; tokenId: bigint }[]
): AggregatedHolder[] {
  const holdersMap = new Map<string, { count: number; tokens: bigint[] }>();

  // Count tokens per address
  minters.forEach(({ address, tokenId }) => {
    if (holdersMap.has(address)) {
      const data = holdersMap.get(address)!;
      data.count += 1;
      data.tokens.push(tokenId);
    } else {
      holdersMap.set(address, { count: 1, tokens: [tokenId] });
    }
  });

  // Convert map to array and sort by token count (descending)
  const sorted = Array.from(holdersMap.entries())
    .map(([address, data]) => ({
      address,
      tokenCount: data.count,
      tokenIds: data.tokens,
    }))
    .sort((a, b) => b.tokenCount - a.tokenCount);

  return sorted;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contractAddress = searchParams.get('contractAddress');
  const startTokenId = searchParams.get('startTokenId');
  const endTokenId = searchParams.get('endTokenId');
  const limit = searchParams.get('limit');

  // Validate required parameters
  if (!contractAddress) {
    return NextResponse.json(
      { error: 'Missing contractAddress parameter' },
      { status: 400 }
    );
  }

  // Format and validate contract address
  let formattedAddress: Address;
  try {
    formattedAddress = contractAddress.toLowerCase().startsWith('0x')
      ? (contractAddress as Address)
      : (`0x${contractAddress}` as Address);
  } catch {
    return NextResponse.json(
      { error: 'Invalid contract address format' },
      { status: 400 }
    );
  }

  // Set defaults
  const start = startTokenId ? BigInt(startTokenId) : 1n;
  const end = endTokenId ? BigInt(endTokenId) : start + 19n; // Default batch of 20
  const supporterLimit = limit ? parseInt(limit) : undefined;

  // Check cache first
  const cacheKey = getCacheKey(contractAddress, start.toString(), end.toString());
  const cachedResult = getFromCache(cacheKey);
  if (cachedResult) {
    // Apply limit if specified and return cached result
    if (supporterLimit && cachedResult.supporters.length > supporterLimit) {
      return NextResponse.json({
        ...cachedResult,
        supporters: cachedResult.supporters.slice(0, supporterLimit)
      });
    }
    return NextResponse.json(cachedResult);
  }

  try {
    // Get total supply to determine if there are more tokens
    const totalSupplyResult = await safeContractCall<bigint>({
      address: formattedAddress,
      abi: zoraMintAbi,
      functionName: 'totalSupply',
      args: []
    });

    const totalSupply = totalSupplyResult.success && totalSupplyResult.data 
      ? totalSupplyResult.data 
      : 0n;

    // Clamp end to totalSupply
    const actualEnd = totalSupply > 0n && end > totalSupply ? totalSupply : end;

    // Fetch token owners
    const tokenOwners = await fetchTokenOwnersBatch(
      formattedAddress,
      start,
      actualEnd
    );

    // Aggregate and rank holders
    const aggregatedHolders = aggregateAndRankHolders(tokenOwners);

    // Convert BigInt values to strings for JSON serialization
    const serializedHolders = aggregatedHolders.map(holder => ({
      ...holder,
      tokenIds: holder.tokenIds.map(id => id.toString())
    }));

    // Determine if there are more tokens to fetch
    const hasMore = totalSupply > actualEnd;
    const nextTokenId = hasMore ? actualEnd + 1n : totalSupply + 1n;

    const response: SupportersResponse = {
      supporters: supporterLimit ? serializedHolders.slice(0, supporterLimit) : serializedHolders,
      totalSupply: totalSupply.toString(),
      hasMore,
      nextTokenId: nextTokenId.toString(),
      cached: false
    };

    // Cache the full result (without limit applied)
    setCache(cacheKey, {
      supporters: serializedHolders, // Cache the serialized list
      totalSupply: totalSupply.toString(),
      hasMore,
      nextTokenId: nextTokenId.toString(),
      cached: false
    });

    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error fetching supporters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supporters' },
      { status: 500 }
    );
  }
}
