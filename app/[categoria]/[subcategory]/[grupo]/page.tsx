import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import ProductCard from '@/app/components/ProductCard';
import AdvancedFilters from '@/app/components/AdvancedFilters';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import ProductsPageClient from '@/app/components/ProductsPageClient';
import { getGrupoName, getSubcategoryName, getCategoryName } from '@/app/lib/navigationMapping';
import { generateCategoryMetadata, generateBreadcrumbs } from '@/app/lib/seoUtils';
import { convertProductsToClient } from '@/app/lib/productUtils';

export const dynamic = 'force-dynamic';

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
    precio_min?: string;
    precio_max?: string;
    disponibilidad?: string;
    ordenar?: string;
  }
) {
  const grupoName = getGrupoName(categoriaSlug, subcategorySlug, grupoSlug);
  const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug);
  
  const where: any = {
    categoryId: categoriaSlug,
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

  if (subcategoryName) {
    where.subcategory = subcategoryName;
  }

  if (grupoName) {
    where.grupo = grupoName;
  }

  // Filtro por múltiples marcas
  if (filters.marcas && filters.marcas.length > 0) {
    where.marca = {
      in: filters.marcas,
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

  return products;
}

async function getFilterOptions(
  categoriaSlug: string,
  subcategorySlug: string,
  grupoSlug: string
) {
  const grupoName = getGrupoName(categoriaSlug, subcategorySlug, grupoSlug);
  const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug);
  
  const where: any = {
    categoryId: categoriaSlug,
    visible_web: true,
    activo: true,
    marca: { not: null },
  };

  if (subcategoryName) {
    where.subcategory = subcategoryName;
  }

  if (grupoName) {
    where.grupo = grupoName;
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
  
  return {
    marcas: marcas.sort(),
    minPrice: prices.length > 0 ? Math.floor(Math.min(...prices)) : null,
    maxPrice: prices.length > 0 ? Math.ceil(Math.max(...prices)) : null,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, subcategory, grupo } = await params;
  const category = await getCategory(categoria);
  const grupoName = getGrupoName(categoria, subcategory, grupo);
  const subcategoryName = getSubcategoryName(categoria, subcategory);
  
  // Obtener conteo de productos
  const productCount = await prisma.product.count({
    where: {
      categoryId: categoria,
      subcategory: subcategoryName || undefined,
      grupo: grupoName || undefined,
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
  const subcategoryName = getSubcategoryName(categoria, subcategory) || subcategory;
  const grupoName = getGrupoName(categoria, subcategory, grupo) || grupo;
  
  const marcaParams = Array.isArray(filters.marca) ? filters.marca : filters.marca ? [filters.marca] : [];
  
  const [products, filterOptions] = await Promise.all([
    getProducts(categoria, subcategory, grupo, {
      marcas: marcaParams as string[],
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
      <footer className="py-8 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
