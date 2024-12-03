import AuctionCard from '@/components/cards/auction';
import GovernorCard from '@/components/cards/governor';
import { VStack } from '@chakra-ui/react';

function App() {
  return (
    <VStack gap={4} align={'start'}>
      <AuctionCard />
      <GovernorCard />
    </VStack>
  );
}

export default App;
