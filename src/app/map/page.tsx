import { Metadata } from 'next';

// Get base URL from environment variable or use a default
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gnars.com';

// Generate metadata for Farcaster frames
export async function generateMetadata(): Promise<Metadata> {
  const frame = {
    version: 'next',
    imageUrl: `${appUrl}/api/map-screenshot`, // This would need a corresponding API route
    button: {
      title: 'Open Map',
      action: {
        type: 'launch_frame',
        name: 'Gnars World Map',
        url: `${appUrl}/map/`,
      },
    },
  };

  return {
    title: 'Gnars World Map',
    description: 'Explore the Gnars world map',
    openGraph: {
      title: 'Gnars World Map',
      description: 'Explore the Gnars world map',
      images: [`${appUrl}/api/map-screenshot`],
    },
    other: {
      'fc:frame': JSON.stringify(frame),
      'fc:frame:image': `${appUrl}/api/map-screenshot`,
      'fc:frame:button:1': 'Open Map',
    },
  };
}

function MapPage() {
  return (
    <iframe
      src='https://gnars.center/map'
      width='100%'
      height='100vh'
      style={{
        border: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    ></iframe>
  );
}
export default MapPage;
