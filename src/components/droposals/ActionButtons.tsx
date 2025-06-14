import React from 'react';
import { HStack, Button, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import { LuExternalLink } from 'react-icons/lu';
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
      {tokenCreated ? (
        <Link href={`/droposal/${tokenCreated}`}>
          <IconButton
            size='sm'
            variant='outline'
            aria-label='Go to mint page'
            title='Go to mint page'
          >
            <LuExternalLink />
          </IconButton>
        </Link>
      ) : (
        <IconButton
          size='sm'
          disabled={true}
          cursor='not-allowed'
          aria-label='Mint page (disabled)'
          title='Mint page will be available after token creation'
        >
          <LuExternalLink />
        </IconButton>
      )}
    </HStack>
  );
};

export default ActionButtons;
