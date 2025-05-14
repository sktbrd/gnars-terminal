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
};

const MintButton = ({
  quantity = 1,
  comment = '',
  salesConfig: propSalesConfig,
}: MintButtonProps) => {
  const { tokenCreated } = useProposal();
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

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

  useEffect(() => {
    if (zoraFeeData.data) {
      console.log('[MintButton] Zora fee data:', {
        recipient: zoraFeeData.data[0],
        fee: zoraFeeData.data[1],
      });
    }
  }, [zoraFeeData.data]);

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

  const handleMint = async () => {
    if (!tokenCreated || !address) {
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
      console.warn('[MintButton] Cannot mint: salesConfig data not loaded yet');
      return;
    }

    if (!zoraFeeData.data) {
      console.warn('[MintButton] Cannot mint: Zora fee data not loaded yet');
      return;
    }

    if (pricePerToken <= 0) {
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

      console.log(
        '[MintButton] writeContract call completed, waiting for transaction...'
      );
    } catch (err) {
      console.error('[MintButton] Exception during mint:', err);

      if (err instanceof Error) {
        console.error('[MintButton] Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          cause: err.cause,
        });

        if (err.message.includes('Purchase_WrongPrice')) {
          const correctPriceMatch = err.message.match(/correctPrice: (\d+)/);
          const correctPrice = correctPriceMatch
            ? BigInt(correctPriceMatch[1])
            : null;

          console.error('[MintButton] Price mismatch detected:', {
            providedPrice: parseEther(totalPrice.toString()),
            correctPrice,
          });
        }
      }
    } finally {
      setIsPending(false);
      console.log(
        '[MintButton] Mint process completed, isPending set to false'
      );
    }
  };

  useEffect(() => {
    if (hash) {
      console.log('[MintButton] Transaction hash received:', hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isConfirmed) {
      console.log('[MintButton] Transaction confirmed successfully!');
    }
  }, [isConfirmed]);

  return (
    <div className='flex flex-col gap-4'>
      <Button
        onClick={handleMint}
        disabled={!tokenCreated || isLoading || !effectiveSalesConfig}
        aria-label='Mint NFT'
        className='w-full'
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
    </div>
  );
};

export default MintButton;
