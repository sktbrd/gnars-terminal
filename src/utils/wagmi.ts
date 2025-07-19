'use client';

import { mainnet, base } from 'viem/chains';
import { WC_PROJECT_ID } from './constants';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export function getConfig() {
  if (!process.env.NEXT_PUBLIC_ALCHEMY_KEY) {
    throw new Error('NEXT_PUBLIC_ALCHEMY_KEY environment variable is required');
  }

  const config = getDefaultConfig({
    appName: 'Gnars',
    chains: [
      {
        ...mainnet,
        rpcUrls: {
          default: {
            http: [`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`],
          },
        },
      },
      base
    ], // ENS needs mainnet
    projectId: WC_PROJECT_ID,
    ssr: false,
  });

  return config;
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
