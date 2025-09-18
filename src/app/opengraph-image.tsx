import { ImageResponse } from 'next/og';

export const alt = 'Gnars DAO';

// Aspect ratio 3:2
export const size = {
  width: 973,
  height: 649,
};
const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Image() {
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
          src={`${appUrl}/images/shredquarters.png`}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          alt='Gnars DAO'
        />
      </div>
    ),
    { ...size }
  );
}
