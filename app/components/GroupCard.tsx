import Link from 'next/link';
import Image from 'next/image';

// Grupos que usan video en lugar de imagen (slug -> nombre archivo video si difiere)
const GROUPS_WITH_VIDEO: Record<string, string | true> = {
  'por-deporte-padel': 'pordeporte-padel', // video: pordeporte-padel.mp4
  futbol: true,   // futbol.mp4
  baloncesto: 'video baloncesto chicas', // video baloncesto chicas.mp4
  voleibol: true, // voleibol.mp4
  rugby: true,    // rugby.mp4
  yoga: true,     // yoga.mp4
  gimnasia: true, // gimnasia.mp4
  'deportes-de-playa': true, // deportesdeplaya.mp4
  'natacion-y-playa': 'deportesdeplaya',
};

// Grupos con imagen personalizada por subcategoría (subcategorySlug -> grupoSlug -> nombre archivo)
const CUSTOM_GROUP_IMAGES: Record<string, Record<string, string>> = {
  colectivos: {
    'futbol-sala': 'futbolsala',
  },
  'estructuras-deportivas': {
    varios: 'variosestructuras',
    'futbol-sala': 'futbolsala',
  },
};

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
  
  // Usar imagen o video local basado en el slug del grupo
  const customImage = CUSTOM_GROUP_IMAGES[subcategorySlug]?.[grupo.slug];
  const imageName = customImage || grupo.slug.replace(/-/g, '');
  const videoFile = GROUPS_WITH_VIDEO[grupo.slug];
  const useVideo = !!videoFile;
  const mediaSrc = encodeURI(
    useVideo
      ? `/categorias/${videoFile === true ? imageName : videoFile}.mp4`
      : `/categorias/${imageName}.png`,
  );
  
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
            alt={grupo.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={shouldUnoptimize}
          />
        )}
      </div>
      <div className="pt-4">
        <h3 className="text-gray-900 font-medium text-lg mb-1">
          {grupo.nombre}
        </h3>
      </div>
    </Link>
  );
}
