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
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(null);
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

    if (!simulateData) {
      console.warn('Cannot mint: contract simulation failed or not ready');
      if (simulateError) {
        console.error('Simulation error:', simulateError);
      }
      return;
    }

    console.log('Starting mint process:', {
      contractAddress,
      quantity: mintQuantity,
      comment,
      totalValue: priceInfo.totalValue.toString(),
      totalInEth: priceInfo.totalInEth,
    });

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
    <Box borderWidth={1} display={"flex"} flexDir={"column"} alignItems='stretch' gap={3} rounded={"lg"} p={6} _dark={{ borderColor: 'yellow' }}>
      <HStack gap={2}>
        <FaShoppingCart size={24} color="#FFD700" />
        <Heading size="xl">Mint Droposal</Heading>
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
          disabled={!address || isWritePending || isConfirming || isPending || !salesConfig || !simulateData || isSimulateError}
        >
          {isConfirmed
            ? 'Collected!'
            : `Collect for ${
                salesConfig?.publicSalePrice
                  ? `${(salesConfig.publicSalePrice * mintQuantity).toFixed(3)} ETH${zoraFeeData.data ? ' + fees' : ''}`
                  : ''
              }`}
        </Button>

        {isSimulateError && simulateError && (
          <Box>
            <Text color='red.500' fontSize='sm' mt={2}>
              {simulateError.message.includes('insufficient funds') || 
               simulateError.message.includes('exceeds the balance') ? (
                <>
                  <strong>Insufficient funds</strong>
                  <br />
                  You need approximately <strong>{priceInfo ? priceInfo.totalInEth.toFixed(4) : 'N/A'} ETH</strong> to complete this transaction.
                  {balance && (
                    <>
                      <br />
                      Your balance: <strong>{Number(balance.formatted).toFixed(4)} ETH</strong>
                      <br />
                      <Text color='orange.500' fontSize='xs' mt={1}>
                        💡 Try reducing the quantity or add more ETH to your wallet.
                      </Text>
                    </>
                  )}
                </>
              ) : (
                `Simulation failed: ${simulateError.message.slice(0, 100)}${simulateError.message.length > 100 ? '...' : ''}`
              )}
            </Text>
          </Box>
        )}

        {writeError && (
          <Text color='red.500' fontSize='sm' mt={2}>
            Write failed: {writeError.message}
          </Text>
        )}

        {confirmError && (
          <Text color='red.500' fontSize='sm' mt={2}>
            Transaction failed: {confirmError.message}
          </Text>
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
