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
}

const CollectButton: React.FC<CollectButtonProps> = ({
    name,
    thumbnail,
    salesConfig,
    onModalOpen,
    onModalClose
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
                position="absolute"
                top="10px"
                right="10px"
                zIndex={10}
            >
                <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={handleOpenModal}
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
