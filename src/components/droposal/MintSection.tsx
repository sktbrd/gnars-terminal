import { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from 'wagmi';
import { FaShoppingCart } from 'react-icons/fa';
import { parseEther, Address } from 'viem';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { SalesConfig, PriceInfo } from './types';
import { Button } from '../ui/button';

interface MintSectionProps {
  address: Address | undefined;
  contractAddress: Address;
  salesConfig: SalesConfig | undefined;
  zoraFeeData: any; // Using any for simplification
  mintQuantity: number;
  setMintQuantity: (quantity: number) => void;
}

export const MintSection: React.FC<MintSectionProps> = ({
  address,
  contractAddress,
  salesConfig,
  zoraFeeData,
  mintQuantity,
  setMintQuantity,
}) => {
  const [comment, setComment] = useState('');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null
  );
  const [isPending, setIsPending] = useState(false);

  // Calculate the total price including protocol fee
  const calculateTotalPrice = (): PriceInfo | null => {
    if (!salesConfig || !zoraFeeData.data) return null;

    // Get price per token from salesConfig
    const pricePerTokenInWei = salesConfig.publicSalePrice
      ? parseEther(salesConfig.publicSalePrice.toString())
      : 0n;

    // Calculate mint price (price per token * quantity)
    const mintPrice = pricePerTokenInWei * BigInt(mintQuantity);

    // Get Zora protocol fee
    const zoraProtocolFee = zoraFeeData.data[1] as bigint;

    // Calculate total (mint price + protocol fee)
    const totalValue = mintPrice + zoraProtocolFee;

    return {
      pricePerTokenInWei,
      mintPrice,
      zoraProtocolFee,
      totalValue,
      totalInEth: Number(totalValue) / 1e18, // For display
    };
  };

  const priceInfo = calculateTotalPrice();

  // Get user's ETH balance
  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: Boolean(address),
    },
  });

  // Simulate the contract call
  const {
    data: simulateData,
    error: simulateError,
    isError: isSimulateError,
  } = useSimulateContract({
    address: contractAddress,
    abi: zoraMintAbi,
    functionName: 'purchaseWithComment',
    args: [BigInt(mintQuantity), comment],
    value: priceInfo?.totalValue ?? 0n,
    query: {
      enabled: Boolean(
        contractAddress && 
        address && 
        salesConfig && 
        zoraFeeData.data && 
        priceInfo && 
        mintQuantity > 0
      ),
    },
  });

  const {
    writeContract,
    isPending: isWritePending,
    error: writeError,
    data: hash,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  // Update hash when we get a transaction hash
  if (hash && !transactionHash && !isPending) {
    setTransactionHash(hash);
  }

  // Handle quantity change
  const handleIncreaseQuantity = () => {
    if (
      salesConfig?.maxSalePurchasePerAddress &&
      mintQuantity >= salesConfig.maxSalePurchasePerAddress
    ) {
      return; // Don't exceed max purchase limit
    }
    setMintQuantity(mintQuantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (mintQuantity > 1) {
      setMintQuantity(mintQuantity - 1);
    }
  };

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  // Handle mint action
  const handleMint = async () => {
    if (!contractAddress || !address) {
      console.warn('Cannot mint: missing contract address or user address');
      return;
    }

    if (!salesConfig) {
      console.warn('Cannot mint: salesConfig not available');
      return;
    }

    if (!zoraFeeData.data) {
      console.warn('Cannot mint: Zora fee data not loaded yet');
      return;
    }

    if (!priceInfo) {
      console.warn('Cannot mint: price information not available');
      return;
    }
    setIsPending(true);
    try {
      writeContract(simulateData.request);
    } catch (err) {
      console.error('Exception during mint:', err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box
      borderWidth={1}
      display={'flex'}
      flexDir={'column'}
      alignItems='stretch'
      gap={3}
      rounded={'lg'}
      p={6}
      _dark={{ borderColor: 'yellow' }}
    >
      <HStack gap={2}>
        <FaShoppingCart size={24} color='#FFD700' />
        <Heading size='xl'>Mint Droposal</Heading>
      </HStack>
      {/* Quantity Selector */}
      <Box>
        <Text fontWeight='bold' mb={2}>
          Quantity
        </Text>
        <Flex align='center'>
          <Button
            onClick={handleDecreaseQuantity}
            disabled={mintQuantity <= 1}
            size='sm'
          >
            -
          </Button>
          <Text mx={4} fontWeight='bold'>
            {mintQuantity}
          </Text>
          <Button
            onClick={handleIncreaseQuantity}
            disabled={
              salesConfig?.maxSalePurchasePerAddress
                ? mintQuantity >= salesConfig.maxSalePurchasePerAddress
                : false
            }
            size='sm'
          >
            +
          </Button>
        </Flex>
      </Box>

      {/* Comment Input */}
      <Box>
        <Text fontWeight='bold' mb={2}>
          Comment (optional)
        </Text>
        <Input
          type='text'
          value={comment}
          onChange={handleCommentChange}
          placeholder='Add a comment to your mint transaction...'
          borderColor='gray.200'
          _dark={{ borderColor: 'yellow.400' }}
          rounded='lg'
          size='md'
        />
      </Box>

      {/* Price breakdown */}
      {priceInfo && (
        <Box bg='gray.50' borderWidth={1} rounded='md' p={3} _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}>
          <Text fontWeight='bold' fontSize='sm' mb={2}>
            Price Breakdown
          </Text>
          <VStack gap={1} align='stretch' fontSize='xs'>
            <Flex justify='space-between'>
              <Text>Mint Price ({mintQuantity} × {salesConfig?.publicSalePrice?.toFixed(4)} ETH)</Text>
              <Text>{(Number(priceInfo.mintPrice) / 1e18).toFixed(4)} ETH</Text>
            </Flex>
            <Flex justify='space-between'>
              <Text>Protocol Fee</Text>
              <Text>{(Number(priceInfo.zoraProtocolFee) / 1e18).toFixed(4)} ETH</Text>
            </Flex>
            <Box borderTop='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.600' }} pt={1} mt={1}>
              <Flex justify='space-between' fontWeight='bold'>
                <Text>Total (+ gas)</Text>
                <Text>{priceInfo.totalInEth.toFixed(4)} ETH</Text>
              </Flex>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Balance warning */}
      {balance && priceInfo && balance.value < priceInfo.totalValue && (
        <Box bg='orange.50' borderColor='orange.200' borderWidth={1} rounded='md' p={3} _dark={{ bg: 'orange.900', borderColor: 'orange.600' }}>
          <Text color='orange.700' fontSize='sm' _dark={{ color: 'orange.200' }}>
            ⚠️ <strong>Insufficient balance</strong>
            <br />
            Need: <strong>{priceInfo.totalInEth.toFixed(4)} ETH</strong> • 
            Have: <strong>{Number(balance.formatted).toFixed(4)} ETH</strong>
            <br />
            <Text fontSize='xs' mt={1}>
              Try reducing quantity or add more ETH to your wallet.
            </Text>
          </Text>
        </Box>
      )}

      {/* Mint Button */}
      <Box>
        <Button
          colorScheme='blue'
          size='lg'
          width='100%'
          onClick={handleMint}
          loading={isWritePending || isConfirming || isPending}
          disabled={
            !address ||
            isWritePending ||
            isConfirming ||
            isPending ||
            !salesConfig
          }
        >
          {isConfirmed
            ? 'Collected!'
            : `Collect for ${
                salesConfig?.publicSalePrice
                  ? `${(salesConfig.publicSalePrice * mintQuantity).toFixed(3)} ETH${zoraFeeData.data ? ' + fees' : ''}`
                  : ''
              }`}
        </Button>

        {/* Comprehensive Error Handling */}
        {(isSimulateError || writeError || confirmError) && (
          <Box 
            bg='red.50' 
            borderColor='red.200' 
            borderWidth={2} 
            rounded='lg' 
            p={4} 
            mt={4}
            _dark={{ bg: 'red.900', borderColor: 'red.600' }}
          >
            <Text color='red.700' fontWeight='bold' fontSize='md' mb={2} _dark={{ color: 'red.200' }}>
              🚫 Minting Error
            </Text>
            
            {/* Simulation Errors */}
            {isSimulateError && simulateError && (
              <Box mb={3}>
                <Text color='red.600' fontSize='sm' fontWeight='semibold' mb={1} _dark={{ color: 'red.300' }}>
                  Transaction Validation Failed:
                </Text>
                <Text color='red.700' fontSize='sm' _dark={{ color: 'red.200' }}>
                  {(() => {
                    const errorMsg = simulateError.message.toLowerCase();
                    
                    // Insufficient funds
                    if (errorMsg.includes('insufficient funds') || errorMsg.includes('exceeds the balance')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            💰 <strong>Insufficient ETH Balance</strong>
                          </Text>
                          <Text fontSize='xs' mb={2}>
                            Need: <strong>{priceInfo ? priceInfo.totalInEth.toFixed(4) : 'N/A'} ETH</strong>
                            {balance && (
                              <> • Have: <strong>{Number(balance.formatted).toFixed(4)} ETH</strong></>
                            )}
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Solutions:</strong>
                            <br />• Add more ETH to your wallet
                            <br />• Reduce the mint quantity
                            <br />• Wait for lower gas fees
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Sale not active
                    if (errorMsg.includes('sale_inactive') || errorMsg.includes('not active')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            ⏰ <strong>Sale Not Active</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Solutions:</strong>
                            <br />• Check if the sale has started
                            <br />• Verify the sale hasn't ended
                            <br />• Refresh the page to get latest status
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Purchase limit exceeded
                    if (errorMsg.includes('purchase_toomanyforaddress') || errorMsg.includes('limit') || errorMsg.includes('max')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            🚫 <strong>Purchase Limit Exceeded</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Solutions:</strong>
                            <br />• Reduce quantity to within limits
                            <br />• Use a different wallet address
                            <br />• Check maximum allowed per address
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Wrong price
                    if (errorMsg.includes('purchase_wrongprice') || errorMsg.includes('price')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            💲 <strong>Price Mismatch</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Solutions:</strong>
                            <br />• Refresh the page to get current price
                            <br />• Try the transaction again
                            <br />• Check if sale terms changed
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Gas estimation failed
                    if (errorMsg.includes('gas') || errorMsg.includes('execution')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            ⛽ <strong>Gas Estimation Failed</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Solutions:</strong>
                            <br />• Check network connectivity
                            <br />• Try again with higher gas limit
                            <br />• Wait for network congestion to reduce
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Contract not found or invalid
                    if (errorMsg.includes('contract') || errorMsg.includes('address')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            📋 <strong>Contract Issue</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Solutions:</strong>
                            <br />• Verify you're on the correct network
                            <br />• Check the contract address
                            <br />• Refresh the page
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Generic simulation error
                    return (
                      <Box>
                        <Text mb={2}>
                          ⚠️ <strong>Transaction Validation Error</strong>
                        </Text>
                        <Text fontSize='xs' mb={2} fontFamily='mono' bg='red.100' p={2} rounded='md' _dark={{ bg: 'red.800' }}>
                          {simulateError.message.slice(0, 200)}
                          {simulateError.message.length > 200 ? '...' : ''}
                        </Text>
                        <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                          <strong>Try:</strong>
                          <br />• Refresh the page and try again
                          <br />• Check your wallet connection
                          <br />• Verify contract parameters
                        </Text>
                      </Box>
                    );
                  })()}
                </Text>
              </Box>
            )}
            
            {/* Write/Transaction Errors */}
            {writeError && (
              <Box mb={3}>
                <Text color='red.600' fontSize='sm' fontWeight='semibold' mb={1} _dark={{ color: 'red.300' }}>
                  Transaction Submission Failed:
                </Text>
                <Text color='red.700' fontSize='sm' _dark={{ color: 'red.200' }}>
                  {(() => {
                    const errorMsg = writeError.message.toLowerCase();
                    
                    // User rejected
                    if (errorMsg.includes('user rejected') || errorMsg.includes('denied') || errorMsg.includes('cancelled')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            👤 <strong>Transaction Cancelled</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            You cancelled the transaction in your wallet. Click the mint button again to retry.
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Network/connection issues
                    if (errorMsg.includes('network') || errorMsg.includes('connection') || errorMsg.includes('timeout')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            🌐 <strong>Network Connection Issue</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Solutions:</strong>
                            <br />• Check your internet connection
                            <br />• Try switching networks in your wallet
                            <br />• Wait a moment and try again
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Generic write error
                    return (
                      <Box>
                        <Text mb={2}>
                          📝 <strong>Transaction Submission Error</strong>
                        </Text>
                        <Text fontSize='xs' mb={2} fontFamily='mono' bg='red.100' p={2} rounded='md' _dark={{ bg: 'red.800' }}>
                          {writeError.message.slice(0, 150)}
                          {writeError.message.length > 150 ? '...' : ''}
                        </Text>
                        <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                          Please try the transaction again or contact support if the issue persists.
                        </Text>
                      </Box>
                    );
                  })()}
                </Text>
              </Box>
            )}
            
            {/* Confirmation/Mining Errors */}
            {confirmError && (
              <Box mb={3}>
                <Text color='red.600' fontSize='sm' fontWeight='semibold' mb={1} _dark={{ color: 'red.300' }}>
                  Transaction Confirmation Failed:
                </Text>
                <Text color='red.700' fontSize='sm' _dark={{ color: 'red.200' }}>
                  {(() => {
                    const errorMsg = confirmError.message.toLowerCase();
                    
                    // Transaction reverted
                    if (errorMsg.includes('reverted') || errorMsg.includes('failed')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            🔄 <strong>Transaction Reverted</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            <strong>Possible causes:</strong>
                            <br />• Sale conditions changed during transaction
                            <br />• Someone else minted the remaining supply
                            <br />• Contract state changed
                            <br /><br />
                            <strong>Your funds are safe</strong> - try minting again.
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Timeout
                    if (errorMsg.includes('timeout') || errorMsg.includes('pending')) {
                      return (
                        <Box>
                          <Text mb={2}>
                            ⏱️ <strong>Transaction Timeout</strong>
                          </Text>
                          <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                            The transaction is taking longer than expected. It may still succeed.
                            <br />Check your wallet or block explorer for transaction status.
                          </Text>
                        </Box>
                      );
                    }
                    
                    // Generic confirmation error
                    return (
                      <Box>
                        <Text mb={2}>
                          ❌ <strong>Confirmation Error</strong>
                        </Text>
                        <Text fontSize='xs' mb={2} fontFamily='mono' bg='red.100' p={2} rounded='md' _dark={{ bg: 'red.800' }}>
                          {confirmError.message.slice(0, 150)}
                          {confirmError.message.length > 150 ? '...' : ''}
                        </Text>
                        <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                          Check your transaction status in your wallet or on the block explorer.
                        </Text>
                      </Box>
                    );
                  })()}
                </Text>
              </Box>
            )}
            
            {/* General troubleshooting tips */}
            <Box borderTop='1px' borderColor='red.300' pt={3} _dark={{ borderColor: 'red.600' }}>
              <Text color='red.600' fontSize='xs' fontWeight='semibold' mb={1} _dark={{ color: 'red.300' }}>
                💡 General Troubleshooting:
              </Text>
              <Text color='red.700' fontSize='xs' mb={3} _dark={{ color: 'red.200' }}>
                • Ensure your wallet is connected to the correct network
                <br />• Check that you have enough ETH for gas fees
                <br />• Try refreshing the page and reconnecting your wallet
                <br />• Contact support if errors persist
              </Text>
              
              {/* Clear errors button */}
              <Button
                size='sm'
                variant='outline'
                colorScheme='red'
                onClick={() => {
                  // This will trigger a re-render and potentially clear transient errors
                  window.location.reload();
                }}
              >
                🔄 Refresh Page & Try Again
              </Button>
            </Box>
          </Box>
        )}

        {isConfirmed && (
          <Text color='green.500' fontSize='sm' mt={2}>
            Successfully minted!
            {transactionHash && (
              <a
                href={`https://basescan.org/tx/${transactionHash}`}
                target='_blank'
                rel='noopener noreferrer'
                style={{ marginLeft: '4px', textDecoration: 'underline' }}
              >
                View on BaseScan
              </a>
            )}
          </Text>
        )}
      </Box>
    </Box>
  );
};
