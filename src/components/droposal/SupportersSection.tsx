import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Flex,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { Address } from 'viem';
import FormattedAddress from '@/components/utils/names';
import { AggregatedHolder } from './types';
import { fetchTokenOwnersBatch, aggregateAndRankHolders } from './droposalUtils';
import { Button } from '../ui/button';

interface SupportersSectionProps {
  contractAddress: Address;
  totalSupply: bigint | null;
}

const INITIAL_BATCH_SIZE = 20; // Only fetch 20 owners initially
const ITEMS_PER_PAGE = 8; // Display 8 per page

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
    <Box borderWidth={1} display={"flex"} flexDir={"column"} alignItems='stretch' gap={3} rounded={"lg"} p={6} _dark={{ borderColor: 'yellow' }}>
      <Heading size='md' mb={4}>
        Supporters
      </Heading>
      {loadingMinters && visibleHolders.length === 0 ? (
        <Flex justify='center' my={4}>
          <Spinner size='sm' mr={2} />
          <Text>Loading supporters...</Text>
        </Flex>
      ) : visibleHolders.length > 0 ? (
        <VStack align='stretch' gap={2}>
          {visibleHolders.map((holder, index) => (
            <Flex
              key={index}
              justify='space-between'
              p={2}
              borderRadius='md'
            >
              <Flex align='center'>
                <FormattedAddress address={holder.address} />
                <Text
                  fontSize='sm'
                  color='blue.500'
                  ml={2}
                  fontWeight='bold'
                >
                  {holder.tokenCount > 1
                    ? `(${holder.tokenCount} tokens)`
                    : ''}
                </Text>
              </Flex>
              <Text fontSize='sm' color='gray.500'>
                Latest: #{holder.tokenIds[0].toString()}
              </Text>
            </Flex>
          ))}

          {/* Load More Button */}
          {hasMoreHolders && (
            <Button
              onClick={loadMoreHolders}
              mt={2}
              size='sm'
              variant='outline'
              loading={loadingMore}
            >
              Load More Supporters
            </Button>
          )}
        </VStack>
      ) : (
        <Text>No supporters found</Text>
      )}

      {/* Loading indicator when fetching more data */}
      {loadingMore && visibleHolders.length > 0 && (
        <Flex justify='center' mt={2}>
          <Spinner size='sm' mr={2} />
          <Text fontSize='sm'>Fetching more tokens...</Text>
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
