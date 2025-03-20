'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import AuctionCard from '@/components/cards/auction';
import { Auction } from '@/services/auction';

export default function Demo({ auction }: { auction: Auction }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <div className='w-[300px] mx-auto py-4 px-2'>
      <AuctionCard defaultAuction={auction} />
    </div>
  );
}
