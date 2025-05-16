import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '<APP_ID>.ufs.sh',
        pathname: '/f/*',
      },
    ],
  },
};

export default nextConfig;
