import AccountCard from '@/components/cards/account';
import AuctionCard from '@/components/cards/auction';
import GovernorCard from '@/components/cards/governor';
import Navbar from '@/components/layout/navbar';
import { VStack } from '@chakra-ui/react';

function App() {
  return (
    <VStack gap={4} align={'start'}>
      <AccountCard />
      <AuctionCard />
      <GovernorCard />
    </VStack>
  );
}

export default App;
