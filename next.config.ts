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
        hostname: 'www.madeforsport.eu',
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
    // Configuración para manejar imágenes que fallan
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Aumentar timeout para imágenes remotas
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
