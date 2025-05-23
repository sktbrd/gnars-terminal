import { Metadata } from 'next';
import InitFrameSDK from '@/components/utils/hooks/init-frame-sdk';
import { fetchDroposalMetadata } from '@/utils/nft';
import DroposalPage from '@/components/droposal/DroposalPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { contractAddress: string };
}): Promise<Metadata> {
  const { contractAddress } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gnars.com';
  const meta = await fetchDroposalMetadata(contractAddress);
  
  // Always use the OG/frame image generator endpoint for both OpenGraph and frame metadata
  const frameImageUrl = `${appUrl}/api/droposal-image?contractAddress=${contractAddress}`;
  
  // Create the Farcaster frame config
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
      images: [frameImageUrl],
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
      <DroposalPage initialMetadata={meta} />
    </>
  );
}
