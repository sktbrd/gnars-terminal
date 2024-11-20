'use client';

import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <>
      <ChakraLink asChild>
        <NextLink href='/dao'>
          <Button colorPalette={'purple'} variant={'subtle'}>
            Auction
          </Button>
        </NextLink>
      </ChakraLink>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type='button' onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type='button'
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{connectError?.message}</div>
      </div>
    </>
  );
}

export default App;
