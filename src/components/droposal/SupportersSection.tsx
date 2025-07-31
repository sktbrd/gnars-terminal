import { Box, Heading, SimpleGrid, Spinner, Text, VStack, Badge } from '@chakra-ui/react';
import { Button } from '../ui/button';
import { Address } from 'viem';
import { useSupporters } from '@/hooks/useSupporters';
import { OptimizedAvatar } from '../utils/OptimizedIdentity';

export const SupportersSection: React.FC<{
  contractAddress: Address;
  totalSupply: bigint | null;
}> = ({ contractAddress, totalSupply }) => {
  const { visibleSupporters, loadMore, loading, hasMore } = useSupporters({
    contractAddress,
    totalSupply,
    batchSize: 40,
    itemsPerPage: 8,
  });

  return (
    <Box borderWidth={1} rounded="lg" p={6}>
      <Heading size="lg" mb={4}>Community Supporters</Heading>

      {visibleSupporters.length === 0 && loading ? (
        <Spinner />
      ) : (
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          {visibleSupporters.map(holder => (
            <VStack key={holder.address}>
              <OptimizedAvatar address={holder.address as Address} size="md" />
              <Text>{holder.address}</Text>
              {holder.tokenCount > 1 && (
                <Badge colorScheme="blue">{holder.tokenCount}</Badge>
              )}
            </VStack>
          ))}
        </SimpleGrid>
      )}

      {hasMore && (
        <Button onClick={loadMore} mt={4} loading={loading}>
          Load More
        </Button>
      )}
    </Box>
  );
};
