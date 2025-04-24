import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Gnars DAO - Community-Owned Action Sports Brand',
    template: '%s | Gnars DAO'
  },
  description:
    'Gnars DAO is a Nounish, CC0 action-sports collective funding skateboarders, surfers and creators via on-chain NFT auctions – now on Base.',
  keywords: [
    'Gnars DAO',
    'Gnars',
    'Nounish',
    'skate DAO',
    'action sports NFTs',
    'on-chain generative art',
    'extreme sports sponsorship',
    'Base network NFTs'
  ],
  metadataBase: new URL('https://www.gnars.com'),
  alternates: {
    canonical: 'https://www.gnars.com/'
  },
  authors: [{ name: 'Gnars DAO Core Team', url: 'https://www.gnars.com' }],
  creator: 'Gnars DAO',
  publisher: 'Gnars DAO',
  category: 'sports',
  robots: {
    index: true,
    follow: true,
    nocache: false
  },
  openGraph: {
    type: 'website',
    url: 'https://www.gnars.com',
    title: 'Gnars DAO – Community-Owned Action Sports Brand',
    description:
      'Funding the next generation of skate, surf and extreme-sports athletes through perpetual on-chain NFT auctions.',
    siteName: 'Gnars DAO',
    locale: 'en_US',
    images: [
      {
        url: '/images/gnars-og.png',
        width: 1200,
        height: 630,
        alt: 'Gnars DAO – Skate and Surf On-Chain'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gnars_dao',
    creator: '@gnars_dao',
    title: 'Gnars DAO – Action Sports On-Chain',
    description:
      'Gnars DAO bankrolls athletes & artists with a community-governed, on-chain treasury. One Gnar, one vote.',
    images: ['/images/gnars-og.png']
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};
