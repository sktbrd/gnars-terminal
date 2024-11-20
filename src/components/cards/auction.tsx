import {
  useReadAuctionAuction,
  useWriteAuctionCreateBid,
  useWriteAuctionSettleCurrentAndCreateNewAuction,
} from '@/hooks/wagmiGenerated';
import { Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { mainnet } from 'viem/chains';
import { useAccount, useEnsName } from 'wagmi';
import { NumberInputField, NumberInputRoot } from '../ui/number-input';

export default function AuctionCard() {
  const account = useAccount();
  const { data: wagmiAuction } = useReadAuctionAuction();

  const tokenId = wagmiAuction ? wagmiAuction[0] : 0n;
  const winningBid = wagmiAuction ? wagmiAuction[1] : 0n;
  const winningBidder = wagmiAuction ? wagmiAuction[2] : undefined;
  const auctionStartTime = wagmiAuction ? wagmiAuction[3] : 0;
  const auctionEndTime = wagmiAuction ? wagmiAuction[4] : 0;

  const isAuctionRunning = wagmiAuction
    ? wagmiAuction[5] || auctionEndTime > Date.now()
    : false;

  const [bidValue, setBidValue] = useState(
    formatEther(winningBid + parseEther('0.0001')).toString() || '0.0001'
  );

  const { data: ensName } = useEnsName({
    address: winningBidder,
    chainId: mainnet.id,
  });

  const { writeContractAsync: writeBid } = useWriteAuctionCreateBid();
  const onClickBid = useCallback(async () => {
    try {
      const res = await writeBid({
        args: [tokenId],
        value: parseEther(bidValue),
      });
      console.log(res);
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
      const res = await writeSettle({});
      console.log(res);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(`Error settling auction: ${error.message}`);
      } else {
        window.alert('Error settling auction');
      }
    }
  }, [writeSettle]);

  if (account.isDisconnected) {
    return null;
  }

  return (
    <Box shadow={'sm'} w={'full'} padding={4} rounded={'md'}>
      <VStack gap={4} align={'start'}>
        <VStack align={'start'}>
          <Heading as='h2'>Auction #{tokenId.toString()}</Heading>
          <Text>Highest bid: {formatEther(winningBid)} ETH</Text>
          <Text>Highest bidder: {ensName ? ensName : winningBidder}</Text>
        </VStack>
        <HStack>
          <NumberInputRoot
            maxW='200px'
            defaultValue={bidValue}
            step={0.0001}
            onValueChange={(datails) => setBidValue(datails.value)}
          >
            <NumberInputField />
          </NumberInputRoot>
          <Button
            variant={'subtle'}
            onClick={onClickBid}
            disabled={!isAuctionRunning || parseEther(bidValue) < minBidValue}
          >
            Bid
          </Button>
          <Button
            variant={'subtle'}
            onClick={onClickSettle}
            disabled={isAuctionRunning}
          >
            Settle
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
