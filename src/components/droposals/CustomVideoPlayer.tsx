import { Box, Button, Image, Text } from '@chakra-ui/react';
import { useState } from 'react';

const CustomVideoPlayer = ({
  src,
  isVideo,
  title,
  royalties,
  proposer,
  fundsRecipient,
  description,
  saleConfig,
  index,
}: {
  src: string;
  isVideo: boolean;
  title: string;
  royalties: string;
  proposer: string;
  fundsRecipient: string;
  description: string;
  saleConfig: any;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      position='relative'
      w='full'
      rounded='md'
      overflow='hidden'
      aspectRatio={'16/9'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVideo ? (
        <video
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          controls
          autoPlay
          muted
        />
      ) : (
        <Image
          src={src}
          alt={title || 'Droposal Media'}
          width='100%'
          height='100%'
          objectFit='cover'
          rounded='md'
        />
      )}

      {/* Collect button - only visible on hover */}
      {isHovered && (
        <Box position='absolute' top={4} right={4} zIndex={2}>
          <Button
            size='xs'
            colorScheme='teal'
            variant={'surface'}
            fontFamily={'mono'}
            onClick={() =>
              window.open(
                'https://zora.co/collect/base:0xd2f21a72730259512f6edc60cfd182a79420dae6',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            Collect
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CustomVideoPlayer;
