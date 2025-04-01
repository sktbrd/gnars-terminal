import React, { useState } from 'react';
import { Box, Image } from '@chakra-ui/react';
import CollectButton from './CollectButton'; // Import CollectButton

const CustomVideoPlayer = React.memo(({
  src,
  isVideo,
  salesConfig,
  thumbnail,
  name
}: {
  src: string;
  isVideo: boolean;
  name?: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle hover events only when modal is not open
  const handleMouseEnter = () => {
    if (!isModalOpen) {
    }
  };

  const handleMouseLeave = () => {
    if (!isModalOpen) {
    }
  };

  // Track modal state
  const handleModalOpen = () => {
    setIsModalOpen(true);
    // Keep hover state active when modal is open
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
        <CollectButton name={name} thumbnail={thumbnail} onModalOpen={handleModalOpen} onModalClose={handleModalClose} salesConfig={salesConfig} />
      </Box>
    </>
  );
});

export default CustomVideoPlayer;
