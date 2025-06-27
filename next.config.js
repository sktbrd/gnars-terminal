/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      // Primary IPFS gateway (IPFS.io) - Nouns.build researched public gateway
      {
        source: '/ipfs/:path*',
        destination: 'https://ipfs.io/ipfs/:path*',
      },
      // Secondary IPFS gateway (DWeb.link)
      {
        source: '/ipfs-dweb/:path*',
        destination: 'https://dweb.link/ipfs/:path*',
      },
      // Web3.Storage gateway
      {
        source: '/ipfs-w3s/:path*',
        destination: 'https://w3s.link/ipfs/:path*',
      },
      // FLK IPFS gateway
      {
        source: '/ipfs-flk/:path*',
        destination: 'https://flk-ipfs.xyz/ipfs/:path*',
      },
      // Decentralized Content gateway
      {
        source: '/ipfs-dc/:path*',
        destination: 'https://ipfs.decentralized-content.com/ipfs/:path*',
      },
      // Skatehive gateway (fallback)
      {
        source: '/ipfs-skatehive/:path*',
        destination: 'https://ipfs.skatehive.app/ipfs/:path*',
      },
      // Last resort IPFS gateway (paid) - use only if others fail
      {
        source: '/ipfs-paid/:path*',
        destination: process.env.NEXT_PUBLIC_IPFS_PAID_GATEWAY 
          ? `${process.env.NEXT_PUBLIC_IPFS_PAID_GATEWAY.replace(/\/$/, '')}/:path*`
          : 'https://gateway.pinata.cloud/ipfs/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/ipfs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // Cache for 1 year
          },
        ],
      },
      {
        source: '/ipfs-dweb/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/ipfs-w3s/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/ipfs-flk/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/ipfs-dc/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/ipfs-skatehive/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/ipfs-paid/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
