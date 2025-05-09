export { metadata } from './metadata';
import Navbar from '@/components/layout/navbar';
import { Providers } from '@/components/layout/providers';
import { Toaster } from '@/components/ui/toaster';
import { Box, Container } from '@chakra-ui/react';
import '@rainbow-me/rainbowkit/styles.css';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { type ReactNode } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
