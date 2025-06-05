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
  proposalNumber?: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  name,
  thumbnail,
  salesConfig,
  proposalNumber,
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
          // Use tokenCreated if available, otherwise fall back to proposalNumber
          const targetId = tokenCreated || proposalNumber;
          if (targetId) {
            window.open(`/droposal/${targetId}`, '_blank');
          }
        }}
        disabled={!tokenCreated && !proposalNumber}
      >
        Mint Page
      </Button>
    </HStack>
  );
};

export default ActionButtons;
