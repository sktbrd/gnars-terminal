import { useState, useEffect } from 'react';
import { Address } from 'viem';

export interface AggregatedHolder {
  address: string;
  tokenCount: number;
  tokenIds: bigint[];
}

interface SerializedHolder {
  address: string;
  tokenCount: number;
  tokenIds: string[];
}

interface SupportersResponse {
  supporters: SerializedHolder[];
  totalSupply: string;
  hasMore: boolean;
  nextTokenId: string;
}

export function useSupporters({
  contractAddress,
  totalSupply,
  batchSize = 20,
  itemsPerPage = 8,
}: {
  contractAddress: Address;
  totalSupply: bigint | null;
  batchSize?: number;
  itemsPerPage?: number;
}) {
  const [supporters, setSupporters] = useState<AggregatedHolder[]>([]);
  const [visibleSupporters, setVisibleSupporters] = useState<AggregatedHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextToken, setNextToken] = useState<bigint>(1n);

  useEffect(() => {
    if (!contractAddress || totalSupply === null) return;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, totalSupply]);

  async function loadMore() {
    if (!hasMore || loading) return;
    setLoading(true);

    const end = nextToken + BigInt(batchSize) - 1n;
    const params = new URLSearchParams({
      contractAddress,
      startTokenId: nextToken.toString(),
      endTokenId: end.toString(),
    });

    const res = await fetch(`/api/supporters?${params}`);
    const data: SupportersResponse = await res.json();
    const deserialized = data.supporters.map(h => ({
      ...h,
      tokenIds: h.tokenIds.map(id => BigInt(id)),
    }));

    setSupporters(prev => [...prev, ...deserialized]);
    setVisibleSupporters(prev => [...prev, ...deserialized].slice(0, itemsPerPage));
    setHasMore(data.hasMore);
    setNextToken(BigInt(data.nextTokenId));
    setLoading(false);
  }

  return { supporters, visibleSupporters, loadMore, loading, hasMore };
}
