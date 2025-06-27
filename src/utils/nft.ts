import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import zoraNftAbi from '@/utils/abis/zoraNftAbi';
import { safeParseJson } from '@/utils/zora';
import { resolveIpfsUrl, ipfsToHttp } from '@/utils/ipfs-gateway';

/**
 * Interface for NFT metadata matching what the DroposalClient expects
 */
export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  properties?: {
    number: number;
    name: string;
  };
  attributes?: Array<{ trait_type: string; value: string }>;
}

/**
 * Converts IPFS URL to HTTP gateway URL using optimized gateway selection
 */
export function ipfsToHttpOptimized(url: string): string {
  if (!url) return url;
  return ipfsToHttp(url);
}

/**
 * Converts IPFS URL to HTTP gateway URL with fallback resolution
 * Use this for critical paths that need reliable resolution
 */
export async function ipfsToHttpReliable(url: string, skipPaidGateways = false): Promise<string> {
  if (!url) return url;
  if (!url.includes('ipfs')) return url;
  
  try {
    return await resolveIpfsUrl(url, { skipPaidGateways });
  } catch (error) {
    console.warn('Failed to resolve IPFS URL reliably, falling back to simple conversion:', error);
    return ipfsToHttp(url);
  }
}

// Legacy function for backward compatibility
export { ipfsToHttpOptimized as ipfsToHttp };

/**
 * Fetches NFT metadata from a token URI with optimized gateway usage
 */
export async function fetchMetadataFromUri(tokenUri: string, skipPaidGateways = false): Promise<TokenMetadata | null> {
  try {
    if (!tokenUri) return null;
    
    // Handle base64 encoded JSON
    if (tokenUri.startsWith('data:application/json;base64,')) {
      const base64Data = tokenUri.split(',')[1];
      const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
      return safeParseJson(jsonString);
    } 
    // Handle inline JSON 
    else if (tokenUri.startsWith('data:application/json')) {
      const jsonString = tokenUri.substring(
        tokenUri.indexOf('{'),
        tokenUri.lastIndexOf('}') + 1
      );
      return safeParseJson(jsonString);
    } 
    // Handle remote URI with optimized gateway selection
    else {
      const optimizedUri = await ipfsToHttpReliable(tokenUri, skipPaidGateways);
      const response = await fetch(optimizedUri, { next: { revalidate: 3600 } }); // Cache for 1 hour
      if (!response.ok) {
        // Try alternative gateway if first fails
        if (!skipPaidGateways) {
          console.warn(`Primary gateway failed for ${tokenUri}, trying without paid gateway restriction`);
          const fallbackUri = await ipfsToHttpReliable(tokenUri, true);
          const fallbackResponse = await fetch(fallbackUri, { next: { revalidate: 3600 } });
          if (fallbackResponse.ok) {
            const jsonText = await fallbackResponse.text();
            return safeParseJson(jsonText);
          }
        }
        return null;
      }
      const jsonText = await response.text();
      return safeParseJson(jsonText);
    }
  } catch (error) {
    console.error('Error parsing token URI:', error);
    return null;
  }
}

/**
 * Fetches complete droposal metadata with normalized URLs and optimized gateway usage
 */
export async function fetchDroposalMetadata(contractAddress: string, options: { skipPaidGateways?: boolean } = {}): Promise<TokenMetadata> {
  const FALLBACK_IMAGE = '/images/gnars.webp';
  const DEFAULT_METADATA: TokenMetadata = {
    name: '',
    description: '',
    image: FALLBACK_IMAGE,
    animation_url: '',
    properties: {
      number: 0,
      name: ''
    },
    attributes: [],
  };

  try {
    // Create a public client for Base network
    const client = createPublicClient({ 
      chain: base, 
      transport: http() 
    });

    // Fetch the token URI for token #1
    const tokenUri = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: zoraNftAbi,
      functionName: 'tokenURI',
      args: [1n],
    });

    if (!tokenUri || typeof tokenUri !== 'string') {
      return DEFAULT_METADATA;
    }

    // Fetch and parse the metadata with optimized gateway usage
    const metadata = await fetchMetadataFromUri(tokenUri, options.skipPaidGateways);
    if (!metadata) return DEFAULT_METADATA;

    // Normalize image and animation_url with optimized gateway selection
    const image = metadata.image ? await ipfsToHttpReliable(metadata.image, options.skipPaidGateways) : FALLBACK_IMAGE;
    const animation_url = metadata.animation_url ? await ipfsToHttpReliable(metadata.animation_url, options.skipPaidGateways) : '';

    // Validate image URL
    const finalImage = (!image || typeof image !== 'string' || !image.startsWith('http'))
      ? FALLBACK_IMAGE
      : image;

    // Ensure properties has the required structure
    const properties = metadata.properties || { number: 0, name: '' };
    if (typeof properties.number !== 'number') properties.number = 0;
    if (typeof properties.name !== 'string') properties.name = '';

    // Normalize attribute values to be strings
    const attributes = metadata.attributes?.map(attr => ({
      trait_type: attr.trait_type,
      value: String(attr.value) // Convert any numeric values to strings
    })) || [];

    return {
      name: metadata.name || '',
      description: metadata.description || '',
      image: finalImage,
      animation_url: animation_url,
      properties: properties,
      attributes: attributes,
    };
  } catch (error) {
    console.error('Error fetching droposal metadata:', error);
    return DEFAULT_METADATA;
  }
}
