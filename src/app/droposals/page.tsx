'use client';
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  Button,
  Grid,
  Image,
  Skeleton,
} from '@chakra-ui/react';
import { useDroposals, DecodedCalldata } from '@/hooks/useDroposals';
import FormattedAddress from '@/components/utils/names';
import ActionButtons from '@/components/droposals/ActionButtons';
import { ProposalProvider } from '@/contexts/ProposalContext';

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

// PDF detection constant (moved outside for better performance and maintainability)
const PDF_IPFS_HASH =
  'bafkreigwd3ed5fqi5iesh7lhrj3wppjk7ltoeq3ofhcw4oyxoqfsp2e36u';
const isPDF = (imageURI: string) => {
  return (
    imageURI === `ipfs://${PDF_IPFS_HASH}` || imageURI?.includes(PDF_IPFS_HASH)
  );
};

const DroposalListPage = () => {
  const { droposals, loading, error, refetch } = useDroposals({
    limit: 50, // Fetch up to 50 droposals
    autoFetch: true,
  });

  if (loading) {
    return (
      <Box maxW='container.xl' mx='auto' p={{ base: 4, md: 6 }}>
        <VStack gap={{ base: 6, md: 8 }} align='stretch'>
          <HStack
            justify='space-between'
            align='center'
            flexWrap='wrap'
            gap={4}
          >
            <VStack align='start' gap={1}>
              <Heading size={{ base: 'lg', md: 'xl' }} color='primary'>
                All Droposals
              </Heading>
              <Text
                fontSize='sm'
                color='gray.600'
                _dark={{ color: 'gray.400' }}
              >
                Discover and collect NFT drops from the community
              </Text>
            </VStack>
          </HStack>
          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(3, 1fr)',
            }}
            gap={{ base: 4, md: 6 }}
            w='full'
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <Box
                key={index}
                borderWidth={1}
                borderRadius='xl'
                p={{ base: 4, md: 6 }}
                _dark={{ borderColor: 'gray.600' }}
                _light={{ borderColor: 'gray.200' }}
                bg={{ base: 'white', _dark: 'gray.800' }}
                height='400px'
              >
                <VStack gap={4} align='stretch' h='full'>
                  <Skeleton height='20px' width='60%' />
                  <Skeleton height='200px' width='full' borderRadius='lg' />
                  <Skeleton height='16px' width='80%' />
                  <Skeleton height='12px' width='60%' />
                  <VStack gap={2} align='stretch'>
                    <Skeleton height='12px' width='full' />
                    <Skeleton height='12px' width='full' />
                  </VStack>
                </VStack>
              </Box>
            ))}
          </Grid>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxW='container.lg' mx='auto' p={4}>
        <Box
          bg='red.50'
          p={4}
          borderRadius='md'
          borderColor='red.200'
          borderWidth={1}
        >
          <Text color='red.600'>{error}</Text>
        </Box>
        <Button mt={4} onClick={refetch}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW='container.xl' mx='auto' p={{ base: 4, md: 6 }}>
      <VStack gap={{ base: 6, md: 8 }} align='stretch'>
        <HStack justify='space-between' align='center' flexWrap='wrap' gap={4}>
          <VStack align='start' gap={1}>
            <Heading size={{ base: 'lg', md: 'xl' }} color='primary'>
              All Droposals
            </Heading>
            <Text fontSize='sm' color='gray.600' _dark={{ color: 'gray.400' }}>
              Discover and collect drops from the community, you will be
              supporting the creators and the treasure
            </Text>
          </VStack>
        </HStack>

        {droposals.length === 0 ? (
          <Box textAlign='center' py={20}>
            <VStack gap={4}>
              <Box
                fontSize='6xl'
                opacity={0.3}
                _dark={{ color: 'gray.600' }}
                _light={{ color: 'gray.300' }}
              >
                🎨
              </Box>
              <Heading size='md' color='gray.600' _dark={{ color: 'gray.400' }}>
                No droposals found
              </Heading>
              <Text fontSize='sm' color='gray.500' maxW='md'>
                There are no NFT drops available at the moment. Check back later
                for new community creations!
              </Text>
            </VStack>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(3, 1fr)',
            }}
            gap={{ base: 4, md: 6 }}
            w='full'
          >
            {droposals.map((droposal, index) => (
              <Box
                key={droposal.proposalNumber || index}
                borderWidth={1}
                borderRadius='xl'
                p={{ base: 4, md: 6 }}
                _dark={{ borderColor: 'yellow.500' }}
                _light={{ borderColor: 'gray.200' }}
                transition='all 0.3s ease'
                _hover={{
                  transform: 'translateY(-4px)',
                  shadow: 'xl',
                  _dark: {
                    borderColor: 'yellow.400',
                    shadow: '0 10px 25px -5px rgba(255, 255, 0, 0.1)',
                  },
                  _light: {
                    borderColor: 'gray.300',
                    shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  },
                }}
                bg={{ base: 'white', _dark: 'gray.800' }}
                height='fit-content'
                cursor='pointer'
                position='relative'
                overflow='hidden'
              >
                <VStack gap={{ base: 3, md: 4 }} align='stretch'>
                  {/* Decode Calldatas */}
                  {droposal.decodedCalldatas?.map(
                    (data: DecodedCalldata, idx: number) => {
                      const salesConfig = data.saleConfig
                        ? convertSaleConfig(data.saleConfig)
                        : null;

                      return (
                        <VStack
                          key={idx}
                          gap={{ base: 2, md: 3 }}
                          align='stretch'
                        >
                          {/* Media */}
                          {(data.imageURI || data.animationURI) && (
                            <Box
                              position='relative'
                              borderRadius='lg'
                              overflow='hidden'
                              aspectRatio={16 / 9}
                              bg='gray.100'
                              _dark={{ bg: 'gray.700' }}
                            >
                              <Image
                                src={data.imageURI}
                                alt={data.name}
                                w='full'
                                h='full'
                                objectFit='cover'
                              />
                              {data.animationURI && (
                                <Box
                                  position='absolute'
                                  top={2}
                                  right={2}
                                  bg='purple.500'
                                  color='white'
                                  px={2}
                                  py={1}
                                  borderRadius='md'
                                  fontSize='xs'
                                  fontWeight='medium'
                                >
                                  Video
                                </Box>
                              )}
                              {/* PDF badge logic */}
                              {isPDF(data.imageURI) && (
                                <Box
                                  position='absolute'
                                  top={2}
                                  right={2}
                                  bg='red.500'
                                  color='white'
                                  px={2}
                                  py={1}
                                  borderRadius='md'
                                  fontSize='xs'
                                  fontWeight='medium'
                                >
                                  PDF
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* Title and Symbol */}
                          <VStack gap={1} align='start'>
                            <HStack justify='space-between' w='full'>
                              <Box>
                                <Heading
                                  size='sm'
                                  lineClamp={2}
                                  fontWeight='bold'
                                >
                                  {data.name}
                                </Heading>

                                <Text
                                  color='gray.500'
                                  fontSize='xs'
                                  fontWeight='medium'
                                >
                                  ${data.symbol}
                                </Text>
                              </Box>
                              {salesConfig && (
                                <Box
                                  bg='background'
                                  color='primary'
                                  px={3}
                                  py={1}
                                  borderRadius='lg'
                                  fontSize='sm'
                                  fontWeight='bold'
                                  shadow='sm'
                                >
                                  {salesConfig.publicSalePrice === 0
                                    ? 'Free'
                                    : `${salesConfig.publicSalePrice} ETH`}
                                </Box>
                              )}
                            </HStack>
                          </VStack>

                          {/* Description */}
                          {data.description && (
                            <Text
                              fontSize='xs'
                              lineClamp={2}
                              color='gray.700'
                              _dark={{ color: 'gray.300' }}
                              lineHeight={1.4}
                            >
                              {data.description}
                            </Text>
                          )}

                          {/* Addresses */}
                          <VStack gap={0} align='stretch'>
                            <HStack justify='space-between' w='full'>
                              <Text
                                fontSize='xs'
                                color='gray.500'
                                fontFamily='mono'
                              >
                                Recipient:
                              </Text>
                              <FormattedAddress address={data.fundsRecipient} />
                            </HStack>
                            <HStack justify='space-between' w='full'>
                              <Text
                                fontSize='xs'
                                color='gray.500'
                                fontFamily='mono'
                              >
                                Admin:
                              </Text>
                              <FormattedAddress address={data.defaultAdmin} />
                            </HStack>
                          </VStack>

                          {/* Action Buttons */}
                          <ProposalProvider
                            initialProposal={droposal}
                            initialProposalNumber={droposal.proposalNumber || 0}
                            initialDescriptionHash={
                              droposal.descriptionHash || ''
                            }
                            initialBlockNumber={droposal.snapshotBlockNumber}
                            initialPropdates={[]}
                          >
                            <ActionButtons
                              name={data.name}
                              thumbnail={data.imageURI}
                              salesConfig={salesConfig || undefined}
                            />
                          </ProposalProvider>
                        </VStack>
                      );
                    }
                  )}
                </VStack>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>
    </Box>
  );
};

export default DroposalListPage;
