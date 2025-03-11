'use client';

import {
  useReadAuctionMinBidIncrement,
  useWriteAuctionCreateBid,
  useWriteAuctionSettleCurrentAndCreateNewAuction,
} from '@/hooks/wagmiGenerated';
import { getConfig } from '@/utils/wagmi';
import { Link as ChakraLink, HStack, VStack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useCallback, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';
import useSound from 'use-sound';
import { parseEther, formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { Button } from '../ui/button';
import { NumberInputField, NumberInputRoot } from '../ui/number-input';
import { useForm } from 'react-hook-form';
import { FaEthereum } from 'react-icons/fa';

interface BidProps {
  tokenId: bigint;
  winningBid: bigint;
  isAuctionRunning: boolean;
  reservePrice: string;
  minimumBidIncrement: string;
  onBid?: () => void;
  onSettle?: () => void;
}

export function AuctionBid(props: BidProps) {
  const {
    tokenId,
    winningBid,
    isAuctionRunning,
    reservePrice,
    minimumBidIncrement,
  } = props;

  const [txHash, setTxHash] = useState<string | null>(null);
  const account = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [playSound] = useSound('/audio/cashier.mp3', { volume: 0.5 });

  // Calculate minimum bid value based on contract logic:
  // minBid = lastHighestBid + ((lastHighestBid * settings.minBidIncrement) / 100)
  const minBidValue =
    winningBid > 0n
      ? winningBid + (winningBid * BigInt(minimumBidIncrement)) / 100n
      : BigInt(reservePrice);

  const minBidValueEth = formatEther(minBidValue);

  console.log('winningBid', winningBid);
  console.log('minimumBidIncrement', minimumBidIncrement);
  console.log('reservePrice', reservePrice);
  console.log('reservePrice', reservePrice);
  console.log('minBidValue', minBidValue);
  console.log('minBidValueEth', minBidValueEth);

  // Set up form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      bidAmount: minBidValueEth,
    },
  });

  // Watch bid amount for validation
  const bidAmount = watch('bidAmount');

  // Set up contract interactions
  const { writeContractAsync: writeBid } = useWriteAuctionCreateBid();

  const onSubmitBid = useCallback(
    async (data: { bidAmount: string }) => {
      setIsLoading(true);
      try {
        const txHash = await writeBid({
          args: [tokenId],
          value: parseEther(data.bidAmount),
        });

        const receipt = await waitForTransactionReceipt(getConfig(), {
          hash: txHash,
        });

        console.log('Bid receipt', receipt);
        setTxHash(txHash);

        // Update bid amount for next bid using contract logic:
        // minBid = currentBid + ((currentBid * minBidIncrement) / 100)
        const currentBidInWei = parseEther(data.bidAmount);
        const incrementAmount =
          (currentBidInWei * BigInt(minimumBidIncrement)) / 100n;
        const newMinBidValue = currentBidInWei + incrementAmount;
        const newBidAmountEth = formatEther(newMinBidValue);

        if (props.onBid) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          props.onBid();
          setValue('bidAmount', newBidAmountEth);
          playSound();
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          window.alert(`Error creating bid: ${error.message}`);
        } else {
          window.alert('Error creating bid');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [tokenId, writeBid, props.onBid, playSound, minimumBidIncrement, setValue]
  );

  const { writeContractAsync: writeSettle } =
    useWriteAuctionSettleCurrentAndCreateNewAuction();

  const onClickSettle = useCallback(async () => {
    setIsLoading(true);
    try {
      const txHash = await writeSettle({});
      const receipt = await waitForTransactionReceipt(getConfig(), {
        hash: txHash,
        confirmations: 2,
      });
      console.log('Settle receipt', receipt);
      setTxHash(txHash);
      if (props.onSettle) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        props.onSettle();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(`Error settling auction: ${error.message}`);
      } else {
        window.alert('Error settling auction');
      }
    } finally {
      setIsLoading(false);
    }
  }, [writeSettle, props.onSettle]);

  return (
    <VStack align={'stretch'} gap={0} w={'full'}>
      <VStack w={'100%'} align={'stretch'} gap={2}>
        {isAuctionRunning ? (
          <form onSubmit={handleSubmit(onSubmitBid)} style={{ width: '100%' }}>
            <VStack align={'stretch'} gap={2}>
              {errors.bidAmount && (
                <Text color='red.500' fontSize='sm'>
                  {errors.bidAmount.message}
                </Text>
              )}
              <HStack w={'100%'}>
                <FaEthereum size={24} />
                <NumberInputRoot
                  w={'100%'}
                  fontFamily={'mono'}
                  size={'lg'}
                  step={0.01}
                  defaultValue={Number(minBidValueEth).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 9,
                    }
                  )}
                >
                  <NumberInputField
                    {...register('bidAmount', {
                      required: 'Bid amount is required',
                      min: {
                        value: parseFloat(minBidValueEth),
                        message: `Minimum bid is ${Number(
                          minBidValueEth
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 9,
                        })} ETH`,
                      },
                      validate: (value) => {
                        if (isNaN(Number(value)))
                          return 'Must be a valid number';
                        return true;
                      },
                    })}
                    disabled={account.isDisconnected}
                  />
                </NumberInputRoot>
              </HStack>
              <Button
                variant={'surface'}
                type='submit'
                disabled={
                  account.isDisconnected ||
                  !isAuctionRunning ||
                  parseEther(bidAmount || '0') < minBidValue ||
                  !!errors.bidAmount
                }
                loading={isLoading}
              >
                Place Bid
              </Button>
            </VStack>
          </form>
        ) : (
          <Button
            variant={'surface'}
            onClick={onClickSettle}
            disabled={account.isDisconnected}
            w={'full'}
            loading={isLoading}
          >
            Start next auction
          </Button>
        )}
      </VStack>
      {txHash && (
        <HStack
          maxW={'full'}
          fontSize={'sm'}
          w={'full'}
          justify={'center'}
          mt={2}
        >
          <ChakraLink asChild>
            <NextLink
              href={`https://basescan.org/tx/${txHash}`}
              target='_blank'
            >
              Transaction: {txHash.slice(0, 4)}...{txHash.slice(-4)}{' '}
              <LuExternalLink style={{ display: 'inline' }} />
            </NextLink>
          </ChakraLink>
        </HStack>
      )}
    </VStack>
  );
}
