'use client';

import { getConfig } from '@/utils/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState, useEffect } from 'react';
import { type State, WagmiProvider } from 'wagmi';
import { Provider as ChakraProvider } from '../ui/provider';
import { WhiskSdkProvider } from '@paperclip-labs/whisk-sdk';
import { WHISK_API_KEY } from '@/utils/constants';
import { IdentityResolver } from '@paperclip-labs/whisk-sdk/identity';

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <WhiskSdkProvider
            apiKey={WHISK_API_KEY}
            config={{
              identity: {
                resolverOrder: [
                  IdentityResolver.Nns,
                  IdentityResolver.Farcaster,
                  IdentityResolver.Ens,
                  IdentityResolver.Base,
                  IdentityResolver.Lens,
                  IdentityResolver.Uni,
                  IdentityResolver.World,
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
