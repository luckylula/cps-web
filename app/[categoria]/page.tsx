import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import ProductCard from '@/app/components/ProductCard';
import ProductFilters from '@/app/components/ProductFilters';
import { getCategoryName } from '@/app/lib/navigationMapping';
import ProductsPageClient from '@/app/components/ProductsPageClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  return category;
}

async function getProducts(categoriaSlug: string, filters: {
  marca?: string;
  minPrice?: string;
  maxPrice?: string;
  stock?: string;
}) {
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

  if (filters.marca) {
    where.marca = {
      contains: filters.marca,
      mode: 'insensitive',
    };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) {
      where.price.gte = parseFloat(filters.minPrice);
    }
    if (filters.maxPrice) {
      where.price.lte = parseFloat(filters.maxPrice);
    }
    where.price.not = null;
  }

  if (filters.stock === 'true') {
    where.stock = { gt: 0 };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: {
      name: 'asc',
    },
  });

  return products;
}

async function getFilterOptions(categoriaSlug: string) {
  const products = await prisma.product.findMany({
    where: {
      categoryId: categoriaSlug,
      visible_web: true,
      activo: true,
      marca: { not: null },
    },
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
  const { categoria } = await params;
  const category = await getCategory(categoria);
  const categoryName = getCategoryName(categoria) || category?.name || categoria;

  return {
    title: `${categoryName} | CPS Material Deportivo`,
    description: category?.description || `Explora nuestra selección de productos de ${categoryName}`,
  };
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { categoria } = await params;
  const filters = await searchParams;
  
  const category = await getCategory(categoria);
  if (!category) {
    notFound();
  }

  const categoryName = getCategoryName(categoria) || category.name;
  
  const [products, filterOptions] = await Promise.all([
    getProducts(categoria, {
      marca: filters.marca as string,
      minPrice: filters.minPrice as string,
      maxPrice: filters.maxPrice as string,
      stock: filters.stock as string,
    }),
    getFilterOptions(categoria),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm md:text-base text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tight">
              {categoryName}
            </h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar con filtros */}
            <aside className="lg:col-span-1">
              <ProductFilters
                marcas={filterOptions.marcas}
                minPrice={filterOptions.minPrice}
                maxPrice={filterOptions.maxPrice}
                totalProducts={products.length}
              />
            </aside>

            {/* Grid de productos */}
            <div className="lg:col-span-3">
              <ProductsPageClient products={products} />
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
