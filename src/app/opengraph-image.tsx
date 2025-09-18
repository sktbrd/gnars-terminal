import { ImageResponse } from 'next/og';

export const alt = 'Gnars DAO';

// Aspect ratio 3:2
export const size = {
  width: 973,
  height: 649,
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Image() {
  // Use the local image from public directory
  const imageUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/images/shredquarters.png`
    : 'https://gnars-terminal.vercel.app/images/shredquarters.png';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
        }}
      >
        <img
          src={imageUrl}
          width='973'
          height='649'
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          alt='Gnars DAO'
        />
      </div>
    ),
    { ...size }
  );
}
