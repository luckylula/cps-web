import Link from 'next/link';
import Image from 'next/image';

interface SubcategoryCardProps {
  subcategory: {
    nombre: string;
    slug: string;
  };
  categoriaSlug: string;
}

// Subcategorías que usan video en lugar de imagen (path raíz /categorias/)
const SUBCATEGORIES_WITH_VIDEO = ['mobiliario', 'calzado', 'individual'];

// Material Escolar: imágenes y videos en /categorias/material-escolar/
const MATERIAL_ESCOLAR_MEDIA: Record<string, { type: 'image' | 'video'; file: string }> = {
  psicomotricidad: { type: 'image', file: 'psicomotricidad.png' },
  'figuras-espuma': { type: 'video', file: 'figuras-espuma.mp4' },
  'balones-escolares': { type: 'image', file: 'balones-escolares.jpg' },
  'juegos-alternativos': { type: 'video', file: 'juegos-alternativos.mp4' },
  malabares: { type: 'image', file: 'malabares.jpg' },
  'educacion-infantil': { type: 'video', file: 'educacion-infantil.mp4' },
  'material-foam': { type: 'image', file: 'material-foam.jpg' },
  colchonetas: { type: 'image', file: 'colchonetas.jpg' },
  'educacion-musical': { type: 'image', file: 'educacion-musical.jpg' },
  juegos: { type: 'image', file: 'juegos-alternativos.jpg' },
  'iniciacion-deportiva': { type: 'image', file: 'balones-escolares.jpg' },
};

export default function SubcategoryCard({ subcategory, categoriaSlug }: SubcategoryCardProps) {
  const href = `/${categoriaSlug}/${subcategory.slug}`;
  
  let useVideo: boolean;
  let mediaSrc: string;

  if (categoriaSlug === 'material-escolar') {
    const media = MATERIAL_ESCOLAR_MEDIA[subcategory.slug];
    if (media) {
      useVideo = media.type === 'video';
      mediaSrc = `/categorias/material-escolar/${media.file}`;
    } else {
      useVideo = false;
      mediaSrc = `/categorias/material-escolar/${subcategory.slug}.png`;
    }
  } else {
    const imageName = subcategory.slug.replace(/-/g, '');
    useVideo = SUBCATEGORIES_WITH_VIDEO.includes(subcategory.slug);
    mediaSrc = useVideo ? `/categorias/${imageName}.mp4` : `/categorias/${imageName}.png`;
  }
  
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
