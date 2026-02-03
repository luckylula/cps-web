import Link from 'next/link';
import Image from 'next/image';

interface SubcategoryCardProps {
  subcategory: {
    nombre: string;
    slug: string;
  };
  categoriaSlug: string;
}

// Subcategorías que usan video en lugar de imagen
const SUBCATEGORIES_WITH_VIDEO = ['mobiliario'];

export default function SubcategoryCard({ subcategory, categoriaSlug }: SubcategoryCardProps) {
  const href = `/${categoriaSlug}/${subcategory.slug}`;
  
  // Usar imagen o video local basado en el slug de la subcategoría
  const imageName = subcategory.slug.replace(/-/g, '');
  const useVideo = SUBCATEGORIES_WITH_VIDEO.includes(subcategory.slug);
  const mediaSrc = useVideo ? `/categorias/${imageName}.mp4` : `/categorias/${imageName}.png`;
  
  const shouldUnoptimize = mediaSrc.includes('cdn.jimsports.shop') || 
                          mediaSrc.includes('jimsports.shop') ||
                          mediaSrc.includes('madeforsport.eu');

  return (
    <Link
      href={href}
      className="group bg-white overflow-hidden cursor-pointer text-left"
    >
      <div className="relative h-80 bg-gray-100 overflow-hidden">
        {useVideo ? (
          <video
            src={mediaSrc}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Image
            src={mediaSrc}
            alt={subcategory.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={shouldUnoptimize}
          />
        )}
      </div>
      <div className="pt-4">
        <h3 className="text-gray-900 font-medium text-lg mb-1">
          {subcategory.nombre}
        </h3>
      </div>
    </Link>
  );
}
