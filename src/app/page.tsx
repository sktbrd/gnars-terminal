import AccountCard from '@/components/cards/account';
import AuctionCard from '@/components/cards/auction';
import GovernorCard from '@/components/cards/governor';
import { ColorModeButton } from '@/components/ui/color-mode';
import {
  Box,
  Container,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { BsGithub } from 'react-icons/bs';

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
            <HStack>
              <Link href='https://github.com/r4topunk/gnars-terminal'>
                <IconButton
                  variant={'outline'}
                  colorPalette={'black'}
                  size={'sm'}
                >
                  <BsGithub style={{ background: 'none' }} />
                </IconButton>
              </Link>
              <ColorModeButton variant={'outline'} />
            </HStack>
          </HStack>
          <AccountCard />
          <AuctionCard />
          <GovernorCard />
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
