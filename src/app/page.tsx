import AccountCard from '@/components/cards/account';
import AuctionCard from '@/components/cards/auction';
import GovernorCard from '@/components/cards/governor';
import { ColorModeButton } from '@/components/ui/color-mode';
import { Box, Container, Heading, HStack, VStack } from '@chakra-ui/react';

function App() {
  return (
    <Box
      minH={'100vh'}
      bg={'bg.panel'}
      colorPalette={'yellow'}
      color={{ base: 'black', _dark: 'white' }}
      padding={4}
    >
      <Container maxW={'2xl'}>
        <VStack gap={8} align={'start'}>
          <HStack w={'full'} justify={'space-between'}>
            <Heading size={'4xl'} as='h1'>
              Gnars Terminal
            </Heading>
            <ColorModeButton variant={'outline'} />
          </HStack>
          <GovernorCard />
          <AccountCard />
          <AuctionCard />
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
