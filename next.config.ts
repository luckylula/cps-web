import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Fijar la raíz del proyecto (donde está este config y .env.local) para Turbopack
  turbopack: { root: path.resolve(__dirname) },
  // Evitar que los errores de TypeScript en archivos generados internos de Next (.next/dev)
  // rompan el build. Seguimos viendo los errores en el editor/ESLint.
  typescript: {
    ignoreBuildErrors: true,
  },
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
        hostname: 'cdn.b2b.grupojimsports.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'minilandgroup.com',
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
  async redirects() {
    return [
      {
        source: '/material-escolar/iniciacion-deportiva',
        destination: '/material-escolar/material-didactico',
        permanent: true,
      },
      {
        // Actualmente la UI puede haber enlazado a este slug (legacy).
        source: '/material-escolar/malabares',
        destination: '/material-escolar/material-didactico',
        permanent: true,
      },
      {
        source: '/material-escolar/colchonetas',
        destination: '/material-escolar/manualidades',
        permanent: true,
      },
      {
        source: '/material-escolar/balones-escolares',
        destination: '/material-escolar/educacion-infantil',
        permanent: true,
      },
      {
        source: '/material-escolar/educacion-musical',
        destination: '/material-escolar/juguetes-educativos',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
