import { Box, Button, Image, Text } from '@chakra-ui/react';
import { useState } from 'react';
import CollectModal from './CollectModal'; // Import CollectModal

const CustomVideoPlayer = ({
  src,
  isVideo,
  desxcriptionHash,
}: {
  src: string;
  isVideo: boolean;
  desxcriptionHash?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  return (
    <>
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
            alt={'Video Thumbnail'}
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
              onClick={() => setIsModalOpen(true)} // Open modal on click
            >
              Collect
            </Button>
          </Box>
        )}
      </Box>

      {/* CollectModal */}
      {isModalOpen && (
        <CollectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} // Close modal handler
          descriptionHash={desxcriptionHash}
        />
      )}
    </>
  );
};

export default CustomVideoPlayer;
