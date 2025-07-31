import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';

export const dynamic = 'force-dynamic';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

interface AggregatedHolder {
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

// simple in-memory cache
const cache = new Map<string, { data: SupportersResponse; time: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(addr: string, start: bigint, end: bigint) {
  return `${addr}-${start}-${end}`;
}

async function fetchOwnersBatch(
  address: Address,
  startId: bigint,
  endId: bigint,
): Promise<{ address: string; tokenId: bigint }[]> {
  const contracts = [] as { address: Address; abi: any; functionName: string; args: [bigint] }[];
  for (let id = startId; id <= endId; id++) {
    contracts.push({ address, abi: zoraMintAbi, functionName: 'ownerOf', args: [id] });
  }

  const results = await publicClient.multicall({ contracts });
  return results
    .filter(r => r.status === 'success' && r.result)
    .map((r, i) => ({ address: r.result as Address, tokenId: startId + BigInt(i) }));
}

function aggregateHolders(items: { address: string; tokenId: bigint }[]): AggregatedHolder[] {
  const map = new Map<string, { count: number; tokens: bigint[] }>();
  for (const { address, tokenId } of items) {
    const entry = map.get(address) ?? { count: 0, tokens: [] };
    entry.count++;
    entry.tokens.push(tokenId);
    map.set(address, entry);
  }
  return Array.from(map.entries())
    .map(([address, { count, tokens }]) => ({ address, tokenCount: count, tokenIds: tokens }))
    .sort((a, b) => b.tokenCount - a.tokenCount);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contract = searchParams.get('contractAddress') as Address | null;
  if (!contract) {
    return NextResponse.json({ error: 'Missing contractAddress' }, { status: 400 });
  }
  const start = BigInt(searchParams.get('startTokenId') ?? '1');
  const end = BigInt(searchParams.get('endTokenId') ?? (start + 19n));
  const limit = parseInt(searchParams.get('limit') ?? '0');

  const key = cacheKey(contract, start, end);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < TTL) {
    const resp = cached.data;
    const supporters = limit ? resp.supporters.slice(0, limit) : resp.supporters;
    return NextResponse.json({ ...resp, supporters });
  }

  const totalSupply: bigint = await publicClient.readContract({
    address: contract,
    abi: zoraMintAbi,
    functionName: 'totalSupply',
  });

  const owners = await fetchOwnersBatch(contract, start, end);
  const holders = aggregateHolders(owners);

  const response: SupportersResponse = {
    supporters: holders.slice(0, limit || holders.length).map(h => ({
      ...h,
      tokenIds: h.tokenIds.map(id => id.toString()),
    })),
    totalSupply: totalSupply.toString(),
    hasMore: totalSupply > end,
    nextTokenId: (end + 1n).toString(),
  };

  cache.set(key, { data: response, time: Date.now() });

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
