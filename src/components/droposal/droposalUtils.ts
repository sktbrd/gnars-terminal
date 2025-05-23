import { Address } from 'viem';
import { safeParseJson } from '@/utils/zora';
import { TokenMetadata, AggregatedHolder } from './types';

// --- Base64 and JSON Processing Utilities ---
export const processBase64TokenUri = (tokenUri: string): TokenMetadata => {
  const base64Data = tokenUri.split(',')[1];
  const base64Decoded = atob(base64Data);
  const bytes = new Uint8Array(base64Decoded.length);
  for (let i = 0; i < base64Decoded.length; i++) {
    bytes[i] = base64Decoded.charCodeAt(i);
  }
  const jsonString = new TextDecoder('utf-8').decode(bytes);
  console.log('Decoded JSON string:', jsonString);
  return safeParseJson(jsonString);
};

export const processDirectJsonUri = (tokenUri: string): TokenMetadata => {
  const jsonString = tokenUri.substring(
    tokenUri.indexOf('{'),
    tokenUri.lastIndexOf('}') + 1
  );
  return JSON.parse(jsonString);
};

export const fetchUriMetadata = async (uri: string): Promise<TokenMetadata> => {
  const formattedUri = uri.startsWith('ipfs://')
    ? `https://ipfs.skatehive.app/ipfs/${uri.slice(7)}`
    : uri;

  const response = await fetch(formattedUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }
  return await response.json();
};

export const validateMetadata = (metadata: any): TokenMetadata => {
  if (!metadata.name || !metadata.image) {
    throw new Error('Invalid metadata: Missing required fields');
  }
  return metadata;
};

// --- Token Owners and Holders Utilities ---
export const aggregateAndRankHolders = (
  minters: { address: string; tokenId: bigint }[]
): AggregatedHolder[] => {
  // Create a map to aggregate holders
  const holdersMap = new Map<string, { count: number; tokens: bigint[] }>();

  // Count tokens per address
  minters.forEach(({ address, tokenId }) => {
    if (holdersMap.has(address)) {
      const data = holdersMap.get(address)!;
      data.count += 1;
      data.tokens.push(tokenId);
    } else {
      holdersMap.set(address, { count: 1, tokens: [tokenId] });
    }
  });

  // Convert map to array and sort by token count (descending)
  const sorted = Array.from(holdersMap.entries())
    .map(([address, data]) => ({
      address,
      tokenCount: data.count,
      tokenIds: data.tokens,
    }))
    .sort((a, b) => b.tokenCount - a.tokenCount);

  return sorted;
};

// Fetch a batch of token owners using the batch API
export const fetchTokenOwnersBatch = async (
  contractAddress: Address,
  startTokenId: bigint,
  endTokenId: bigint
) => {
  // Add a delay to avoid spamming the RPC
  await new Promise((resolve) => setTimeout(resolve, 400)); // 400ms delay between batch requests
  try {
    const response = await fetch(
      `/api/zora?contractAddress=${contractAddress}&startTokenId=${startTokenId.toString()}&endTokenId=${endTokenId.toString()}`
    );
    const data = await response.json();
    if (data.isInternalErrorContract) {
      return [];
    }
    if (!response.ok || !data.owners) {
      return [];
    }
    // Map to { address, tokenId }
    return data.owners
      .filter((o: any) => o.exists && o.owner)
      .map((o: any) => ({ address: o.owner, tokenId: BigInt(o.tokenId) }));
  } catch (err) {
    console.error('Error fetching owners batch:', err);
    return [];
  }
};

// --- Image Processing Utilities ---
export const getImageUrl = (imageUri?: string) => {
  const FALLBACK_IMAGE = '/images/gnars.webp';
  if (!imageUri || typeof imageUri !== 'string') return FALLBACK_IMAGE;
  if (imageUri.startsWith('ipfs://')) {
    return `https://ipfs.skatehive.app/ipfs/${imageUri.slice(7)}`;
  }
  if (!imageUri.startsWith('http')) return FALLBACK_IMAGE;
  return imageUri;
};
