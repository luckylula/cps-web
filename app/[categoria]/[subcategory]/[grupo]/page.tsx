import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import ProductCard from '@/app/components/ProductCard';
import AdvancedFilters from '@/app/components/AdvancedFilters';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import ProductsPageClient from '@/app/components/ProductsPageClient';
import { getGrupoName, getSubcategoryDisplayName, getSubcategoryName, getCategoryName } from '@/app/lib/navigationMapping';
import { generateCategoryMetadata, generateBreadcrumbs } from '@/app/lib/seoUtils';
import { convertProductsToClient, attachVariantInfoToProducts } from '@/app/lib/productUtils';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

/**
 * En la BD (deportes): grupo = deporte (Fútbol, Fitness...), subcategory = Colectivos/Individual/Raqueta.
 * URL /deportes/colectivos/futbol → where.grupo = 'Fútbol', where.subcategory = 'Colectivos'.
 */
function getDbGrupoAndSubcategory(
  _categoriaSlug: string,
  subcategoryName: string | null,
  grupoName: string | null
): { dbGrupo: string | null; dbSubcategory: string | null } {
  return { dbGrupo: grupoName, dbSubcategory: subcategoryName };
}

interface PageProps {
  params: Promise<{ categoria: string; subcategory: string; grupo: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  return category;
}

async function getProducts(
  categoriaSlug: string,
  subcategorySlug: string,
  grupoSlug: string,
  filters: {
    marcas?: string[];
    tipos?: string[];
    precio_min?: string;
    precio_max?: string;
    disponibilidad?: string;
    ordenar?: string;
  }
) {
  const grupoName = getGrupoName(categoriaSlug, subcategorySlug, grupoSlug);
  const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug);
  const { dbGrupo, dbSubcategory } = getDbGrupoAndSubcategory(categoriaSlug, subcategoryName, grupoName);

  const where: any = {
    categoryId: categoriaSlug,
    published: true,
    visible_web: true,
    activo: true,
    name: {
      not: '',
    },
    OR: [
      { sku_interno: null },
      { sku_interno: { not: { endsWith: '-BASE' } } },
    ],
  };

  if (dbSubcategory) {
    where.subcategory = dbSubcategory;
  }

  if (dbGrupo) {
    where.grupo = dbGrupo;
  }

  // Filtro por múltiples marcas
  if (filters.marcas && filters.marcas.length > 0) {
    where.marca = {
      in: filters.marcas,
    };
  }

  // Filtro por tipo de producto
  if (filters.tipos && filters.tipos.length > 0) {
    where.tipo_producto = {
      in: filters.tipos,
    };
  }

  // Filtro por precio
  if (filters.precio_min || filters.precio_max) {
    where.price = {};
    if (filters.precio_min) {
      where.price.gte = parseFloat(filters.precio_min);
    }
    if (filters.precio_max) {
      where.price.lte = parseFloat(filters.precio_max);
    }
    where.price.not = null;
  }

  // Filtro por disponibilidad
  if (filters.disponibilidad === 'en-stock') {
    where.stock = { gt: 0 };
  }

  // Ordenamiento
  let orderBy: any = { name: 'asc' };
  if (filters.ordenar) {
    switch (filters.ordenar) {
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
  });

  const productIds = products.map((p) => p.id);
  const variantRows =
    productIds.length > 0
      ? await prisma.productVariant.findMany({
          where: {
            productId: { in: productIds },
            activo: true,
            visible_web: true,
          },
          select: { productId: true, stock: true, price: true },
        })
      : [];

  return attachVariantInfoToProducts(
    products,
    variantRows.map((r) => ({
      productId: r.productId,
      stock: r.stock,
      price: r.price != null ? Number(r.price) : null,
    }))
  );
}

async function getFilterOptions(
  categoriaSlug: string,
  subcategorySlug: string,
  grupoSlug: string
) {
  const grupoName = getGrupoName(categoriaSlug, subcategorySlug, grupoSlug);
  const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug);
  const { dbGrupo, dbSubcategory } = getDbGrupoAndSubcategory(categoriaSlug, subcategoryName, grupoName);

  const where: any = {
    categoryId: categoriaSlug,
    published: true,
    visible_web: true,
    activo: true,
    marca: { not: null },
  };

  if (dbSubcategory) {
    where.subcategory = dbSubcategory;
  }

  if (dbGrupo) {
    where.grupo = dbGrupo;
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      marca: true,
      price: true,
    },
  });

  const marcas = Array.from(new Set(products.map(p => p.marca).filter(Boolean))) as string[];
  const prices = products
    .map(p => p.price ? Number(p.price) : null)
    .filter((p): p is number => p !== null && !isNaN(p));
  
  // Obtener tipos de producto disponibles (solo para deportes)
  let availableTipos: { tipo_producto: string; _count: { tipo_producto: number } }[] = [];
  if (categoriaSlug === 'deportes') {
    const tiposWhere: any = {
      categoryId: categoriaSlug,
      published: true,
      visible_web: true,
      activo: true,
      tipo_producto: { not: null },
    };

    if (dbSubcategory) {
      tiposWhere.subcategory = dbSubcategory;
    }

    if (dbGrupo) {
      tiposWhere.grupo = dbGrupo;
    }
    
    const tiposData = await prisma.product.groupBy({
      by: ['tipo_producto'],
      where: tiposWhere,
      _count: {
        tipo_producto: true,
      },
    });
    
    availableTipos = tiposData
      .filter(t => t.tipo_producto !== null)
      .map(t => ({
        tipo_producto: t.tipo_producto!,
        _count: { tipo_producto: t._count.tipo_producto },
      }))
      .sort((a, b) => a.tipo_producto.localeCompare(b.tipo_producto));
  }
  
  return {
    marcas: marcas.sort(),
    minPrice: prices.length > 0 ? Math.floor(Math.min(...prices)) : null,
    maxPrice: prices.length > 0 ? Math.ceil(Math.max(...prices)) : null,
    availableTipos,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, subcategory, grupo } = await params;
  const category = await getCategory(categoria);
  const grupoName = getGrupoName(categoria, subcategory, grupo);
  const subcategoryName = getSubcategoryName(categoria, subcategory);
  const { dbGrupo, dbSubcategory } = getDbGrupoAndSubcategory(categoria, subcategoryName, grupoName);

  const productCount = await prisma.product.count({
    where: {
      categoryId: categoria,
      subcategory: dbSubcategory || undefined,
      grupo: dbGrupo || undefined,
      published: true,
      visible_web: true,
      activo: true,
    },
  });

  return generateCategoryMetadata({
    categoria,
    subcategory,
    grupo,
    categoryDescription: category?.description || undefined,
    productCount,
  });
}

export default async function GrupoPage({ params, searchParams }: PageProps) {
  const { categoria, subcategory, grupo } = await params;
  const filters = await searchParams;
  
  const category = await getCategory(categoria);
  if (!category) {
    notFound();
  }

  const categoryName = getCategoryName(categoria) || category.name;
  // Display/UI: el nombre mostrado puede diferir del nombre real usado en BD para filtrar.
  const subcategoryName = getSubcategoryDisplayName(categoria, subcategory) || getSubcategoryName(categoria, subcategory) || subcategory;
  const grupoName = getGrupoName(categoria, subcategory, grupo) || grupo;
  
  const marcaParams = Array.isArray(filters.marca) ? filters.marca : filters.marca ? [filters.marca] : [];
  const tipoParams = Array.isArray(filters.tipo) ? filters.tipo : filters.tipo ? [filters.tipo] : [];
  
  const [products, filterOptions] = await Promise.all([
    getProducts(categoria, subcategory, grupo, {
      marcas: marcaParams as string[],
      tipos: tipoParams as string[],
      precio_min: filters.precio_min as string,
      precio_max: filters.precio_max as string,
      disponibilidad: filters.disponibilidad as string,
      ordenar: filters.ordenar as string,
    }),
    getFilterOptions(categoria, subcategory, grupo),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <Breadcrumbs 
            items={generateBreadcrumbs({ categoria, subcategory, grupo })} 
            baseUrl={process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : 'https://cpsmaterialdeportivo.es'}
          />
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tight">
              {grupoName}
            </h1>
            <p className="text-gray-600">{categoryName} · {subcategoryName}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar con filtros */}
            <div className="lg:col-span-1">
              <AdvancedFilters
                marcas={filterOptions.marcas}
                minPrice={filterOptions.minPrice}
                maxPrice={filterOptions.maxPrice}
                totalProducts={products.length}
                availableTipos={filterOptions.availableTipos}
                categoryId={categoria}
              />
            </div>

            {/* Grid de productos */}
            <div className="lg:col-span-3">
              <ProductsPageClient products={convertProductsToClient(products)} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
