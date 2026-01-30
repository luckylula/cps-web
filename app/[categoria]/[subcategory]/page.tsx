import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import GroupCard from '@/app/components/GroupCard';
import ProductsPageClient from '@/app/components/ProductsPageClient';
import { getSubcategoryName, getCategoryName, getGrupoName } from '@/app/lib/navigationMapping';
import { generateCategoryMetadata, generateBreadcrumbs } from '@/app/lib/seoUtils';
import { convertProductsToClient } from '@/app/lib/productUtils';
import { navigationStructure } from '@/app/lib/navigationStructure';

export const dynamic = 'force-dynamic';

/**
 * Para deportes: en BD grupo = nivel 2 (Individual/Colectivos), subcategory = nivel 3 (Fitness/Fútbol).
 * Devuelve los valores correctos para filtrar en la BD.
 */
function getDbGrupoAndSubcategoryForDeportes(
  categoriaSlug: string,
  subcategoryName: string | null,
  grupoName: string | null
): { dbGrupo: string | null; dbSubcategory: string | null } {
  if (categoriaSlug === 'deportes' && subcategoryName && grupoName) {
    return { dbGrupo: subcategoryName, dbSubcategory: grupoName };
  }
  return { dbGrupo: grupoName, dbSubcategory: subcategoryName };
}

interface PageProps {
  params: Promise<{ categoria: string; subcategory: string }>;
}

const NAV_SLUGS = navigationStructure.map((c) => c.slug);

async function getCategory(slug: string) {
  let category = await prisma.category.findUnique({
    where: { slug },
  });
  if (!category && NAV_SLUGS.includes(slug)) {
    const name = getCategoryName(slug) || slug;
    category = await prisma.category.upsert({
      where: { slug },
      create: { id: slug, name, slug },
      update: { name },
    });
  }
  return category;
}

async function getGroupsForSubcategory(categoriaSlug: string, subcategorySlug: string) {
  const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug);
  
  // Obtener grupos desde la estructura de navegación
  const categoria = navigationStructure.find(c => c.slug === categoriaSlug);
  const subcategoria = categoria?.subcategorias.find(s => s.slug === subcategorySlug);
  
  if (!subcategoria || subcategoria.grupos.length === 0) {
    return [];
  }

  // Obtener información de cada grupo desde la BD
  const groupsWithData = await Promise.all(
    subcategoria.grupos.map(async (grupo) => {
      const grupoName = getGrupoName(categoriaSlug, subcategorySlug, grupo.slug) || grupo.nombre;
      const { dbGrupo, dbSubcategory } = getDbGrupoAndSubcategoryForDeportes(
        categoriaSlug,
        subcategoryName,
        grupoName
      );

      const productWhere = {
        categoryId: categoriaSlug,
        subcategory: dbSubcategory || undefined,
        grupo: dbGrupo || undefined,
        published: true,
        visible_web: true,
        activo: true,
      };

      const count = await prisma.product.count({
        where: productWhere,
      });

      const sampleProduct = await prisma.product.findFirst({
        where: {
          ...productWhere,
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

      // Usar la primera imagen del producto o null
      const groupImage = sampleProduct?.images && sampleProduct.images.length > 0 
        ? sampleProduct.images[0] 
        : null;

      return {
        nombre: grupo.nombre,
        slug: grupo.slug,
        count,
        image: groupImage,
      };
    })
  );

  // Filtrar solo grupos que tienen productos
  return groupsWithData.filter(g => g.count > 0);
}

async function getProductsForSubcategory(categoriaSlug: string, subcategoryName: string) {
  const { dbGrupo, dbSubcategory } = getDbGrupoAndSubcategoryForDeportes(
    categoriaSlug,
    subcategoryName,
    null
  );
  const where = {
    categoryId: categoriaSlug,
    subcategory: dbSubcategory || subcategoryName,
    grupo: dbGrupo || undefined,
    published: true,
    visible_web: true,
    activo: true,
    name: { not: '' },
    OR: [
      { sku_interno: null },
      { sku_interno: { not: { endsWith: '-BASE' } } },
    ],
  };
  return prisma.product.findMany({
    where,
    orderBy: { name: 'asc' },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, subcategory } = await params;
  const category = await getCategory(categoria);
  const subcategoryName = getSubcategoryName(categoria, subcategory);

  // Para deportes, la "subcategoría" nav (Individual/Colectivos/Raqueta) en BD es grupo
  const countWhere: any = {
    categoryId: categoria,
    published: true,
    visible_web: true,
    activo: true,
  };
  if (categoria === 'deportes' && subcategoryName) {
    countWhere.grupo = subcategoryName;
  } else if (subcategoryName) {
    countWhere.subcategory = subcategoryName;
  }

  const productCount = await prisma.product.count({
    where: countWhere,
  });

  return generateCategoryMetadata({
    categoria,
    subcategory,
    categoryDescription: category?.description || undefined,
    productCount,
  });
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { categoria, subcategory } = await params;
  
  const category = await getCategory(categoria);
  if (!category) {
    notFound();
  }

  const categoryName = getCategoryName(categoria) || category.name;
  const subcategoryName = getSubcategoryName(categoria, subcategory) || subcategory;

  const groups = await getGroupsForSubcategory(categoria, subcategory);
  const productsForSubcategory =
    groups.length === 0
      ? await getProductsForSubcategory(categoria, subcategoryName)
      : [];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <Breadcrumbs 
            items={generateBreadcrumbs({ categoria, subcategory })} 
            baseUrl={process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : 'https://cpsmaterialdeportivo.es'}
          />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tight">
              {subcategoryName}
            </h1>
            <p className="text-gray-600">{categoryName}</p>
            {groups.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Selecciona un grupo para ver los productos disponibles
              </p>
            )}
          </div>

          {groups.length === 0 ? (
            productsForSubcategory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No hay grupos ni productos en esta subcategoría</p>
              </div>
            ) : (
              <ProductsPageClient products={convertProductsToClient(productsForSubcategory)} />
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((grupo) => (
                <GroupCard
                  key={grupo.slug}
                  grupo={grupo}
                  categoriaSlug={categoria}
                  subcategorySlug={subcategory}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
