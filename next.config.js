/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.zora.co',
      },
    ],
  },
};

module.exports = nextConfig;
