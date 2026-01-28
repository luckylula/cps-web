import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getSubcategoryName } from '@/app/lib/navigationMapping';

interface SubcategoryCardProps {
  subcategory: {
    nombre: string;
    slug: string;
  };
  categoriaSlug: string;
}

async function getSubcategoryImage(categoriaSlug: string, subcategorySlug: string): Promise<string | null> {
  // Obtener el nombre completo de la subcategoría usando el mapping
  const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug);
  
  if (!subcategoryName) {
    return null;
  }

  // Buscar un producto de esta subcategoría para obtener su imagen
  const sampleProduct = await prisma.product.findFirst({
    where: {
      categoryId: categoriaSlug,
      subcategory: subcategoryName,
      visible_web: true,
      activo: true,
      images: {
        isEmpty: false,
      },
    },
    select: {
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return sampleProduct?.images && sampleProduct.images.length > 0 
    ? sampleProduct.images[0] 
    : null;
}

export default async function SubcategoryCard({ subcategory, categoriaSlug }: SubcategoryCardProps) {
  const href = `/${categoriaSlug}/${subcategory.slug}`;
  
  // Obtener imagen de ejemplo de la subcategoría usando el slug
  const subcategoryImage = await getSubcategoryImage(categoriaSlug, subcategory.slug);
  const defaultImage = subcategoryImage || '/categorias/Gemini_Generated_Image_brwh6gbrwh6gbrwh.png';
  
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
          alt={subcategory.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={shouldUnoptimize}
        />
      </div>
      <div className="pt-4">
        <h3 className="text-gray-900 font-medium text-lg mb-1">
          {subcategory.nombre}
        </h3>
      </div>
    </Link>
  );
}
