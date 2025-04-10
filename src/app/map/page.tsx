import { Metadata } from 'next';

// Determine the base URL dynamically based on the environment
const appUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://gnars.com';

// Generate metadata for Farcaster frames
export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `https://i.ibb.co/vvd8ZH5D/Image-Resizer-Clipboard-2.png`; // Ensure this matches the origin
  const homeUrl = `https://gnars.center/map`; // Ensure this matches the origin

  const frame = {
    version: 'next',
    imageUrl,
    button: {
      title: 'Open Nounstacles Map',
      action: {
        type: 'launch_frame',
        name: 'Nounstacles Map', // Ensure this name is unique
        url: homeUrl,
      },
    },
  };

  return {
    title: 'Nounstacles Map',
    description:
      'Explore Noggles Rail Map - See the world of Gnars and navigate through exciting locations!',
    metadataBase: new URL(appUrl), // Dynamically set the base URL

    // Enhanced OpenGraph metadata
    openGraph: {
      title: 'Nounstacles Map - Gnars World',
      description:
        'Explore Noggles Rail Map - See the world of Gnars and navigate through exciting locations!',
      type: 'website',
      url: homeUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 675,
          alt: 'Gnars World Map Preview',
        },
      ],
      siteName: 'Gnars',
    },

    // Twitter metadata
    twitter: {
      card: 'summary_large_image',
      title: 'Nounstacles Map - Gnars World',
      description: 'Explore Noggles Rail Map - The interactive world of Gnars',
      images: [imageUrl],
    },

    // Farcaster frame metadata
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
