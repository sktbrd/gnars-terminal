'use client';
import { useState } from 'react';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import useTreasure from '../../hooks/useTreasure';
import styles from '@/components/treasure/TreasurePage.module.css';
import NFTSection from '@/components/treasure/NFTSection';
import TokensSection from '@/components/treasure/TokensSection';
import { FormattedAddress } from '@/components/utils/names';
import { formatBalance } from '@/utils/helpers';
import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from '@/components/ui/skeleton';

const WalletPage = ({ address }: { address: string }) => {
  const { tokens, totalBalance, totalNetWorth, isLoading, error, nfts } =
    useTreasure(address);
  const [hideLowBalance, setHideLowBalance] = useState(true);

  const sortedTokens = tokens.sort(
    (a, b) => b.token.balanceUSD - a.token.balanceUSD
  );
  const filteredTokens = hideLowBalance
    ? sortedTokens.filter((token) => token.token.balanceUSD >= 10)
    : sortedTokens;

  const sortedNfts = nfts.sort((a, b) => {
    const aHasImage =
      a.token.medias && a.token.medias.length > 0 && a.token.medias[0].url;
    const bHasImage =
      b.token.medias && b.token.medias.length > 0 && b.token.medias[0].url;
    return Number(bHasImage) - Number(aHasImage);
  });

  if (isLoading) {
    return (
      <Box className={styles.container}>
        {/* Header Section Skeleton */}
        <Box
          className={styles.netWorthCard}
          p={4}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          boxShadow='md'
          textAlign='center'
        >
          <Flex
            direction={['column', 'row']}
            justify='space-between'
            align='center'
            wrap='wrap'
          >
            <Flex className={styles.profile} align='center' mb={[4, 0]}>
              <SkeletonCircle size='10' />
              <Skeleton height='20px' width='150px' ml='4' />
            </Flex>
            <Box
              mb={[4, 0]}
              textAlign={['center', 'left']}
              display={['none', 'block']}
            >
              <Skeleton height='20px' width='100px' />
              <Skeleton height='30px' width='200px' mt='2' />
            </Box>
            <Box textAlign={['center', 'right']}>
              <Skeleton height='20px' width='100px' />
              <Skeleton height='30px' width='200px' mt='2' />
            </Box>
          </Flex>
        </Box>
        {/* Wallet Section Skeleton */}
        <Box mt='4'>
          <Skeleton height='40px' mb='4' />
          <SkeletonText mt='4' noOfLines={4} gap='4' />
        </Box>
        {/* NFTs Section Skeleton */}
        <Box mt='4'>
          <Skeleton height='40px' mb='4' />
          <SkeletonText mt='4' noOfLines={4} gap='4' />
        </Box>
      </Box>
    );
  }
  if (error) return <Text>{error}</Text>;

  return (
    <Box className={styles.container}>
      {/* Header Section */}
      <Box
        className={styles.netWorthCard}
        p={4}
        borderWidth='1px'
        borderRadius='lg'
        overflow='hidden'
        boxShadow='md'
        textAlign='center'
      >
        <Flex
          direction={['column', 'row']}
          justify='space-between'
          align='center'
          wrap='wrap'
        >
          <Flex className={styles.profile} align='center' mb={[4, 0]}>
            <Image
              src='/images/ethereum.png'
              alt='User Avatar'
              className={styles.avatar}
            />
            <FormattedAddress address={address} />
          </Flex>
          <Box
            mb={[4, 0]}
            textAlign={['center', 'left']}
            display={['none', 'block']}
          >
            <Text fontSize='xl' fontWeight='bold'>
              Net Worth
            </Text>
            <Heading as='h2' size='xl'>
              ${formatBalance(totalNetWorth)}
            </Heading>
          </Box>
          <Box textAlign={['center', 'right']}>
            <Text fontSize='xl' fontWeight='bold'>
              Total Balance
            </Text>
            <Heading as='h2' size='xl'>
              ${formatBalance(totalBalance)}
            </Heading>
          </Box>
        </Flex>
      </Box>
      {/* Wallet Section */}
      <TokensSection
        tokens={filteredTokens}
        totalBalance={totalBalance}
        hideLowBalance={hideLowBalance}
        setHideLowBalance={setHideLowBalance}
      />
      {/* NFTs Section */}
      <NFTSection nfts={sortedNfts} />
    </Box>
  );
};

export default WalletPage;
