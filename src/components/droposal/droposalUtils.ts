import { Address } from 'viem';
import { safeParseJson } from '@/utils/zora';
import { TokenMetadata, AggregatedHolder } from './types';

// --- Base64 and JSON Processing Utilities ---
export const processBase64TokenUri = (tokenUri: string): TokenMetadata => {
  try {
    const base64Data = tokenUri.split(',')[1];
    if (!base64Data) {
      console.error('No base64 data found in token URI');
      return validateMetadata(null);
    }
    
    const base64Decoded = atob(base64Data);
    const bytes = new Uint8Array(base64Decoded.length);
    for (let i = 0; i < base64Decoded.length; i++) {
      bytes[i] = base64Decoded.charCodeAt(i);
    }
    const jsonString = new TextDecoder('utf-8').decode(bytes);
    
    const parsed = safeParseJson(jsonString);
    return parsed;
  } catch (error) {
    console.error('Error processing base64 token URI:', error);
    return validateMetadata(null);
  }
};

export const processDirectJsonUri = (tokenUri: string): TokenMetadata => {
  try {
    const startIndex = tokenUri.indexOf('{');
    const endIndex = tokenUri.lastIndexOf('}') + 1;
    
    if (startIndex === -1 || endIndex === 0) {
      console.error('No JSON object found in token URI');
      return validateMetadata(null);
    }
    
    const jsonString = tokenUri.substring(startIndex, endIndex);
    
    const parsed = safeParseJson(jsonString);
    return parsed;
  } catch (error) {
    console.error('Error processing direct JSON token URI:', error);
    return validateMetadata(null);
  }
};

export const fetchUriMetadata = async (uri: string): Promise<TokenMetadata> => {
  try {
    const formattedUri = uri.startsWith('ipfs://')
      ? `https://ipfs.skatehive.app/ipfs/${uri.slice(7)}`
      : uri;
    
    const response = await fetch(formattedUri);
    if (!response.ok) {
      console.error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
      return validateMetadata(null);
    }
    
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching URI metadata:', error);
    return validateMetadata(null);
  }
};

export const validateMetadata = (metadata: any): TokenMetadata => {
  // If metadata is null, undefined, or missing required fields, return a fallback
  if (!metadata || !metadata.name || !metadata.image) {
    console.warn('Invalid metadata detected, using fallback:', metadata);
    return {
      name: 'Unknown Token',
      description: 'No description available',
      image: '/images/gnars.webp', // Fallback image
      animation_url: '',
      properties: { number: 0, name: 'Unknown' },
      attributes: [],
    };
  }
  
  // Prefer properties.name over main name if it exists and is cleaner
  const finalName = (metadata.properties?.name && metadata.properties.name.trim()) 
    ? metadata.properties.name.trim() 
    : metadata.name || 'Unknown Token';
  
  // Ensure the metadata has all required fields with proper types
  return {
    name: finalName,
    description: metadata.description || 'No description available',
    image: metadata.image || '/images/gnars.webp',
    animation_url: metadata.animation_url || '',
    properties: metadata.properties || { number: 0, name: 'Unknown' },
    attributes: metadata.attributes || [],
  };
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

// --- Media Type Detection Utilities ---
export const getMediaType = (url?: string, metadata?: any): 'image' | 'video' | 'pdf' | 'unknown' => {
  if (!url || typeof url !== 'string') return 'unknown';
  
  // Check metadata for MIME type hints first
  if (metadata) {
    const mimeType = metadata.content_type || metadata.mimeType || metadata.mime_type;
    if (mimeType) {
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType === 'application/pdf') return 'pdf';
      if (mimeType.startsWith('image/')) return 'image';
    }
    
    // Check for format hints in metadata attributes
    const attributes = metadata.attributes || [];
    const formatAttr = attributes.find((attr: any) => 
      attr.trait_type?.toLowerCase().includes('format') || 
      attr.trait_type?.toLowerCase().includes('type')
    );
    if (formatAttr) {
      const value = formatAttr.value?.toLowerCase();
      if (value?.includes('video') || value?.includes('mp4') || value?.includes('webm')) return 'video';
      if (value?.includes('pdf')) return 'pdf';
    }
  }
  
  const normalizedUrl = url.toLowerCase();
  
  // Check for video extensions and patterns
  if (normalizedUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv|m4v)(\?.*)?$/)) {
    return 'video';
  }
  
  // Check for PDF extensions and patterns
  if (normalizedUrl.match(/\.pdf(\?.*)?$/)) {
    return 'pdf';
  }
  
  // Check for common video streaming patterns
  if (normalizedUrl.includes('video') || normalizedUrl.includes('.mp4') || normalizedUrl.includes('stream')) {
    return 'video';
  }
  
  // Check for image extensions (keep as broad fallback)
  if (normalizedUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff?)(\?.*)?$/)) {
    return 'image';
  }
  
  // For IPFS and unclear URLs, default to image but could be enhanced with content-type detection
  return 'image';
};

export const isMediaSupported = (url?: string, metadata?: any): boolean => {
  const mediaType = getMediaType(url, metadata);
  return ['image', 'video', 'pdf'].includes(mediaType);
};

// --- Content Type Detection via HTTP HEAD Request ---
export const detectContentType = async (url: string): Promise<'image' | 'video' | 'pdf' | 'unknown'> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type')?.toLowerCase();
    
    if (!contentType) return 'unknown';
    
    if (contentType.startsWith('video/')) return 'video';
    if (contentType === 'application/pdf') return 'pdf';
    if (contentType.startsWith('image/')) return 'image';
    
    return 'unknown';
  } catch (error) {
    console.warn('Failed to detect content type for URL:', url, error);
    return 'unknown';
  }
};
