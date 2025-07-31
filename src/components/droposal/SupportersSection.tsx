import {
  Box,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import { FormattedAddress } from '@/components/utils/names';
import { Address } from 'viem';
import { useSupporters } from '@/hooks/useSupporters';
import { OptimizedAvatar } from '../utils/OptimizedIdentity';

export const SupportersSection: React.FC<{
  contractAddress: Address;
  totalSupply: bigint | null;
}> = ({ contractAddress, totalSupply }) => {
  const maxFetchSize = 500;
  const fetchSize = totalSupply ? Math.min(Number(totalSupply), maxFetchSize) : maxFetchSize;

  const { supporters, loadMore, loading } = useSupporters({
    contractAddress,
    totalSupply,
    batchSize: fetchSize,
    itemsPerPage: fetchSize,
  });

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      borderWidth={1}
      display="flex"
      flexDir="column"
      alignItems="stretch"
      gap={3}
      rounded="lg"
      p={6}
      _dark={{ borderColor: 'yellow' }}
    >
      <HStack gap={2}>
        <FaUsers size={24} color="#FFD700" />
        <Heading size="xl">
          Community Supporters
          {totalSupply && totalSupply > maxFetchSize && (
            <Text as="span" fontSize="sm" color="blue.500" ml={2}>
              (showing first {maxFetchSize})
            </Text>
          )}
        </Heading>
      </HStack>

      {loading && supporters.length === 0 ? (
        <Flex justify="center" my={4}>
          <Spinner size="sm" mr={2} />
          <Text>Loading supporters...</Text>
        </Flex>
      ) : supporters.length > 0 ? (
        <Box pb={2}>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3} w="100%">
            {supporters.map(holder => (
              <Box
                key={holder.address}
                bg="gray.50"
                p={3}
                borderRadius="lg"
                textAlign="center"
                border="1px solid"
                borderColor="gray.200"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}
                _dark={{ bg: 'gray.800', borderColor: 'yellow.600' }}
              >
                <VStack gap={2}>
                  <Box position="relative">
                    <OptimizedAvatar address={holder.address as Address} size="md" />
                    {holder.tokenCount > 1 && (
                      <Flex
                        position="absolute"
                        bottom="-2px"
                        right="-2px"
                        bg="blue.500"
                        color="white"
                        borderRadius="full"
                        w="20px"
                        h="20px"
                        justifyContent="center"
                        alignItems="center"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {holder.tokenCount}
                      </Flex>
                    )}
                  </Box>
                  <FormattedAddress address={holder.address} />
                  <Text fontSize="xs" color="gray.500">
                    #{holder.tokenIds[0].toString()}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : (
        <Text>No supporters found</Text>
      )}
    </Box>
  );
};
