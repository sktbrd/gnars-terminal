'use client';

import {
  useWriteAuctionCreateBid,
  useWriteAuctionSettleCurrentAndCreateNewAuction,
} from '@/hooks/wagmiGenerated';
import { Button, Link as ChakraLink, HStack, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useCallback, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { NumberInputField, NumberInputRoot } from '../ui/number-input';
import { revalidatePath } from 'next/cache';

interface BidProps {
  tokenId: bigint;
  winningBid: bigint;
  isAuctionRunning: boolean;
}

// @todo Add behavior to autoupdate the auction after a new bid or settle

export function AuctionBid(props: BidProps) {
  const { tokenId, winningBid, isAuctionRunning } = props;
  const [txHash, setTxHash] = useState<string | null>(null);

  const account = useAccount();
  const [bidValue, setBidValue] = useState(
    formatEther(winningBid + parseEther('0.0001')).toString() || '0.0001'
  );

  const { writeContractAsync: writeBid } = useWriteAuctionCreateBid();
  const onClickBid = useCallback(async () => {
    try {
      const txHash = await writeBid({
        args: [tokenId],
        value: parseEther(bidValue),
      });
      setTxHash(txHash);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(`Error creating bid: ${error.message}`);
      } else {
        window.alert('Error creating bid');
      }
    }
  }, [writeBid, bidValue]);

  const { writeContractAsync: writeSettle } =
    useWriteAuctionSettleCurrentAndCreateNewAuction();
  const onClickSettle = useCallback(async () => {
    try {
      const txHash = await writeSettle({});
      setTxHash(txHash);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(`Error settling auction: ${error.message}`);
      } else {
        window.alert('Error settling auction');
      }
    }
  }, [writeSettle]);

  return (
    <VStack align={'stretch'} gap={0} w={'full'}>
      <HStack mt={4} w={'full'}>
        <NumberInputRoot
          maxW={{ md: '120px' }}
          w={'full'}
          defaultValue={bidValue}
          step={0.0001}
          onValueChange={(datails) => setBidValue(datails.value)}
          disabled={account.isDisconnected}
        >
          <NumberInputField />
        </NumberInputRoot>
        <Button
          variant={'subtle'}
          onClick={onClickBid}
          disabled={
            account.isDisconnected ||
            !isAuctionRunning ||
            parseEther(bidValue) < winningBid
          }
        >
          Bid
        </Button>
        {!isAuctionRunning && (
          <Button
            variant={'subtle'}
            onClick={onClickSettle}
            disabled={account.isDisconnected}
          >
            Settle
          </Button>
        )}
      </HStack>
      <HStack maxW={'full'}>
        {txHash && (
          <ChakraLink asChild>
            <NextLink href={`https://basescan.org/tx/${txHash}`}>
              Transaction: {txHash.slice(0, 4)}...{txHash.slice(-4)}
              <LuExternalLink />
            </NextLink>
          </ChakraLink>
        )}
      </HStack>
    </VStack>
  );
}
