import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de privacidad',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PoliticaDePrivacidadPage() {
  return (
    <iframe
      src="/documentos/politica-de-privacidad.pdf"
      title="Politica de privacidad"
      style={{ width: '100%', height: '90vh', border: 'none' }}
    />
  );
}
