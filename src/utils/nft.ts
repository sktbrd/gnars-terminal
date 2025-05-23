import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import zoraNftAbi from '@/utils/abis/zoraNftAbi';

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
 * Converts IPFS URL to HTTP gateway URL
 */
export function ipfsToHttp(url: string): string {
  if (!url) return url;
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.skatehive.app/ipfs/${url.slice(7)}`;
  }
  return url;
}

/**
 * Fetches NFT metadata from a token URI
 */
export async function fetchMetadataFromUri(tokenUri: string): Promise<TokenMetadata | null> {
  try {
    if (!tokenUri) return null;
    
    // Handle base64 encoded JSON
    if (tokenUri.startsWith('data:application/json;base64,')) {
      const base64Data = tokenUri.split(',')[1];
      const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
      return JSON.parse(jsonString);
    } 
    // Handle inline JSON 
    else if (tokenUri.startsWith('data:application/json')) {
      const jsonString = tokenUri.substring(
        tokenUri.indexOf('{'),
        tokenUri.lastIndexOf('}') + 1
      );
      return JSON.parse(jsonString);
    } 
    // Handle remote URI
    else {
      const uri = ipfsToHttp(tokenUri);
      const response = await fetch(uri, { next: { revalidate: 3600 } }); // Cache for 1 hour
      if (!response.ok) return null;
      return response.json();
    }
  } catch (error) {
    console.error('Error parsing token URI:', error);
    return null;
  }
}

/**
 * Fetches complete droposal metadata with normalized URLs
 */
export async function fetchDroposalMetadata(contractAddress: string): Promise<TokenMetadata> {
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

    // Fetch and parse the metadata
    const metadata = await fetchMetadataFromUri(tokenUri);
    if (!metadata) return DEFAULT_METADATA;

    // Normalize image and animation_url
    const image = metadata.image ? ipfsToHttp(metadata.image) : FALLBACK_IMAGE;
    const animation_url = metadata.animation_url ? ipfsToHttp(metadata.animation_url) : '';

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
