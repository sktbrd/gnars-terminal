import { FormattedAddress } from '@/components/utils/names';
import {
  Avatar,
  Box,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react';
import { FaUsers } from 'react-icons/fa';
import { useAvatar } from '@paperclip-labs/whisk-sdk/identity';
import { Address } from 'viem';
import { Button } from '../ui/button';
import { useSupporters } from '@/hooks/useSupporters';

interface SupportersSectionProps {
  contractAddress: Address;
  totalSupply: bigint | null;
}

// Supporter Avatar component with image fallback
function SupporterAvatar({ address }: { address: Address }) {
  const { data: avatar, isLoading } = useAvatar({ address });

  return (
    <Avatar.Root size="md">
      {isLoading ? (
        <Spinner size='sm' />
      ) : (
        <Avatar.Image src={avatar || '/images/frames/icon.png'} />
      )}
    </Avatar.Root>
  );
}

export const SupportersSection: React.FC<SupportersSectionProps> = ({
  contractAddress,
  totalSupply,
}) => {
  // Cap the fetch size to avoid performance issues with very large collections
  const maxFetchSize = 500; // Reasonable limit for performance
  const fetchSize = totalSupply ? Math.min(Number(totalSupply), maxFetchSize) : maxFetchSize;
  
  const {
    supporters,
    loading,
    error,
    cached
  } = useSupporters({
    contractAddress,
    totalSupply,
    batchSize: fetchSize,
    itemsPerPage: fetchSize,
    autoLoad: true
  });

  return (
    <Box borderWidth={1} display="flex" flexDir="column" alignItems='stretch' gap={3} rounded="lg" p={6} _dark={{ borderColor: 'yellow' }}>
      <HStack gap={2}>
        <FaUsers size={24} color="#FFD700" />
        <Heading size='xl'>
          Community Supporters
          {cached && (
            <Text as="span" fontSize="sm" color="gray.500" ml={2}>
              (cached)
            </Text>
          )}
          {totalSupply && totalSupply > maxFetchSize && (
            <Text as="span" fontSize="sm" color="blue.500" ml={2}>
              (showing first {maxFetchSize})
            </Text>
          )}
        </Heading>
      </HStack>
      
      {loading && supporters.length === 0 ? (
        <Flex justify='center' my={4}>
          <Spinner size='sm' mr={2} />
          <Text>Loading supporters...</Text>
        </Flex>
      ) : supporters.length > 0 ? (
        <>
          {/* Grid of supporter cards */}
          <Box pb={2}>
            <SimpleGrid 
              columns={{ base: 2, sm: 3, md: 4 }}
              gap={3} 
              w="100%"
            >
              {supporters.map((holder, index) => (
                <Box 
                  key={`${holder.address}-${index}`} 
                  bg="gray.50" 
                  p={3} 
                  borderRadius="lg" 
                  textAlign="center"
                  border="1px solid"
                  borderColor="gray.200"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: 'translateY(-2px)',
                    boxShadow: "sm" 
                  }}
                  _dark={{ 
                    bg: 'gray.800', 
                    borderColor: 'yellow.600',
                  }}
                >
                  <VStack gap={2}>
                    <Box position="relative">
                      <SupporterAvatar address={holder.address as Address} />
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
        </>
      ) : (
        <Text>No supporters found</Text>
      )}

      {error && (
        <Text color="red.500" mt={2} fontSize="sm">
          {error}
        </Text>
      )}
    </Box>
  );
};
