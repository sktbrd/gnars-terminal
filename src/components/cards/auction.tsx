import { fetchAuction } from '@/services/auction';
import { DAO_ADDRESSES } from '@/utils/constants';
import {
  Badge,
  Box,
  Heading,
  Image,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { default as NextImage } from 'next/image';
import { formatEther } from 'viem';
import { AuctionBid } from '../auction/bid';
import { FormattedAddress } from '../utils/ethereum';

export default async function AuctionCard() {
  const auctions = await fetchAuction(
    DAO_ADDRESSES.token,
    'endTime',
    'desc',
    1
  );
  const activeAuction = auctions[0];

  return (
    <VStack
      shadow={'sm'}
      w={'full'}
      padding={4}
      rounded={'md'}
      gap={4}
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        align={'start'}
        justify={'space-between'}
        w={'full'}
      >
        <VStack align={'stretch'} gap={0} w={'full'}>
          <Heading as='h2'>Auction #{activeAuction.token.tokenId}</Heading>
          {activeAuction.highestBid ? (
            <>
              <Text>
                Highest bid:{' '}
                <Badge colorPalette={'blue'} variant={'surface'}>
                  {formatEther(activeAuction.highestBid.amount)} ETH
                </Badge>
              </Text>
              <FormattedAddress
                address={activeAuction.highestBid.bidder}
                textBefore='Highest bidder: '
              />
            </>
          ) : (
            <Text>No bids yet</Text>
          )}
          <AuctionBid
            tokenId={activeAuction.token.tokenId}
            winningBid={
              activeAuction.winningBid
                ? BigInt(activeAuction.winningBid.amount)
                : 0n
            }
            isAuctionRunning={
              parseInt(activeAuction.endTime) * 1000 > Date.now()
            }
          />
        </VStack>
        <Image asChild rounded={'md'} w={'full'} maxW={{ md: '240px' }}>
          <NextImage
            width={240}
            height={240}
            src={activeAuction.token.image}
            alt={`Auction token id ${activeAuction.token.tokenId}`}
          />
        </Image>
      </Stack>
      <Box
        overflow={'auto'}
        p={4}
        borderWidth={1}
        borderRadius={'md'}
        bg={'bg.subtle'}
        maxH={'240px'}
        maxW={'full'}
      >
        <pre>{JSON.stringify(auctions, null, 2)}</pre>
      </Box>
    </VStack>
  );
}
