'use client';

import { mainnet, base } from 'viem/chains';
import { WC_PROJECT_ID } from './constants';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export function getConfig() {
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
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    interface Chain {
      network: string;
      rpcUrls: {
      default: {
        http: string[];
      };
      };
      [key: string]: any;
    }

    interface WagmiConfig {
      chains: Chain[];
      [key: string]: any;
    }

    const typedConfig = config as WagmiConfig;
    console.log('[wagmi config] chains:', typedConfig.chains.map((c: Chain) => c.network), typedConfig);
  }
  return config;
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
