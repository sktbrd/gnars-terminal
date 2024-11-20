'use client';

import { Button } from '@/components/ui/button';
import { formatEthAddress } from '@/utils/helpers';
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function AccountCard() {
  const account = useAccount();
  const { connectors, connect, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Box
      shadow={'sm'}
      w={'full'}
      padding={4}
      rounded={'md'}
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
    >
      <VStack align={'start'} truncate maxW={'full'}>
        <Heading as='h2'>Account</Heading>
        {account.isConnected ? (
          <>
            <div>
              status: {account.status}
              <br />
              address:{' '}
              {account.address ? formatEthAddress(account.address) : ''}
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
            <HStack gap={2} wrap={'wrap'}>
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
