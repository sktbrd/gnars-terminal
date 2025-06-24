import { useState, useEffect, useCallback, useRef } from 'react';
import { Address } from 'viem';

export interface AggregatedHolder {
  address: string;
  tokenCount: number;
  tokenIds: bigint[];
}

// Types that match the API response (serialized)
interface SerializedAggregatedHolder {
  address: string;
  tokenCount: number;
  tokenIds: string[];
}

interface SupportersApiResponse {
  supporters: SerializedAggregatedHolder[];
  totalSupply: string;
  hasMore: boolean;
  nextTokenId: string;
  cached: boolean;
}

// Convert API response back to component-friendly format
function deserializeSupporters(apiResponse: SupportersApiResponse): {
  supporters: AggregatedHolder[];
  totalSupply: bigint;
  hasMore: boolean;
  nextTokenId: bigint;
  cached: boolean;
} {
  return {
    supporters: apiResponse.supporters.map(supporter => ({
      ...supporter,
      tokenIds: supporter.tokenIds.map(id => BigInt(id))
    })),
    totalSupply: BigInt(apiResponse.totalSupply),
    hasMore: apiResponse.hasMore,
    nextTokenId: BigInt(apiResponse.nextTokenId),
    cached: apiResponse.cached
  };
}

interface UseSupportersOptions {
  contractAddress: Address;
  totalSupply: bigint | null;
  batchSize?: number;
  itemsPerPage?: number;
  autoLoad?: boolean;
}

interface UseSupportersReturn {
  supporters: AggregatedHolder[];
  visibleSupporters: AggregatedHolder[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  showMore: () => void;
  totalSupply: bigint;
  cached: boolean;
}

export function useSupporters({
  contractAddress,
  totalSupply,
  batchSize = 20,
  itemsPerPage = 8,
  autoLoad = true
}: UseSupportersOptions): UseSupportersReturn {
  const [supporters, setSupporters] = useState<AggregatedHolder[]>([]);
  const [visibleSupporters, setVisibleSupporters] = useState<AggregatedHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextTokenId, setNextTokenId] = useState<bigint>(1n);
  const [actualTotalSupply, setActualTotalSupply] = useState<bigint>(0n);
  const [cached, setCached] = useState(false);
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  
  // Track which contracts we've already loaded using a ref to persist across renders
  const loadedContracts = useRef(new Set<string>());

  // Only run when contract changes and we haven't loaded it yet
  useEffect(() => {
    if (!autoLoad) {
      return;
    }
    
    if (!contractAddress) {
      return;
    }
    
    if (totalSupply === null || totalSupply === undefined) {
      return;
    }
    
    if (loadedContracts.current.has(contractAddress)) {
      return;
    }

    loadedContracts.current.add(contractAddress);

    const fetchInitialSupporters = async () => {
      try {
        setLoading(true);
        setError(null);

        const initialEndTokenId = totalSupply > 0n
          ? totalSupply < BigInt(batchSize) ? totalSupply : BigInt(batchSize)
          : BigInt(batchSize);

        const params = new URLSearchParams({
          contractAddress,
          startTokenId: '1',
          endTokenId: initialEndTokenId.toString()
        });

        const response = await fetch(`/api/supporters?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch supporters: ${response.statusText}`);
        }

        const apiData: SupportersApiResponse = await response.json();
        
        // Convert string tokenIds back to bigint
        const supportersData = apiData.supporters.map(supporter => ({
          ...supporter,
          tokenIds: supporter.tokenIds.map(id => BigInt(id))
        }));

        setSupporters(supportersData);
        setVisibleSupporters(supportersData.slice(0, itemsPerPage));
        setVisibleCount(itemsPerPage);
        setHasMore(apiData.hasMore);
        setNextTokenId(BigInt(apiData.nextTokenId));
        setActualTotalSupply(BigInt(apiData.totalSupply));
        setCached(apiData.cached);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch supporters';
        setError(errorMessage);
        console.error('Error fetching supporters:', err);
        // Remove from loaded contracts so it can be retried
        loadedContracts.current.delete(contractAddress);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSupporters();
  }, [contractAddress, totalSupply, autoLoad, batchSize, itemsPerPage]); // Add back necessary dependencies

  // Load more supporters (fetch next batch from API)
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      
      const endTokenId = nextTokenId + BigInt(batchSize) - 1n;
      const params = new URLSearchParams({
        contractAddress,
        startTokenId: nextTokenId.toString(),
        endTokenId: endTokenId.toString()
      });

      const response = await fetch(`/api/supporters?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch supporters: ${response.statusText}`);
      }

      const apiData: SupportersApiResponse = await response.json();
      
      // Convert string tokenIds back to bigint
      const newSupportersData = apiData.supporters.map(supporter => ({
        ...supporter,
        tokenIds: supporter.tokenIds.map(id => BigInt(id))
      }));

      // Merge with existing supporters and re-aggregate
      setSupporters(currentSupporters => {
        const allTokenData = [
          ...currentSupporters.flatMap(s => s.tokenIds.map(tokenId => ({ 
            address: s.address, 
            tokenId 
          }))),
          ...newSupportersData.flatMap(s => s.tokenIds.map(tokenId => ({ 
            address: s.address, 
            tokenId 
          })))
        ];

        // Re-aggregate
        const holdersMap = new Map<string, { count: number; tokens: bigint[] }>();
        
        allTokenData.forEach(({ address, tokenId }) => {
          if (holdersMap.has(address)) {
            const holder = holdersMap.get(address)!;
            holder.count += 1;
            holder.tokens.push(tokenId);
          } else {
            holdersMap.set(address, { count: 1, tokens: [tokenId] });
          }
        });

        const aggregated = Array.from(holdersMap.entries())
          .map(([address, data]) => ({
            address,
            tokenCount: data.count,
            tokenIds: data.tokens,
          }))
          .sort((a, b) => b.tokenCount - a.tokenCount);

        // Update visible supporters with current visible count
        setVisibleSupporters(aggregated.slice(0, visibleCount));
        
        return aggregated;
      });

      setHasMore(apiData.hasMore);
      setNextTokenId(BigInt(apiData.nextTokenId));
      setActualTotalSupply(BigInt(apiData.totalSupply));
      setCached(apiData.cached);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more supporters';
      setError(errorMessage);
      console.error('Error loading more supporters:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextTokenId, batchSize, contractAddress, visibleCount]);

  // Show more supporters (from already fetched data)
  const showMore = useCallback(async () => {
    const newVisibleCount = visibleCount + itemsPerPage;
    setVisibleCount(newVisibleCount);
    setVisibleSupporters(supporters.slice(0, newVisibleCount));
  }, [supporters, visibleCount, itemsPerPage]);

  // Combined load more function that handles both cases
  const handleLoadMore = useCallback(async () => {
    const canShowMoreFromExisting = supporters.length > visibleCount;
    if (canShowMoreFromExisting) {
      await showMore();
    } else {
      await loadMore();
    }
  }, [supporters.length, visibleCount, showMore, loadMore]);

  // Determine if we can show more from existing data or need to load more
  const canShowMoreFromExisting = supporters.length > visibleCount;
  const finalHasMore = canShowMoreFromExisting || hasMore;

  return {
    supporters,
    visibleSupporters,
    loading,
    loadingMore,
    error,
    hasMore: finalHasMore,
    loadMore: handleLoadMore,
    showMore,
    totalSupply: actualTotalSupply,
    cached
  };
}
