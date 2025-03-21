// import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from 'next';
import ClientPage from './client-page';
import { fetchAuction } from '@/services/auction';
import { APP_URL, DAO_ADDRESSES } from '@/utils/constants';


const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/frames/auction/opengraph-image`,
  button: {
    title: 'Launch Frame',
    action: {
      type: 'launch_frame',
      name: 'Farcaster Frames v2 Demo',
      url: `${APP_URL}/frames/auction/`,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
};

export const metadata: Metadata = {
  title: 'Gnars Dao',
  description: 'Gnarly Ecosystem',
  other: {
    'fc:frame': JSON.stringify(frame),
  },
};

export default async function Page() {
  const auctions = await fetchAuction(
    DAO_ADDRESSES.token,
    'endTime',
    'desc',
    1
  );
  const activeAuction = auctions[0];

  return <ClientPage auction={activeAuction} />;
}
