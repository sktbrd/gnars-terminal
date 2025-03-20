'use client';

import { WHISK_API_KEY } from '@/utils/constants';
import { getConfig } from '@/utils/wagmi';
import { WhiskSdkProvider } from '@paperclip-labs/whisk-sdk';
import { IdentityResolver } from '@paperclip-labs/whisk-sdk/identity';
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { type ReactNode, useState } from 'react';
import { Provider as ChakraProvider } from '../ui/provider';

const WagmiProvider = dynamic(
  () => import('wagmi').then((mod) => mod.WagmiProvider),
  { ssr: false }
);

export function Providers(props: { children: ReactNode }) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <RainbowProvider>
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
          </RainbowProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function RainbowProvider(props: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <RainbowKitProvider theme={theme === 'dark' ? darkTheme() : lightTheme()}>
      {props.children}
    </RainbowKitProvider>
  );
}
