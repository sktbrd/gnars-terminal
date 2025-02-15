'use client';

import {
  useWriteAuctionCreateBid,
  useWriteAuctionSettleCurrentAndCreateNewAuction,
} from '@/hooks/wagmiGenerated';
import { convertSparksToEth } from '@/utils/spark';
import { getConfig } from '@/utils/wagmi';
import { Link as ChakraLink, HStack, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useCallback, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';
import useSound from 'use-sound';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { Button } from '../ui/button';
import { NumberInputField, NumberInputRoot } from '../ui/number-input';
import { Tooltip } from '../ui/tooltip';

interface BidProps {
  tokenId: bigint;
  winningBid: bigint;
  isAuctionRunning: boolean;
  onBid?: () => void;
  onSettle?: () => void;
}

// @todo Add behavior to autoupdate the auction after a new bid or settle

export function AuctionBid(props: BidProps) {
  const { tokenId, winningBid, isAuctionRunning } = props;
  const [txHash, setTxHash] = useState<string | null>(null);

  const account = useAccount();
  const [bidValue, setBidValue] = useState('111111');
  const [isLoading, setIsLoading] = useState(false);

  const [playSound] = useSound('/audio/cashier.mp3', { volume: 0.5 });

  const { writeContractAsync: writeBid } = useWriteAuctionCreateBid();
  const onClickBid = useCallback(async () => {
    setIsLoading(true);
    try {
      const txHash = await writeBid({
        args: [tokenId],
        value: parseEther(convertSparksToEth(bidValue)),
      });
      const receipt = await waitForTransactionReceipt(getConfig(), {
        hash: txHash,
      });
      console.log('Bid receipt', receipt);
      setTxHash(txHash);
      if (props.onBid) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        props.onBid();
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
  }, [tokenId, writeBid, bidValue]);

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
  }, [tokenId, writeSettle]);

  return (
    <VStack align={'stretch'} gap={0} w={'full'}>
      <VStack w={'100%'} align={'stretch'} gap={2}>
        {isAuctionRunning ? (
          <>
            <HStack w={'100%'}>
              <Tooltip
                showArrow
                content='Sparks'
                openDelay={0}
                closeDelay={300}
              >
                <ChakraLink
                  asChild
                  variant={'plain'}
                  fontWeight={'bold'}
                  fontSize={'2xl'}
                >
                  <NextLink
                    target='_blank'
                    href={'https://zora.co/writings/sparks'}
                  >
                    ✧
                  </NextLink>
                </ChakraLink>
              </Tooltip>
              <NumberInputRoot
                w={'100%'}
                fontFamily={'mono'}
                size={'lg'}
                defaultValue={bidValue}
                step={111111}
                onValueChange={(datails) => setBidValue(datails.value)}
                disabled={account.isDisconnected}
                min={0}
              >
                <NumberInputField />
              </NumberInputRoot>
            </HStack>
            <Button
              variant={'surface'}
              onClick={onClickBid}
              disabled={
                account.isDisconnected ||
                !isAuctionRunning ||
                parseEther(bidValue) < winningBid
              }
              loading={isLoading}
            >
              Place Bid
            </Button>
          </>
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
            <NextLink href={`https://basescan.org/tx/${txHash}`}>
              Transaction: {txHash.slice(0, 4)}...{txHash.slice(-4)}
              <LuExternalLink />
            </NextLink>
          </ChakraLink>
        </HStack>
      )}
    </VStack>
  );
}
