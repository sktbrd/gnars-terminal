import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import CollectModal from './CollectModal';

interface CollectButtonProps {
  name?: string;
  thumbnail?: string;
  salesConfig?: {
    publicSalePrice: number;
    maxSalePurchasePerAddress: number;
    publicSaleStart: number;
    publicSaleEnd: number;
    presaleStart: number;
    presaleEnd: number;
    presaleMerkleRoot: string;
  };
  onModalOpen?: () => void;
  onModalClose?: () => void;
  position?: 'absolute' | 'relative' | 'static';
  top?: string;
  right?: string;
}

const CollectButton: React.FC<CollectButtonProps> = ({
  name,
  thumbnail,
  salesConfig,
  onModalOpen,
  onModalClose,
  position = 'absolute',
  top = '10px',
  right = '10px',
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
    onModalOpen?.();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onModalClose?.();
  };

  return (
    <>
      <Box
        position={position}
        top={position === 'absolute' ? top : undefined}
        right={position === 'absolute' ? right : undefined}
        zIndex={position === 'absolute' ? 10 : undefined}
        w={position !== 'absolute' ? 'full' : undefined}
      >
        <Button
          colorScheme='blue'
          size='sm'
          onClick={handleOpenModal}
          w={position !== 'absolute' ? 'full' : undefined}
        >
          Collect
        </Button>
      </Box>

      <CollectModal
        isOpen={showModal}
        onClose={handleCloseModal}
        thumbnail={thumbnail}
        name={name}
        salesConfig={salesConfig}
      />
    </>
  );
};

export default CollectButton;
