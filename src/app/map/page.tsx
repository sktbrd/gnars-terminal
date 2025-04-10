import { Metadata } from 'next';

// Generate metadata for Farcaster frames
export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = 'https://i.ibb.co/4Zd90fbG/Image-Resizer-Clipboard-1.png'; // Hardcoded thumbnail image
  const homeUrl = 'https://gnars.com/map'; // Direct URL to the map

  const frame = {
    version: 'next',
    imageUrl,
    button: {
      title: 'Open Map',
      action: {
        type: 'launch_frame',
        name: 'Gnars World Map',
        url: homeUrl,
      },
    },
  };

  return {
    title: 'Gnars World Map',
    description: 'Explore the Gnars world map',
    openGraph: {
      title: 'Gnars World Map',
      description: 'Explore the Gnars world map',
      images: [imageUrl],
    },
    other: {
      'fc:frame': JSON.stringify(frame),
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
