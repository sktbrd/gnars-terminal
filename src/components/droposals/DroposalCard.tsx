'use client';
import React, { memo } from 'react';
import { Box, VStack, Skeleton, Button, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import CustomVideoPlayer from './CustomVideoPlayer';
import CollectButton from './CollectButton';
import { ProposalProvider, useProposal } from '@/contexts/ProposalContext';
import {
  useDroposals,
  ExtendedProposal,
  DecodedCalldata,
} from '@/hooks/useDroposals';

// Utility function to convert saleConfig values (moved outside component for better performance)
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

  if (loading) {
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

  // Check if we have no droposals to display (not loading, but no data)
  if (
    !extendedProposal ||
    !extendedProposal.decodedCalldatas ||
    extendedProposal.decodedCalldatas.length === 0
  ) {
    return (
      <Box
        shadow='sm'
        w='full'
        h='full'
        minHeight='300px'
        padding={4}
        rounded='md'
        gap={4}
        _dark={{ borderColor: 'primary', borderWidth: 1 }}
        position='relative'
      >
        <Flex
          height='100%'
          width='100%'
          direction='column'
          align='center'
          justify='center'
          gap={4}
        >
          <Text fontSize='lg' color='gray.500' textAlign='center'>
            No droposals available
          </Text>
          <Link href='/create-proposal' passHref>
            <Button
              colorScheme='primary'
              size='lg'
              variant='solid'
              _hover={{ transform: 'translateY(-2px)' }}
              transition='all 0.2s'
            >
              Create Droposal
            </Button>
          </Link>
        </Flex>
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
              <Box position='relative' w='full'>
                <CustomVideoPlayer
                  src={data.animationURI || data.imageURI}
                  isVideo={Boolean(data.animationURI)}
                  salesConfig={convertedSalesConfig}
                  thumbnail={data.imageURI}
                  name={data.name}
                />
                <CollectButton
                  name={data.name}
                  thumbnail={data.imageURI}
                  salesConfig={convertedSalesConfig}
                />
              </Box>
            </VStack>
          );
        }
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
      initialBlockNumber={0}
      initialPropdates={[]}
    >
      <DroposalContent />
    </ProposalProvider>
  );
}
