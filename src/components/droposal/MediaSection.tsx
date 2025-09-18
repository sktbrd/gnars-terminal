import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { useMemo } from 'react';
import { getImageUrl } from './droposalUtils';
import { EthVolumeInfo, TokenMetadata } from './types';

interface MediaSectionProps {
  metadata: TokenMetadata | null;
  loading: boolean;
  error: string | null;
  ethVolumeInfo: EthVolumeInfo;
  noTokensYet?: boolean;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  metadata,
  loading,
  error,
  ethVolumeInfo,
  noTokensYet = false,
}) => {
  // Handle loading states
  if (loading) {
    return (
      <Flex justify='center' align='center' minH='50vh'>
        <Spinner size='xl' />
        <Text ml={4}>Loading token data...</Text>
      </Flex>
    );
  }

  // Handle errors
  if (error) {
    return (
      <Box bg='red.50' p={5} borderRadius='md'>
        <Text fontSize='xl' color='red.500'>
          Error Loading Token
        </Text>
        <Text mt={2}>{error}</Text>
      </Box>
    );
  }

  // Handle case when no tokens have been minted yet
  if (noTokensYet) {
    return (
      <Box
        borderWidth={1}
        display={'flex'}
        flexDir={'column'}
        alignItems='center'
        justifyContent='center'
        gap={3}
        rounded={'lg'}
        p={8}
        minH='400px'
        bg='gray.50'
        _dark={{ bg: 'gray.700', borderColor: 'yellow.400' }}
      >
        <Text
          fontSize='xl'
          fontWeight='bold'
          color='gray.600'
          _dark={{ color: 'gray.300' }}
        >
          No Tokens Minted Yet
        </Text>
        <Text
          fontSize='md'
          color='gray.500'
          _dark={{ color: 'gray.400' }}
          textAlign='center'
        >
          This droposal hasn't had any tokens minted yet. Be the first to mint!
        </Text>
        <Box
          w='200px'
          h='200px'
          bg='gray.200'
          _dark={{ bg: 'gray.600' }}
          borderRadius='lg'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Text fontSize='4xl' opacity={0.5}>
            🎨
          </Text>
        </Box>
      </Box>
    );
  }

  // Memoize media (video/image) so it doesn't re-render on unrelated state changes
  const mediaElement = useMemo(() => {
    if (metadata?.animation_url) {
      return (
        <Box
          borderRadius='lg'
          overflow='hidden'
          position='relative'
          height={{ base: '300px', md: 'auto' }}
        >
          <video
            src={metadata.animation_url}
            controls
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>
      );
    } else if (metadata?.image) {
      // Special case for the specific PDF IPFS hash
      if (
        metadata.image ===
        'https://ipfs.skatehive.app/ipfs/bafybeibizoza4jwnx5t3nqz3x3lho6allperhgbksbkpx4iqzgcqh4q5di'
      ) {
        return (
          <Box
            borderRadius='lg'
            overflow='hidden'
            position='relative'
            minHeight='600px'
            bg='gray.50'
            _dark={{ bg: 'gray.700' }}
          >
            <iframe
              src={`${metadata.image}#view=FitH`}
              width='100%'
              height='600px'
              style={{ border: 'none', borderRadius: '8px' }}
              title={metadata?.name || 'PDF Document'}
            />
          </Box>
        );
      }

      // Default case: render as image
      return (
        <Box borderRadius='lg' overflow='hidden' position='relative' mb={8}>
          <Image
            src={getImageUrl(metadata.image)}
            alt={metadata?.name || 'Token Image'}
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>
      );
    }
    return null;
  }, [metadata?.animation_url, metadata?.image, metadata?.name]);

  return (
    <Box
      borderWidth={1}
      display={'flex'}
      flexDir={'column'}
      alignItems='stretch'
      gap={3}
      rounded={'lg'}
      p={6}
      _dark={{ borderColor: 'yellow.400' }}
    >
      {mediaElement}
    </Box>
  );
};
