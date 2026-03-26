import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de cookies',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PoliticaDeCookiesPage() {
  return (
    <iframe
      src="/documentos/politica-de-cookies.pdf"
      title="Politica de cookies"
      style={{ width: '100%', height: '90vh', border: 'none' }}
    />
  );
}
