// next-types.d.ts
// Tipos mínimos para que TypeScript no falle al validar archivos internos de Next (.next/dev/types)

declare module 'next/types.js' {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module 'next/server.js' {
  export type NextRequest = any;
}
