'use client';
import { useEffect, useCallback, memo } from 'react';
import { Box, VStack, Skeleton, HStack, Text, Heading } from '@chakra-ui/react';
import { fetchProposals } from '@/app/services/proposal';
import { Address, decodeFunctionData } from 'viem';
import droposalABI from '../proposal/transactions/utils/droposalABI';
import { DAO_ADDRESSES } from '@/utils/constants';
import CustomVideoPlayer from './CustomVideoPlayer';
import { ProposalProvider, useProposal } from '@/contexts/ProposalContext';
import { Proposal } from '@/app/services/proposal';

// send me to .env and call me DROPOSAL_ADDRESS
const TARGET_ADDRESS = '0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c';

// Define interface for decoded calldata
interface DecodedCalldata {
  name: string;
  symbol: string;
  editionSize: string;
  royaltyBPS: string;
  fundsRecipient: Address;
  defaultAdmin: Address;
  saleConfig: unknown;
  description: string;
  imageURI: string;
  animationURI: string;
}

// Extended proposal interface that includes decodedCalldatas
interface ExtendedProposal extends Proposal {
  decodedCalldatas?: DecodedCalldata[];
}

// Create a memoized component for the droposal content to prevent unnecessary re-renders
const DroposalContent = memo(() => {
  const { proposal, setProposal } = useProposal();

  const formatURI = (uri: string): string => {
    if (!uri) return '';
    const trimmedUri = uri.trim();
    if (/^ipfs:\/\//.test(trimmedUri)) {
      return `/ipfs/${trimmedUri.slice(7)}`; // Use the proxy path
    }
    return uri;
  };

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

  const fetchAndDecodeProposals = useCallback(async () => {
    try {
      const fetchedProposals = await fetchProposals(
        DAO_ADDRESSES.token,
        'proposalNumber',
        'desc',
        1,
        { targets_contains: [TARGET_ADDRESS], executed: true },
        true
      );
      // Debug: Log fetched proposals
      if (fetchedProposals.length > 0) {
        const proposal = fetchedProposals[0];
        const rawCalldatas = proposal.calldatas;
        // Debug: Log raw calldata
        const calldatasArray =
          typeof rawCalldatas === 'string'
            ? rawCalldatas.split(':')
            : rawCalldatas;
        const normalizedCalldatas = calldatasArray.map((calldata: string) =>
          calldata === '0x' || calldata === '0' ? '0x' : calldata
        );

        const decodedCalldatas = normalizedCalldatas.map((calldata: string) => {
          if (!calldata || calldata.length < 8) return null;

          let finalCalldata = calldata;
          if (!finalCalldata.startsWith('0x')) {
            finalCalldata = '0x' + finalCalldata;
          }

          try {
            const { args } = decodeFunctionData({
              abi: droposalABI,
              data: finalCalldata as `0x${string}`,
            });
            const [
              name,
              symbol,
              editionSize,
              royaltyBPS,
              fundsRecipient,
              defaultAdmin,
              saleConfig,
              description,
              animationURI,
              imageURI,
            ] = args as [
              string,
              string,
              bigint,
              number,
              Address,
              Address,
              unknown,
              string,
              string,
              string,
            ];

            return {
              name,
              symbol,
              editionSize: editionSize.toString(),
              royaltyBPS: (royaltyBPS / 100).toFixed(2),
              fundsRecipient,
              defaultAdmin,
              saleConfig,
              description,
              imageURI: formatURI(imageURI),
              animationURI: formatURI(animationURI),
            };
          } catch {
            return null;
          }
        });

        setProposal({
          ...proposal,
          // Ensure descriptionHash is explicitly set from the proposal
          descriptionHash: proposal.descriptionHash || '0x0', // Provide fallback if undefined
          decodedCalldatas: decodedCalldatas.filter((d) => d !== null),
        } as ExtendedProposal);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  }, [setProposal]);

  useEffect(() => {
    fetchAndDecodeProposals();
  }, [fetchAndDecodeProposals]);

  const extendedProposal = proposal as ExtendedProposal;
  if (!extendedProposal || !extendedProposal.decodedCalldatas) {
    debugger;
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
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
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
        <Skeleton height='full' width='full' />
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
