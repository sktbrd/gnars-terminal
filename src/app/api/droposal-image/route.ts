import * as React from 'react';
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function fetchDroposalMetadata(contractAddress: string) {
  const FALLBACK_IMAGE = 'https://gnars.com/images/gnars.webp';
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contractAddress = searchParams.get('contractAddress');
  if (!contractAddress) {
    return new Response('Missing contractAddress', { status: 400 });
  }
  const meta = await fetchDroposalMetadata(contractAddress);
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
          backgroundImage: `url(${meta.image})`,
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
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontSize: 56,
            fontWeight: 700,
            textAlign: 'center',
            padding: '40px 40px',
            letterSpacing: '-1px',
            textShadow: '0 4px 24px #000',
          },
        },
        meta.name || contractAddress
      )
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
