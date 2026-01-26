import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jimsports.shop',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'madeforsport.eu',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jimsports.shop',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
