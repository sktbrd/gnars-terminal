import React from 'react';
import { Box, Text, Heading, HStack, VStack, Spinner } from '@chakra-ui/react';
import { useDroposals } from '@/hooks/useDroposals';

interface DroposalsSummaryProps {
  limit?: number;
  showLoading?: boolean;
}

/**
 * A simple summary component showing droposals stats
 * Can be used in dashboards or other areas where you need a quick overview
 */
const DroposalsSummary: React.FC<DroposalsSummaryProps> = ({
  limit = 5,
  showLoading = true,
}) => {
  const { droposals, loading, error } = useDroposals({
    limit,
    autoFetch: true,
  });

  if (loading && showLoading) {
    return (
      <Box
        p={4}
        borderWidth={1}
        borderRadius='md'
        _dark={{ borderColor: 'yellow.500' }}
      >
        <HStack gap={2}>
          <Spinner size='sm' />
          <Text fontSize='sm'>Loading droposals...</Text>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        p={4}
        borderWidth={1}
        borderRadius='md'
        bg='red.50'
        borderColor='red.200'
      >
        <Text fontSize='sm' color='red.600'>
          Failed to load droposals
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius='md'
      _dark={{ borderColor: 'yellow.500' }}
    >
      <VStack gap={3} align='stretch'>
        <Heading size='sm'>Recent Droposals</Heading>

        <HStack justify='space-between'>
          <Text fontSize='sm' color='gray.600'>
            Total Found:
          </Text>
          <Text fontSize='sm' fontWeight='medium'>
            {droposals.length}
          </Text>
        </HStack>

        {droposals.length > 0 && (
          <VStack gap={2} align='stretch'>
            <Text fontSize='xs' color='gray.500' fontWeight='medium'>
              Latest Droposals:
            </Text>
            {droposals.slice(0, 3).map((droposal, index) => (
              <Box key={droposal.proposalNumber || index}>
                {droposal.decodedCalldatas?.map((data, idx) => (
                  <HStack key={idx} justify='space-between' py={1}>
                    <Text fontSize='xs' lineClamp={1}>
                      {data.name}
                    </Text>
                    <Text fontSize='xs' color='gray.500'>
                      #{droposal.proposalNumber}
                    </Text>
                  </HStack>
                ))}
              </Box>
            ))}
          </VStack>
        )}

        {droposals.length === 0 && (
          <Text fontSize='sm' color='gray.500' textAlign='center'>
            No droposals found
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default DroposalsSummary;
