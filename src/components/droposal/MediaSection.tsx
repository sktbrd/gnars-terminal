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
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  metadata,
  loading,
  error,
  ethVolumeInfo,
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
      _dark={{ borderColor: 'yellow' }}
    >
      {mediaElement}
    </Box>
  );
};
