import * as React from 'react';
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { put, list } from '@vercel/blob';

async function fetchDroposalMetadata(contractAddress: string) {
  // Use a PNG fallback image (Edge runtime does not support webp)
  const FALLBACK_IMAGE = 'https://gnars.com/images/shredquarters.png';
  try {
    const { createPublicClient, http } = await import('viem');
    const { base } = await import('viem/chains');
    const zoraMintAbi = (await import('@/utils/abis/zoraNftAbi')).default;
    const client = createPublicClient({ chain: base, transport: http() });
    const tokenUri = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: zoraMintAbi,
      functionName: 'tokenURI',
      args: [1n],
    });
    let metadata: any = {};
    if (typeof tokenUri === 'string') {
      if (tokenUri.startsWith('data:application/json;base64,')) {
        const base64Data = tokenUri.split(',')[1];
        const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
        metadata = JSON.parse(jsonString);
      } else if (tokenUri.startsWith('data:application/json')) {
        const jsonString = tokenUri.substring(
          tokenUri.indexOf('{'),
          tokenUri.lastIndexOf('}') + 1
        );
        metadata = JSON.parse(jsonString);
      } else {
        const uri = tokenUri.startsWith('ipfs://')
          ? `https://ipfs.skatehive.app/ipfs/${tokenUri.slice(7)}`
          : tokenUri;
        const res = await fetch(uri);
        if (res.ok) metadata = await res.json();
      }
    }
    // Debug output
    console.log('[droposal-image] contract:', contractAddress, 'tokenUri:', tokenUri, 'metadata:', metadata);
    // Normalize image and animation_url as in page.tsx
    let image = metadata.image;
    if (image && image.startsWith('ipfs://'))
      image = `https://ipfs.skatehive.app/ipfs/${image.slice(7)}`;
    let animation_url = metadata.animation_url;
    if (animation_url && animation_url.startsWith('ipfs://'))
      animation_url = `https://ipfs.skatehive.app/ipfs/${animation_url.slice(7)}`;
    if (!image || typeof image !== 'string' || !image.startsWith('http')) {
      image = FALLBACK_IMAGE;
    }
    return {
      name: metadata.name || '',
      description: metadata.description || '',
      image: image,
      animation_url: animation_url || '',
      properties: metadata.properties || {},
      attributes: metadata.attributes || [],
    };
  } catch (e) {
    console.error('[droposal-image] ERROR', e);
    return {
      name: '',
      description: '',
      image: FALLBACK_IMAGE,
      animation_url: '',
      properties: {},
      attributes: [],
    };
  }
}

async function getOrCacheImage(imageUrl: string, cacheKey: string): Promise<string> {
  // Remove strict PNG/JPEG check, allow any image URL
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return 'https://gnars.com/images/shredquarters.png';
  }
  // 1. Check if image is already in Blob Storage
  const blobs = await list({ prefix: cacheKey });
  if (blobs && blobs.blobs && blobs.blobs.length > 0) return blobs.blobs[0].url;

  // 2. Download from remote (IPFS or other) with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const res = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return 'https://gnars.com/images/shredquarters.png';
    const arrayBuffer = await res.arrayBuffer();
    // 3. Upload to Blob Storage
    const { url } = await put(cacheKey, Buffer.from(arrayBuffer), { access: 'public' });
    return url;
  } catch {
    return 'https://gnars.com/images/shredquarters.png';
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contractAddress = searchParams.get('contractAddress');
  if (!contractAddress) {
    return new Response('Missing contractAddress', { status: 400 });
  }
  let meta, error;
  try {
    meta = await fetchDroposalMetadata(contractAddress);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    meta = {
      name: '',
      description: '',
      image: 'https://gnars.com/images/shredquarters.png',
      animation_url: '',
      properties: {},
      attributes: [],
    };
  }
  // Use meta.image for the background, fallback to local PNG if not valid, and cache to CDN
  const cacheKey = `droposals/${contractAddress}.png`;
  const backgroundImage = await getOrCacheImage(meta.image, cacheKey);
  const overlayText = meta.name && meta.name.trim().length > 0
    ? meta.name
    : `No metadata found for\n${contractAddress}`;
  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: 48,
            fontWeight: 700,
            textAlign: 'center',
            padding: '40px 40px',
            letterSpacing: '-1px',
            textShadow: '0 4px 24px #000',
            whiteSpace: 'pre-line',
          },
        },
        overlayText
      )
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
