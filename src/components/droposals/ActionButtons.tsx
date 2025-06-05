import React from 'react';
import { HStack, Button } from '@chakra-ui/react';
import CollectButton from './CollectButton';
import { useProposal } from '@/contexts/ProposalContext';

interface ActionButtonsProps {
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
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  name,
  thumbnail,
  salesConfig,
}) => {
  const { tokenCreated } = useProposal();

  return (
    <HStack justify='space-between' w='full'>
      <CollectButton
        name={name}
        thumbnail={thumbnail}
        salesConfig={salesConfig}
        position='relative'
      />
      <Button
        size='sm'
        colorScheme='blue'
        onClick={() => {
          // Use tokenCreated contract address for the mint page
          if (tokenCreated) {
            window.open(`/droposal/${tokenCreated}`, '_blank');
          }
        }}
        disabled={!tokenCreated}
      >
        Mint Page
      </Button>
    </HStack>
  );
};

export default ActionButtons;
