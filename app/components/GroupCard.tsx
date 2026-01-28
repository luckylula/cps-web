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
  
  // Usar imagen local basada en el slug del grupo
  // Formato: /categorias/{slug}.png (ej: /categorias/futbol.png, /categorias/baloncesto.png, etc.)
  const defaultImage = `/categorias/${grupo.slug}.png`;
  
  // Desactivar optimización para CDNs externos problemáticos
  const shouldUnoptimize = defaultImage.includes('cdn.jimsports.shop') || 
                          defaultImage.includes('jimsports.shop') ||
                          defaultImage.includes('madeforsport.eu');

  return (
    <Link
      href={href}
      className="group bg-white overflow-hidden cursor-pointer text-left"
    >
      <div className="relative h-80 bg-gray-100 overflow-hidden">
        <Image
          src={defaultImage}
          alt={grupo.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={shouldUnoptimize}
        />
      </div>
      <div className="pt-4">
        <h3 className="text-gray-900 font-medium text-lg mb-1">
          {grupo.nombre}
        </h3>
      </div>
    </Link>
  );
}
