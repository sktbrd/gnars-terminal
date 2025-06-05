import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from 'wagmi';
import { Address, parseEther } from 'viem';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { useProposal } from '@/contexts/ProposalContext';

type MintButtonProps = {
  quantity?: number;
  comment: string;
  salesConfig?: {
    publicSalePrice: number;
    maxSalePurchasePerAddress: number;
    publicSaleStart: number;
    publicSaleEnd: number;
    presaleStart: number;
    presaleEnd: number;
    presaleMerkleRoot: string;
  };
  onError?: (error: { title: string; message: string } | null) => void;
  disabled?: boolean;
};

const MintButton = ({
  quantity = 1,
  comment = '',
  salesConfig: propSalesConfig,
  onError,
  disabled,
}: MintButtonProps) => {
  const { tokenCreated } = useProposal();
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  // Add error state to track and display errors
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null
  );

  const contractSalesConfig = useReadContract({
    address: tokenCreated as Address,
    abi: zoraMintAbi,
    functionName: 'salesConfig',
    args: [],
  });

  const effectiveSalesConfig = useMemo(() => {
    if (contractSalesConfig.data && contractSalesConfig.data.length > 0) {
      const pricePerTokenInWei = contractSalesConfig.data[0] as bigint;
      const config = {
        publicSalePrice: Number(pricePerTokenInWei) / 1e18,
        maxSalePurchasePerAddress: contractSalesConfig.data[1],
        publicSaleStart: Number(contractSalesConfig.data[2]),
        publicSaleEnd: Number(contractSalesConfig.data[3]),
        presaleStart: Number(contractSalesConfig.data[4]),
        presaleEnd: Number(contractSalesConfig.data[5]),
        presaleMerkleRoot: contractSalesConfig.data[6],
      };
      return config;
    }

    return propSalesConfig;
  }, [contractSalesConfig.data, propSalesConfig]);

  const pricePerToken = effectiveSalesConfig?.publicSalePrice ?? 0;
  const totalPrice = pricePerToken * quantity;

  const zoraFeeData = useReadContract({
    address: tokenCreated as Address,
    abi: zoraMintAbi,
    functionName: 'zoraFeeForAmount',
    args: [BigInt(quantity)],
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
  } = useWaitForTransactionReceipt({
    hash,
  });

  const isLoading = isWritePending || isConfirming || isPending;

  // Add an error processing function to handle different error types
  const processError = (err: unknown) => {
    console.error('[MintButton] Error:', err);

    // Clear any previous errors
    setError(null);

    if (!err) return;

    let errorObj: { title: string; message: string } | null = null;

    if (typeof err === 'string') {
      errorObj = {
        title: 'Mint Failed',
        message: err,
      };
    } else if (err instanceof Error) {
      const errorMessage = err.message;

      // Handle specific Zora contract errors
      if (errorMessage.includes('Purchase_WrongPrice')) {
        const correctPriceMatch = errorMessage.match(/correctPrice: (\d+)/);
        const correctPrice = correctPriceMatch
          ? BigInt(correctPriceMatch[1])
          : null;

        errorObj = {
          title: 'Price Error',
          message: correctPrice
            ? `The price has changed. Please try again.`
            : 'The price provided is incorrect. Please try again.',
        };

        console.error('[MintButton] Price mismatch detected:', {
          providedPrice: parseEther(totalPrice.toString()),
          correctPrice,
        });
      } else if (errorMessage.includes('Sale_Inactive')) {
        errorObj = {
          title: 'Sale Not Active',
          message: 'The sale is not currently active. Please check back later.',
        };
      } else if (errorMessage.includes('Purchase_TooManyForAddress')) {
        errorObj = {
          title: 'Purchase Limit Reached',
          message:
            'You have reached the maximum purchase limit for this address.',
        };
      } else if (errorMessage.includes('insufficient funds')) {
        errorObj = {
          title: 'Insufficient Funds',
          message: 'You do not have enough ETH to complete this purchase.',
        };
      } else if (errorMessage.includes('user rejected transaction')) {
        // For user rejections, we want to clear the error after a short delay
        // so the user can try again immediately
        errorObj = {
          title: 'Transaction Cancelled',
          message: 'You cancelled the transaction.',
        };
        
        // Clear the error after 2 seconds to allow immediate retry
        setTimeout(() => {
          setError(null);
          if (onError) onError(null);
        }, 2000);
      } else {
        // Default error handling
        errorObj = {
          title: 'Mint Failed',
          message:
            err.message.slice(0, 100) + (err.message.length > 100 ? '...' : ''),
        };
      }
    } else {
      // Handle non-Error objects
      errorObj = {
        title: 'Mint Failed',
        message: 'An unknown error occurred. Please try again.',
      };
    }

    // Set local error state
    setError(errorObj);

    // Also pass the error to the parent component if callback exists
    if (onError) {
      onError(errorObj);
    }
  };

  const handleMint = async () => {
    // Clear any previous errors
    setError(null);
    if (onError) onError(null);

    if (!tokenCreated || !address) {
      const errorObj = {
        title: 'Cannot Mint',
        message: 'Missing token contract or wallet connection.',
      };
      setError(errorObj);
      if (onError) onError(errorObj);
      console.warn(
        '[MintButton] Cannot mint: missing tokenCreated or user address',
        {
          tokenCreated,
          address,
        }
      );
      return;
    }

    if (!effectiveSalesConfig) {
      setError({
        title: 'Cannot Mint',
        message: 'Sales configuration not loaded yet. Please try again.',
      });
      console.warn('[MintButton] Cannot mint: salesConfig data not loaded yet');
      return;
    }

    if (!zoraFeeData.data) {
      setError({
        title: 'Cannot Mint',
        message: 'Fee data not loaded yet. Please try again.',
      });
      console.warn('[MintButton] Cannot mint: Zora fee data not loaded yet');
      return;
    }

    if (pricePerToken <= 0) {
      setError({
        title: 'Invalid Price',
        message: 'The token price is invalid.',
      });
      console.error('[MintButton] Invalid price per token:', pricePerToken);
      return;
    }

    setIsPending(true);
    try {
      const zoraProtocolFee = zoraFeeData.data[1] as bigint;
      const mintPrice = BigInt(parseEther(totalPrice.toString()));
      const totalValue = zoraProtocolFee + mintPrice;

      writeContract({
        address: tokenCreated as Address,
        abi: zoraMintAbi,
        functionName: 'purchaseWithComment',
        args: [BigInt(quantity), comment],
        value: totalValue,
      });
    } catch (err) {
      processError(err);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (writeError) {
      processError(writeError);
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      processError(confirmError);
    }
  }, [confirmError]);

  useEffect(() => {
    if (hash) {
      // Clear any previous errors when we get a transaction hash
      setError(null);
      if (onError) onError(null);
    }
  }, [hash, onError]);

  useEffect(() => {
    if (isConfirmed) {
      // Clear any previous errors when transaction is confirmed
      setError(null);
      if (onError) onError(null);
    }
  }, [isConfirmed, onError]);

  return (
    <Button
      onClick={handleMint}
      disabled={!tokenCreated || isLoading || !effectiveSalesConfig || disabled}
      aria-label='Mint NFT'
      flex={1}
    >
      {isLoading
        ? isConfirming
          ? 'Confirming...'
          : 'Minting...'
        : isConfirmed
          ? 'Minted!'
          : 'Mint'}
      {quantity > 1 ? ` (${quantity})` : ''}
    </Button>
  );
};

export default MintButton;
