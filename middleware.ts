import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Legacy subcategory URLs (SEO): must be 301.
  const redirects: Record<string, string> = {
    '/material-escolar/iniciacion-deportiva': '/material-escolar/material-didactico',
    '/material-escolar/iniciacion-deportiva/': '/material-escolar/material-didactico',
    '/material-escolar/malabares': '/material-escolar/material-didactico',
    '/material-escolar/malabares/': '/material-escolar/material-didactico',
    '/material-escolar/colchonetas': '/material-escolar/manualidades',
    '/material-escolar/colchonetas/': '/material-escolar/manualidades',
    '/material-escolar/balones-escolares': '/material-escolar/educacion-infantil',
    '/material-escolar/balones-escolares/': '/material-escolar/educacion-infantil',
    '/material-escolar/educacion-musical': '/material-escolar/juguetes-educativos',
    '/material-escolar/educacion-musical/': '/material-escolar/juguetes-educativos',
  };

  const destination = redirects[pathname];
  if (!destination) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = destination;
  url.search = search; // preserve query params

  return NextResponse.redirect(url, 301);
}

export const config = {
  // Solo interceptar los paths legacy para minimizar impacto.
  matcher: [
    '/material-escolar/iniciacion-deportiva',
    '/material-escolar/iniciacion-deportiva/',
    '/material-escolar/malabares',
    '/material-escolar/malabares/',
    '/material-escolar/colchonetas',
    '/material-escolar/colchonetas/',
    '/material-escolar/balones-escolares',
    '/material-escolar/balones-escolares/',
    '/material-escolar/educacion-musical',
    '/material-escolar/educacion-musical/',
  ],
};

