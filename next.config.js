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
      {
        source: '/ipfs/:path*',
        destination: 'https://gateway.pinata.cloud/ipfs/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
