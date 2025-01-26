'use client';

import { getConfig } from '@/utils/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { type State, WagmiProvider } from 'wagmi';
import { Provider as ChakraProvider } from '../ui/provider';
import { WhiskSdkProvider } from '@paperclip-labs/whisk-sdk';
import { WHISK_API_KEY } from '@/utils/constants';

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <WhiskSdkProvider
            apiKey={WHISK_API_KEY}
            config={{
              identity: {
                resolvers: [
                  'nns',
                  'ens',
                  'base',
                  'farcaster',
                  'uni',
                  'lens',
                  'world',
                ],
              },
            }}
          >
            {props.children}
          </WhiskSdkProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
