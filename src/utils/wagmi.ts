'use client';

import { cookieStorage, createStorage } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { WC_PROJECT_ID } from './constants';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export function getConfig() {
  return getDefaultConfig({
    appName: 'Gnars',
    chains: [base, mainnet],
    projectId: WC_PROJECT_ID,
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
