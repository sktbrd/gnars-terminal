import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'edge';

// Dynamically import the ABI
async function getZoraMintAbi() {
  return (await import('@/utils/abis/zoraNftAbi')).default;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { contractAddress: string } }
) {
  const { contractAddress } = params;
  let imageUrl = 'https://gnars.com/images/logo-banner.jpg'; // fallback
  let name = 'Droposal';
  let description = '';
  try {
    const zoraMintAbi = await getZoraMintAbi();
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
    if (metadata.image) {
      imageUrl = metadata.image.startsWith('ipfs://')
        ? `https://ipfs.skatehive.app/ipfs/${metadata.image.slice(7)}`
        : metadata.image;
    }
    if (metadata.name) name = metadata.name;
    if (metadata.description) description = metadata.description;
  } catch (e) {
    // fallback to default image
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#fff',
        }}
      >
        <img
          src={imageUrl}
          alt={name}
          style={{
            width: 400,
            height: 400,
            objectFit: 'contain',
            borderRadius: 24,
            marginBottom: 32,
            background: '#f5f5f5',
          }}
        />
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#000',
            marginBottom: 16,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#444',
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      width: 800,
      height: 600,
    }
  );
}
