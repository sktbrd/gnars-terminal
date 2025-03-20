import Navbar from '@/components/layout/navbar';
import { Providers } from '@/components/layout/providers';
import { Toaster } from '@/components/ui/toaster';
import { Box, Container } from '@chakra-ui/react';
import '@rainbow-me/rainbowkit/styles.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { type ReactNode } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: 'Launch Frame',
    action: {
      type: 'launch_frame',
      name: 'Farcaster Frames v2 Demo',
      url: `${appUrl}/frames/auction/`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
};

export const metadata: Metadata = {
  title: 'Gnars Dao',
  description: 'Gnarly Ecosystem',
  metadataBase: new URL('https://www.gnars.com'),
  icons: ['favicon.ico'],
  openGraph: {
    images: [
      {
        url: '/images/shredquarters.png',
        width: 800,
        height: 600,
        alt: 'Gnars Pro',
      },
    ],
  },
  other: {
    'fc:frame': JSON.stringify(frame),
  },
};

export const viewport = {
  themeColor: '#FFD700',
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body
        className={inter.className}
        suppressHydrationWarning
        style={{ minHeight: '100vh' }}
      >
        <Providers>
          <Navbar />
          <Box
            minH={'full'}
            bg={'bg.panel'}
            colorPalette={'yellow'}
            color={{ base: 'black', _dark: 'white' }}
            paddingBlock={{ base: 2, md: 4 }}
          >
            <Container maxW={'breakpoint-2xl'}>{props.children}</Container>
          </Box>
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
