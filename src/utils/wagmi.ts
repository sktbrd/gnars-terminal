'use client';

import { base } from 'wagmi/chains';
import { WC_PROJECT_ID } from './constants';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export function getConfig() {
  return getDefaultConfig({
    appName: 'Gnars',
    chains: [base],
    projectId: WC_PROJECT_ID,
    ssr: true,
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
