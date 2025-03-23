import AuctionCard from '@/components/cards/auction';
import GovernorCard from '@/components/cards/governor';
import MapCard from '@/components/cards/map';
import DroposalCard from '@/components/droposals/DroposalCard';
import { Status } from '@/components/proposal/status';
import InitFrameSDK from '@/components/utils/hooks/init-frame-sdk';
import { fetchAuction } from '@/services/auction';
import { APP_URL, DAO_ADDRESSES } from '@/utils/constants';
import { Grid, GridItem, VStack } from '@chakra-ui/react';
import { headers } from 'next/headers';

export const revalidate = 60;

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/opengraph-image`,
  button: {
    title: 'Open Gnars',
    action: {
      type: 'launch_frame',
      name: 'Gnars Frame',
      url: `${APP_URL}/`,
    },
  },
};

export const metadata = {
    other: {
      'fc:frame': JSON.stringify(frame),
    },
};

async function App() {
  headers();
  const auctions = await fetchAuction(
    DAO_ADDRESSES.token,
    'endTime',
    'desc',
    1
  );
  const activeAuction = auctions[0];

  return (
    <VStack gap={4} align={'start'}>
      <InitFrameSDK />
      <Grid
        templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
        templateRows={{ base: 'auto', md: 'repeat(2, 1fr)', lg: 'auto' }}
        gap={4}
        w={'full'}
      >
        <GridItem>
          <DroposalCard />
        </GridItem>
        <GridItem>
          <AuctionCard defaultAuction={activeAuction} />
        </GridItem>
      </Grid>
      <GovernorCard
        limit={12}
        tabDefault='grid'
        gridColumns={4}
        filterBy={[
          Status.ACTIVE,
          Status.EXECUTED,
          Status.PENDING,
          Status.SUCCEEDED,
          Status.DEFEATED,
          Status.QUEUED,
        ]}
      />
      <MapCard />
    </VStack>
  );
}

export default App;
