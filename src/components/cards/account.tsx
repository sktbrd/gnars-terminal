'use client';

import { Button } from '@/components/ui/button';
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function AccountCard() {
  const account = useAccount();
  const { connectors, connect, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Box shadow={'sm'} w={'full'} padding={4} rounded={'md'}>
      <VStack align={'start'}>
        <Heading as='h2'>Account</Heading>
        {account.isConnected ? (
          <>
            <div>
              status: {account.status}
              <br />
              addresses: {JSON.stringify(account.addresses)}
              <br />
              chainId: {account.chainId}
            </div>
            <Button
              colorPalette={'red'}
              variant={'subtle'}
              onClick={() => disconnect()}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Text fontSize={'sm'}>Connect your wallet</Text>
            <HStack gap={2}>
              {connectors.map((connector) => (
                <Button
                  size={'xs'}
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  variant={'subtle'}
                >
                  {connector.name}
                </Button>
              ))}
            </HStack>
          </>
        )}

        {connectError?.message ? (
          <div>Error: {connectError?.message}</div>
        ) : null}
      </VStack>
    </Box>
  );
}
