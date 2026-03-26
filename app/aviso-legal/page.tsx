import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso legal',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AvisoLegalPage() {
  return (
    <iframe
      src="/documentos/aviso-legal.pdf"
      title="Aviso legal"
      style={{ width: '100%', height: '90vh', border: 'none' }}
    />
  );
}
