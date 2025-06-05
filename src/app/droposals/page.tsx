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
} from '@chakra-ui/react';
import { useDroposals, DecodedCalldata } from '@/hooks/useDroposals';

const DroposalListPage = () => {
  const { droposals, loading, error, refetch } = useDroposals({
    limit: 50, // Fetch up to 50 droposals
    autoFetch: true,
  });

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

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Not set';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <VStack gap={4}>
          <Spinner size='xl' color='primary' />
          <Text>Loading droposals...</Text>
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
    <Box maxW='container.xl' mx='auto' p={4}>
      <VStack gap={6} align='stretch'>
        <HStack justify='space-between' align='center'>
          <Heading size='lg'>All Droposals</Heading>
          <Box
            bg='blue.500'
            color='white'
            px={3}
            py={1}
            borderRadius='md'
            fontSize='sm'
            fontWeight='medium'
          >
            {droposals.length} droposal{droposals.length !== 1 ? 's' : ''}
          </Box>
        </HStack>

        {droposals.length === 0 ? (
          <Box textAlign='center' py={10}>
            <Text fontSize='lg' color='gray.500'>
              No droposals found
            </Text>
          </Box>
        ) : (
          <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {droposals.map((droposal, index) => (
              <Box
                key={droposal.proposalNumber || index}
                borderWidth={1}
                borderRadius='md'
                p={4}
                _dark={{ borderColor: 'yellow.500' }}
              >
                <VStack gap={4} align='stretch'>
                  {/* Proposal Info */}
                  <HStack justify='space-between'>
                    <Box
                      bg='green.500'
                      color='white'
                      px={2}
                      py={1}
                      borderRadius='md'
                      fontSize='xs'
                    >
                      Proposal #{droposal.proposalNumber}
                    </Box>
                    <Text fontSize='xs' color='gray.500'>
                      {new Date(
                        (droposal as any).createdTimestamp * 1000
                      ).toLocaleDateString()}
                    </Text>
                  </HStack>

                  {/* Decode Calldatas */}
                  {droposal.decodedCalldatas?.map(
                    (data: DecodedCalldata, idx: number) => {
                      const salesConfig = data.saleConfig
                        ? convertSaleConfig(data.saleConfig)
                        : null;

                      return (
                        <VStack key={idx} gap={3} align='stretch'>
                          {/* Media */}
                          {(data.imageURI || data.animationURI) && (
                            <Box
                              position='relative'
                              borderRadius='md'
                              overflow='hidden'
                            >
                              <Image
                                src={data.imageURI}
                                alt={data.name}
                                w='full'
                                h='200px'
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
                                >
                                  Video
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* Title and Symbol */}
                          <VStack gap={1} align='start'>
                            <Heading size='md' lineClamp={1}>
                              {data.name}
                            </Heading>
                            <Text color='gray.500' fontSize='sm'>
                              Symbol: {data.symbol}
                            </Text>
                          </VStack>

                          {/* Description */}
                          {data.description && (
                            <Text fontSize='sm' lineClamp={3}>
                              {data.description}
                            </Text>
                          )}

                          {/* NFT Details */}
                          <VStack gap={2} align='stretch'>
                            <HStack justify='space-between'>
                              <Text fontSize='sm' fontWeight='medium'>
                                Edition Size:
                              </Text>
                              <Text fontSize='sm'>{data.editionSize}</Text>
                            </HStack>
                            <HStack justify='space-between'>
                              <Text fontSize='sm' fontWeight='medium'>
                                Royalty:
                              </Text>
                              <Text fontSize='sm'>{data.royaltyBPS}%</Text>
                            </HStack>
                          </VStack>

                          {/* Sales Config */}
                          {salesConfig && (
                            <VStack gap={2} align='stretch'>
                              <Text fontSize='sm' fontWeight='bold'>
                                Sale Details:
                              </Text>
                              {salesConfig.publicSalePrice > 0 && (
                                <HStack justify='space-between'>
                                  <Text fontSize='xs'>Price:</Text>
                                  <Text fontSize='xs'>
                                    {salesConfig.publicSalePrice} ETH
                                  </Text>
                                </HStack>
                              )}
                              {salesConfig.maxSalePurchasePerAddress > 0 && (
                                <HStack justify='space-between'>
                                  <Text fontSize='xs'>Max per wallet:</Text>
                                  <Text fontSize='xs'>
                                    {salesConfig.maxSalePurchasePerAddress}
                                  </Text>
                                </HStack>
                              )}
                              {salesConfig.publicSaleStart > 0 && (
                                <HStack justify='space-between'>
                                  <Text fontSize='xs'>Sale dates:</Text>
                                  <Text fontSize='xs'>
                                    {formatDate(salesConfig.publicSaleStart)} -{' '}
                                    {formatDate(salesConfig.publicSaleEnd)}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                          )}

                          {/* Addresses */}
                          <VStack gap={1} align='stretch'>
                            <Text fontSize='xs' color='gray.500'>
                              Recipient: {data.fundsRecipient.slice(0, 8)}...
                              {data.fundsRecipient.slice(-6)}
                            </Text>
                            <Text fontSize='xs' color='gray.500'>
                              Admin: {data.defaultAdmin.slice(0, 8)}...
                              {data.defaultAdmin.slice(-6)}
                            </Text>
                          </VStack>
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
