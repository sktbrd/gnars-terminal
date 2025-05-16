import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import InitFrameSDK from '@/components/utils/hooks/init-frame-sdk';
// Move shared metadata fetch logic to a utility function
async function fetchDroposalMetadata(contractAddress: string) {
  const FALLBACK_IMAGE = '/images/gnars.webp';
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
    // Normalize image and animation_url
    let image = metadata.image;
    if (image && image.startsWith('ipfs://'))
      image = `https://ipfs.skatehive.app/ipfs/${image.slice(7)}`;
    let animation_url = metadata.animation_url;
    if (animation_url && animation_url.startsWith('ipfs://'))
      animation_url = `https://ipfs.skatehive.app/ipfs/${animation_url.slice(7)}`;
    // Fallback if image is missing or empty
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
    console.error('Error fetching droposal metadata:', e);
    return {
      name: '',
      description: '',
      image: '/images/gnars.webp',
      animation_url: '',
      properties: {},
      attributes: [],
    };
  }
}

const DroposalClient = dynamic(() => import('./DroposalClient'), {
  ssr: false,
});

export async function generateMetadata({
  params,
}: {
  params: { contractAddress: string };
}): Promise<Metadata> {
  const { contractAddress } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gnars.com';
  // Use the actual token image for the frame, but proxy through gnars.com/api/frame-image
  // so Farcaster and others never hit IPFS directly
  const meta = await fetchDroposalMetadata(contractAddress);
  console.log('Meta:', meta);
  let frameImageUrl = '';
  if (meta.image) {
    // Use the OG image generator with title overlay
    frameImageUrl = `${appUrl}/api/droposal-image?contractAddress=${contractAddress}`;
  }
  const frame = {
    version: 'next',
    imageUrl: frameImageUrl,
    button: {
      title: 'Mint Droposal',
      action: {
        type: 'launch_frame',
        name: 'Gnars Droposal',
        url: `${appUrl}/droposal/${contractAddress}/`,
      },
    },
  };
  return {
    title: meta.name
      ? `Droposal – ${meta.name}`
      : `Droposal – ${contractAddress}`,
    description:
      meta.description ||
      `Collect and view details for contract ${contractAddress}`,
    openGraph: {
      images: frameImageUrl ? [frameImageUrl] : meta.image ? [meta.image] : [],
    },
    other: {
      'fc:frame': JSON.stringify(frame),
      'fc:manifest.accountAssociation.payload': JSON.stringify({
        domain: new URL(appUrl).hostname,
      }),
    },
  };
}

export default async function Page({
  params,
}: {
  params: { contractAddress: string };
}) {
  // Fetch metadata server-side and pass as prop
  const meta = await fetchDroposalMetadata(params.contractAddress);

  return (
    <>
      <InitFrameSDK />
      <DroposalClient initialMetadata={meta} />
    </>
  );
}
