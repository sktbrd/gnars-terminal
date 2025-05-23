import { useState } from 'react';
import {
  Box,
  Flex,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, Address } from 'viem';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { SalesConfig, PriceInfo } from './types';
import { Button } from '../ui/button';

interface MintSectionProps {
  address: Address | undefined;
  contractAddress: Address;
  salesConfig: SalesConfig | undefined;
  zoraFeeData: any; // Using any for simplification
}

export const MintSection: React.FC<MintSectionProps> = ({
  address,
  contractAddress,
  salesConfig,
  zoraFeeData,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(null);
  const [isPending, setIsPending] = useState(false);

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
      quantity >= salesConfig.maxSalePurchasePerAddress
    ) {
      return; // Don't exceed max purchase limit
    }
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  // Calculate the total price including protocol fee
  const calculateTotalPrice = (): PriceInfo | null => {
    if (!salesConfig || !zoraFeeData.data) return null;

    // Get price per token from salesConfig
    const pricePerTokenInWei = salesConfig.publicSalePrice
      ? parseEther(salesConfig.publicSalePrice.toString())
      : 0n;

    // Calculate mint price (price per token * quantity)
    const mintPrice = pricePerTokenInWei * BigInt(quantity);

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

    const priceInfo = calculateTotalPrice();
    if (!priceInfo) {
      console.warn('Cannot mint: price information not available');
      return;
    }

    console.log('Starting mint process:', {
      contractAddress,
      quantity,
      comment,
      totalValue: priceInfo.totalValue.toString(),
      totalInEth: priceInfo.totalInEth,
    });

    setIsPending(true);
    try {
      writeContract({
        address: contractAddress,
        abi: zoraMintAbi,
        functionName: 'purchaseWithComment',
        args: [BigInt(quantity), comment],
        value: priceInfo.totalValue,
      });
    } catch (err) {
      console.error('Exception during mint:', err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box borderWidth={1} display={"flex"} flexDir={"column"} alignItems='stretch' gap={3} rounded={"lg"} p={6} _dark={{ borderColor: 'yellow' }}>
      {/* Quantity Selector */}
      <Box>
        <Text fontWeight='bold' mb={2}>
          Quantity
        </Text>
        <Flex align='center'>
          <Button
            onClick={handleDecreaseQuantity}
            disabled={quantity <= 1}
            size='sm'
          >
            -
          </Button>
          <Text mx={4} fontWeight='bold'>
            {quantity}
          </Text>
          <Button
            onClick={handleIncreaseQuantity}
            disabled={
              salesConfig?.maxSalePurchasePerAddress
                ? quantity >= salesConfig.maxSalePurchasePerAddress
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

      {/* Mint Button */}
      <Box>
        <Button
          colorScheme='blue'
          size='lg'
          width='100%'
          onClick={handleMint}
          loading={isWritePending || isConfirming || isPending}
          disabled={!address || isWritePending || isConfirming || isPending || !salesConfig}
        >
          {isConfirmed
            ? 'Collected!'
            : `Collect for ${
                salesConfig?.publicSalePrice
                  ? `${(salesConfig.publicSalePrice * quantity).toFixed(3)} ETH${zoraFeeData.data ? ' + fees' : ''}`
                  : ''
              }`}
        </Button>

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
