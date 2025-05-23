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
import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { Button } from '../ui/button';
import { aggregateAndRankHolders, fetchTokenOwnersBatch } from './droposalUtils';
import { AggregatedHolder } from './types';

interface SupportersSectionProps {
  contractAddress: Address;
  totalSupply: bigint | null;
}

const INITIAL_BATCH_SIZE = 20; // Only fetch 20 owners initially
const ITEMS_PER_PAGE = 8; // Display 8 per page

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
  const [rawMinters, setRawMinters] = useState<
    { address: string; tokenId: bigint }[]
  >([]);
  const [aggregatedHolders, setAggregatedHolders] = useState<AggregatedHolder[]>([]);
  const [visibleHolders, setVisibleHolders] = useState<AggregatedHolder[]>([]);
  const [loadingMinters, setLoadingMinters] = useState(false);
  const [hasMoreHolders, setHasMoreHolders] = useState(true);
  const [nextTokenIdToFetch, setNextTokenIdToFetch] = useState<bigint>(1n);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial batch of token owners
  useEffect(() => {
    if (!totalSupply && totalSupply !== 0n) return;

    let cancelled = false;
    setLoadingMinters(true);

    (async () => {
      try {
        // Only fetch up to totalSupply or INITIAL_BATCH_SIZE
        const maxTokenId =
          totalSupply && totalSupply > 0n
            ? totalSupply < BigInt(INITIAL_BATCH_SIZE)
              ? totalSupply
              : BigInt(INITIAL_BATCH_SIZE)
            : 1n;
        const owners = await fetchTokenOwnersBatch(
          contractAddress,
          1n,
          maxTokenId
        );

        if (!cancelled) {
          setRawMinters(owners); // owners is now { address, tokenId }[]
          const aggregated = aggregateAndRankHolders(owners);
          setAggregatedHolders(aggregated);
          setVisibleHolders(aggregated.slice(0, ITEMS_PER_PAGE));
          setHasMoreHolders(
            (totalSupply && maxTokenId < totalSupply) ||
              aggregated.length > ITEMS_PER_PAGE
          );
          setNextTokenIdToFetch(maxTokenId + 1n);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to fetch supporters');
      } finally {
        if (!cancelled) setLoadingMinters(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [totalSupply, contractAddress]);

  // Load more holders (fetch next batch)
  const loadMoreHolders = async () => {
    if (!totalSupply || loadingMore) return;
    setLoadingMore(true);

    try {
      // Fetch next batch, but not past totalSupply
      const endTokenId =
        nextTokenIdToFetch + BigInt(INITIAL_BATCH_SIZE) - 1n > totalSupply
          ? totalSupply
          : nextTokenIdToFetch + BigInt(INITIAL_BATCH_SIZE) - 1n;
      const owners = await fetchTokenOwnersBatch(
        contractAddress,
        nextTokenIdToFetch,
        endTokenId
      );
      
      // Merge with previous minters
      const newRawMinters = [...rawMinters, ...owners]; // both are { address, tokenId }[]
      setRawMinters(newRawMinters);

      // Aggregate and update holders
      const aggregated = aggregateAndRankHolders(newRawMinters);
      setAggregatedHolders(aggregated);

      // Add next page of holders to visible
      setVisibleHolders(
        aggregated.slice(0, visibleHolders.length + ITEMS_PER_PAGE)
      );

      // Update next token id to fetch
      setNextTokenIdToFetch(endTokenId + 1n);

      // Check if more holders exist
      setHasMoreHolders(endTokenId < totalSupply);
    } catch (err) {
      setError('Failed to load more supporters');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Box borderWidth={1} display="flex" flexDir="column" alignItems='stretch' gap={3} rounded="lg" p={6} _dark={{ borderColor: 'yellow' }}>
      <HStack gap={2}>
        <FaUsers size={24} color="#FFD700" />
        <Heading size='xl'>
          Community Supporters
        </Heading>
      </HStack>
      {loadingMinters && visibleHolders.length === 0 ? (
        <Flex justify='center' my={4}>
          <Spinner size='sm' mr={2} />
          <Text>Loading supporters...</Text>
        </Flex>
      ) : visibleHolders.length > 0 ? (
        <>
          {/* Vertical grid of supporter cards */}
          <Box pb={2}>
            <SimpleGrid 
              columns={{ base: 2, sm: 3, md: 4 }}
              gap={3} 
              w="100%"
            >
              {visibleHolders.map((holder, index) => (
                <Box 
                  key={index} 
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
          
          {/* Load More Button */}
          {hasMoreHolders && (
            <Button
              onClick={loadMoreHolders}
              mt={4}
              size='sm'
              variant='outline'
              loading={loadingMore}
              w="full"
            >
              Show More Supporters
            </Button>
          )}
        </>
      ) : (
        <Text>No supporters found</Text>
      )}

      {/* Loading indicator when fetching more data */}
      {loadingMore && visibleHolders.length > 0 && (
        <Flex justify='center' mt={2}>
          <Spinner size='sm' mr={2} />
          <Text fontSize='sm'>Fetching more supporters...</Text>
        </Flex>
      )}

      {error && (
        <Text color="red.500" mt={2} fontSize="sm">
          {error}
        </Text>
      )}
    </Box>
  );
};
