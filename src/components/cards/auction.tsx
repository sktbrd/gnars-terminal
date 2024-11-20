import {
  useReadAuctionAuction,
  useWriteAuctionCreateBid,
  useWriteAuctionSettleCurrentAndCreateNewAuction,
} from '@/hooks/wagmiGenerated';
import {
  Box,
  Button,
  Link as ChakraLink,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useCallback, useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { mainnet } from 'viem/chains';
import { useAccount, useEnsName } from 'wagmi';
import { NumberInputField, NumberInputRoot } from '../ui/number-input';
import { LuExternalLink } from 'react-icons/lu';

export default function AuctionCard() {
  const [txHash, setTxHash] = useState<string | null>(null);

  const account = useAccount();
  const { data: wagmiAuction } = useReadAuctionAuction();

  const tokenId = wagmiAuction ? wagmiAuction[0] : 0n;
  const winningBid = wagmiAuction ? wagmiAuction[1] : 0n;
  const winningBidder = wagmiAuction ? wagmiAuction[2] : undefined;
  const auctionStartTime = wagmiAuction ? wagmiAuction[3] * 1000 : 0;
  const auctionEndTime = wagmiAuction ? wagmiAuction[4] * 1000 : 0;

  const isAuctionRunning = auctionEndTime ? auctionEndTime > Date.now() : false;

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
            disabled={!isAuctionRunning || parseEther(bidValue) < winningBid}
          >
            Bid
          </Button>
          <Button
            variant={'subtle'}
            onClick={onClickSettle}
            visibility={isAuctionRunning ? 'hidden' : 'visible'}
          >
            Settle
          </Button>
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
    </Box>
  );
}
