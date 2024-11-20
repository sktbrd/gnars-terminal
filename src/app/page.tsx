'use client';

import AuctionCard from '@/components/cards/auction';
import { Button } from '@/components/ui/button';
import { ColorModeButton } from '@/components/ui/color-mode';
import {
  Box,
  Link as ChakraLink,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Box
      minH={'100vh'}
      bg={'bg.panel'}
      colorPalette={'yellow'}
      color={{ base: 'black', _dark: 'white' }}
      padding={4}
    >
      <ColorModeButton variant={'outline'} pos={'absolute'} right={4} top={4} />
      <Container maxW={'2xl'}>
        <VStack
          gap={8}
          // justify={'start'}
          align={'start'}
          // textAlign={'center'}
        >
          <Heading size={'4xl'} as='h1'>
            Gnars Terminal
          </Heading>

          <AuctionCard />

          <div>
            <Heading as='h2'>Links</Heading>
            <ChakraLink asChild>
              <NextLink href='/auction'>
                <Button variant={'subtle'}>Auction</Button>
              </NextLink>
            </ChakraLink>
          </div>
          <div>
            <Heading as='h2'>Account</Heading>

            <div>
              status: {account.status}
              <br />
              addresses: {JSON.stringify(account.addresses)}
              <br />
              chainId: {account.chainId}
            </div>

            {connectError?.message ? (
              <div>Error: {connectError?.message}</div>
            ) : null}

            {account.status !== 'disconnected' && (
              <Button
                colorPalette={'red'}
                variant={'subtle'}
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
            )}
          </div>

          {account.status === 'disconnected' && (
            <div>
              <Heading as={'h2'}>Connect</Heading>
              {connectors.map((connector) => (
                <Button
                  mr={2}
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  variant={'subtle'}
                >
                  {connector.name}
                </Button>
              ))}
            </div>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
