import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jimsports.shop',
        pathname: '/**',
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
    // Calidad de imagen por defecto y formatos modernos
    formats: ['image/avif', 'image/webp'],
    // Aumentar límite de tamaño de imagen
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
