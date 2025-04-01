import React, { useState } from 'react';
import { Box, Image } from '@chakra-ui/react';
import CollectButton from './CollectButton'; // Import CollectButton

const CustomVideoPlayer = React.memo(({
  src,
  isVideo,
  desxcriptionHash,
  blockNumber,
  salesConfig,
  thumbnail,
}: {
  src: string;
  isVideo: boolean;
  desxcriptionHash?: string;
  blockNumber?: number;
  salesConfig?: {
    publicSalePrice: number;
    maxSalePurchasePerAddress: number;
    publicSaleStart: number;
    publicSaleEnd: number;
    presaleStart: number;
    presaleEnd: number;
    presaleMerkleRoot: string;
  };
  thumbnail?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle hover events only when modal is not open
  const handleMouseEnter = () => {
    if (!isModalOpen) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isModalOpen) {
      setIsHovered(false);
    }
  };

  // Track modal state
  const handleModalOpen = () => {
    setIsModalOpen(true);
    // Keep hover state active when modal is open
    setIsHovered(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Reset hover state based on mouse position
    setIsHovered(false);
  };

  return (
    <>
      <Box
        position='relative'
        w='full'
        rounded='md'
        overflow='hidden'
        aspectRatio={'16/9'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isVideo ? (
          <video
            src={src}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            controls
            autoPlay
            loop
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
        {isHovered && <CollectButton blocknumber={blockNumber} descriptionHash={desxcriptionHash} thumbnail={thumbnail} onModalOpen={handleModalOpen} onModalClose={handleModalClose} />}
      </Box>
    </>
  );
});

export default CustomVideoPlayer;
