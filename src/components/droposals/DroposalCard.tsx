'use client';
import React, { memo } from 'react';
import { Box, VStack, Skeleton } from '@chakra-ui/react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { ProposalProvider, useProposal } from '@/contexts/ProposalContext';
import {
  useDroposals,
  ExtendedProposal,
  DecodedCalldata,
} from '@/hooks/useDroposals';

// Create a memoized component for the droposal content to prevent unnecessary re-renders
const DroposalContent = memo(() => {
  const { proposal, setProposal, setTokenCreated } = useProposal();
  const { droposals, loading, tokenCreated } = useDroposals({ limit: 1 });

  // Use the first droposal directly from the hook
  const extendedProposal = droposals[0] as ExtendedProposal;

  // Update the proposal context when droposals are loaded
  React.useEffect(() => {
    if (
      droposals.length > 0 &&
      (!proposal?.proposalNumber ||
        proposal.proposalNumber !== droposals[0].proposalNumber)
    ) {
      setProposal(droposals[0]);
    }
  }, [droposals, proposal?.proposalNumber, setProposal]);

  // Update the tokenCreated context when it's available
  React.useEffect(() => {
    if (tokenCreated && tokenCreated !== '') {
      setTokenCreated(tokenCreated);
    }
  }, [tokenCreated, setTokenCreated]);

  // Utility function to convert saleConfig values
  const convertSaleConfig = (input: any) => ({
    publicSalePrice: input.publicSalePrice
      ? Number(input.publicSalePrice) / 1e18
      : 0,
    maxSalePurchasePerAddress: input.maxSalePurchasePerAddress
      ? Number(input.maxSalePurchasePerAddress)
      : 0,
    publicSaleStart: input.publicSaleStart ? Number(input.publicSaleStart) : 0,
    publicSaleEnd: input.publicSaleEnd ? Number(input.publicSaleEnd) : 0,
    presaleStart: input.presaleStart ? Number(input.presaleStart) : 0,
    presaleEnd: input.presaleEnd ? Number(input.presaleEnd) : 0,
    presaleMerkleRoot: input.presaleMerkleRoot
      ? input.presaleMerkleRoot.toString()
      : '',
  });

  if (
    loading ||
    !extendedProposal ||
    !extendedProposal.decodedCalldatas ||
    extendedProposal.decodedCalldatas.length === 0
  ) {
    return (
      <Box
        shadow='sm'
        w='full'
        h='full'
        minHeight='300px' // Ensure a minimum height for the loading state
        padding={4}
        rounded='md'
        gap={4}
        _dark={{ borderColor: 'yellow', borderWidth: 1 }}
        position='relative'
      >
        <Skeleton height='100%' width='100%' />
      </Box>
    );
  }

  return (
    <VStack
      shadow='sm'
      w='full'
      height='full'
      padding={4}
      rounded='md'
      gap={4}
      _dark={{ borderColor: 'primary', borderWidth: 1 }}
      position='relative'
    >
      {extendedProposal.decodedCalldatas.length > 0 ? (
        <>
          {extendedProposal.decodedCalldatas.map(
            (data: DecodedCalldata, idx: number) => {
              // Fallback config to ensure all fields are provided.
              const defaultSalesConfig = {
                publicSalePrice: 0,
                maxSalePurchasePerAddress: 0,
                publicSaleStart: 0,
                publicSaleEnd: 0,
                presaleStart: 0,
                presaleEnd: 0,
                presaleMerkleRoot: '',
              };
              // Convert saleConfig if available
              const convertedSalesConfig = data.saleConfig
                ? convertSaleConfig(data.saleConfig)
                : defaultSalesConfig;
              return (
                <VStack key={idx} w='full' gap={2} align='start'>
                  {/* <Heading size='md'>{data.name}</Heading> */}
                  <CustomVideoPlayer
                    src={data.animationURI || data.imageURI}
                    isVideo={Boolean(data.animationURI)}
                    salesConfig={convertedSalesConfig}
                    thumbnail={data.imageURI}
                    name={data.name}
                  />
                </VStack>
              );
            }
          )}
        </>
      ) : (
        <Skeleton height={{ base: '220px', md: 'full' }} width='full' />
      )}
    </VStack>
  );
});
DroposalContent.displayName = 'DroposalContent';

export default function DroposalCard() {
  // Initialize with empty proposal that will be populated by the useEffect in DroposalContent
  const initialProposal: ExtendedProposal = {
    decodedCalldatas: [],
  } as unknown as ExtendedProposal;
  return (
    <ProposalProvider
      initialProposal={initialProposal}
      initialProposalNumber={0}
      initialDescriptionHash=''
      initialPropdates={[]}
    >
      <DroposalContent />
    </ProposalProvider>
  );
}
