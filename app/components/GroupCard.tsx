import Link from 'next/link';
import Image from 'next/image';

interface GroupCardProps {
  grupo: {
    nombre: string;
    slug: string;
    count: number;
    image?: string | null;
  };
  categoriaSlug: string;
  subcategorySlug: string;
}

export default function GroupCard({ grupo, categoriaSlug, subcategorySlug }: GroupCardProps) {
  const href = `/${categoriaSlug}/${subcategorySlug}/${grupo.slug}`;
  
  // Intentar obtener imagen del grupo desde productos
  const defaultImage = grupo.image || '/categorias/Gemini_Generated_Image_brwh6gbrwh6gbrwh.png';
  
  // Desactivar optimización para CDNs externos problemáticos
  const shouldUnoptimize = defaultImage.includes('cdn.jimsports.shop') || 
                          defaultImage.includes('jimsports.shop') ||
                          defaultImage.includes('madeforsport.eu');

  return (
    <Link
      href={href}
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-[#003366] hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <Image
          src={defaultImage}
          alt={grupo.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={shouldUnoptimize}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#003366] transition-colors">
          {grupo.nombre}
        </h3>
        <p className="text-sm text-gray-500">
          {grupo.count} {grupo.count === 1 ? 'producto' : 'productos'}
        </p>
      </div>
    </Link>
  );
}
