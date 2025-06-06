'use client';

import { useLastAuction } from '@/hooks/auction';
import { Auction } from '@/services/auction';
import { weiToSparks } from '@/utils/spark';
import {
  Badge,
  Box,
  Heading,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { default as NextImage } from 'next/image';
import Countdown from 'react-countdown';
import { BsEmojiAstonished } from 'react-icons/bs';
import { FaBirthdayCake, FaEthereum, FaUser } from 'react-icons/fa';
import { LuClock, LuSparkles } from 'react-icons/lu';
import { formatEther } from 'viem';
import { AuctionBid } from '../auction/bid';
import { FormattedAddress } from '../utils/names';
import { useMemo } from 'react';

export default function AuctionCard({
  defaultAuction,
}: {
  defaultAuction: Auction;
}) {
  const { data: activeAuction, refetch } = useLastAuction(defaultAuction);

  if (!activeAuction) {
    return (
      <VStack
        shadow={'none'}
        w={'full'}
        height='full'
        padding={4}
        rounded={'md'}
        gap={4}
        _dark={{ borderColor: 'none', borderWidth: 0 }}
      >
        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          align={'start'}
          justify={'space-between'}
          w={'full'}
        >
          <VStack align={'stretch'} gap={2} w={'full'}>
            <Heading as='h2'>
              <Skeleton height='40px' width='160px' />
            </Heading>
            <Text>
              <Skeleton height='20px' width='100px' />
            </Text>
            <Text>
              <Skeleton height='20px' width='80px' />
            </Text>
          </VStack>
          <Skeleton
            rounded={'md'}
            w={'full'}
            maxW={{ md: '240px' }}
            height='240px'
          />
        </Stack>
      </VStack>
    );
  }

  // Memoize expensive calculations
  const { auctionEndTime, formattedBidAmount, formattedEndDate } =
    useMemo(() => {
      const endTime = parseInt(activeAuction.endTime) * 1000;
      const endDate = new Date(endTime);

      const bidAmount = activeAuction.highestBid
        ? Number(
            formatEther(BigInt(activeAuction.highestBid.amount))
          ).toLocaleString(undefined, {
            maximumFractionDigits: 5,
          })
        : null;

      const endDateFormatted = endDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      return {
        auctionEndTime: endTime,
        formattedBidAmount: bidAmount,
        formattedEndDate: endDateFormatted,
      };
    }, [activeAuction.endTime, activeAuction.highestBid?.amount]);

  const isRunning = useMemo(
    () => auctionEndTime > Date.now(),
    [auctionEndTime]
  );

  console.log({ activeAuction });

  return (
    <VStack
      shadow={'sm'}
      w={'full'}
      height='full'
      padding={4}
      rounded={'md'}
      gap={4}
      _dark={{ borderColor: 'primary', borderWidth: 1 }}
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        align={'start'}
        justify={'space-between'}
        w={'full'}
      >
        <Image
          asChild
          rounded={'md'}
          w={'full'}
          height={'100%'}
          mt={0.5}
          maxW={{ md: '55%' }}
        >
          <NextImage
            width={1024}
            height={1024}
            src={activeAuction.token.image}
            alt={`Auction token id ${activeAuction.token.tokenId}`}
          />
        </Image>
        <VStack align={'stretch'} gap={2} w={'full'} h={'full'}>
          <VStack align={'start'} gap={1} h={'full'}>
            <Heading as='h2' fontSize={'2xl'} mt={'auto'} mb={2}>
              Auction #{activeAuction.token.tokenId}
            </Heading>
            {activeAuction.highestBid ? (
              <>
                <HStack gap={1}>
                  <FaUser size={12} />
                  <FormattedAddress
                    address={activeAuction.highestBid.bidder}
                    textBefore={isRunning ? 'Winning' : 'Winner'}
                  />
                </HStack>
                <HStack gap={1}>
                  <FaEthereum size={12} style={{ scale: '1.3' }} />
                  <Text>Highest bid </Text>
                  <Badge colorPalette={'blue'} variant={'surface'} size={'sm'}>
                    {formattedBidAmount} ETH
                  </Badge>
                </HStack>
                {isRunning ? (
                  <HStack gap={1}>
                    <LuClock size={12} />
                    <Text>
                      Time left{' '}
                      <Countdown date={auctionEndTime} daysInHours={false} />
                    </Text>
                  </HStack>
                ) : (
                  <HStack gap={1}>
                    <FaBirthdayCake size={12} />
                    <Text>Born at {formattedEndDate}</Text>
                  </HStack>
                )}
              </>
            ) : isRunning ? (
              <HStack gap={1}>
                <LuSparkles size={12} />
                <Text>Place the first bid</Text>
              </HStack>
            ) : (
              <HStack gap={1}>
                <BsEmojiAstonished size={12} />
                <Text>No bids</Text>
              </HStack>
            )}
          </VStack>
          <Box mt={4}>
            <AuctionBid
              tokenId={BigInt(activeAuction.token.tokenId)}
              winningBid={
                activeAuction.highestBid
                  ? BigInt(activeAuction.highestBid.amount)
                  : 0n
              }
              isAuctionRunning={isRunning}
              reservePrice={activeAuction.dao.auctionConfig.reservePrice}
              minimumBidIncrement={
                activeAuction.dao.auctionConfig.minimumBidIncrement
              }
              onBid={refetch}
              onSettle={refetch}
            />
          </Box>
        </VStack>
      </Stack>
    </VStack>
  );
}
