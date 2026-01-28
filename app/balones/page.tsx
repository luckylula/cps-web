import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import ProductCard from '@/app/components/ProductCard';
import BalonesFilters from '@/app/components/BalonesFilters';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  images: string[];
  featured: boolean;
  marca?: string | null;
  sku_interno?: string | null;
  stock: number;
  categoryId: string;
  grupo?: string | null;
}

async function getBalones(filters: {
  grupo?: string;
  marca?: string;
  minPrice?: string;
  maxPrice?: string;
  stock?: string;
}) {
  const where: any = {
    tipo_producto: 'Balones',
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

  if (filters.grupo) {
    where.grupo = filters.grupo;
  }

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
    orderBy: [
      { grupo: 'asc' },
      { name: 'asc' },
    ],
  });

  return products;
}

async function getFilterOptions() {
  const products = await prisma.product.findMany({
    where: {
      tipo_producto: 'Balones',
      visible_web: true,
      activo: true,
    },
    select: {
      grupo: true,
      marca: true,
      price: true,
    },
  });

  const grupos = Array.from(
    new Set(products.map(p => p.grupo).filter(Boolean))
  ).sort() as string[];

  const marcas = Array.from(
    new Set(products.map(p => p.marca).filter(Boolean))
  ).sort() as string[];

  const prices = products
    .map(p => p.price ? Number(p.price) : null)
    .filter((p): p is number => p !== null && !isNaN(p));

  return {
    grupos,
    marcas,
    minPrice: prices.length > 0 ? Math.floor(Math.min(...prices)) : null,
    maxPrice: prices.length > 0 ? Math.ceil(Math.max(...prices)) : null,
  };
}

function groupProductsByDeporte(products: Product[]) {
  const grouped: Record<string, Product[]> = {};

  products.forEach((product) => {
    const grupo = product.grupo || 'Otros';
    if (!grouped[grupo]) {
      grouped[grupo] = [];
    }
    grouped[grupo].push(product);
  });

  // Ordenar grupos alfabéticamente
  return Object.keys(grouped)
    .sort()
    .reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {} as Record<string, Product[]>);
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Balones Deportivos - Todos los deportes | CPS Material Deportivo',
    description: 'Explora nuestra completa selección de balones deportivos para todos los deportes: fútbol, baloncesto, voleibol, balonmano y más. Calidad profesional y precios competitivos.',
  };
}

export default async function BalonesPage({ searchParams }: PageProps) {
  const filters = await searchParams;

  const [products, filterOptions] = await Promise.all([
    getBalones({
      grupo: filters.grupo as string,
      marca: filters.marca as string,
      minPrice: filters.minPrice as string,
      maxPrice: filters.maxPrice as string,
      stock: filters.stock as string,
    }),
    getFilterOptions(),
  ]);

  const groupedProducts = groupProductsByDeporte(products);
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003366] to-[#004488] text-white py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 tracking-tight">
            Todos los Balones Deportivos
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light">
            Descubre nuestra completa selección de balones para todos los deportes. 
            Calidad profesional, durabilidad y rendimiento excepcional.
          </p>
          <p className="text-sm md:text-base text-gray-300 mt-4">
            {totalProducts} balones disponibles
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm md:text-base text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Balones</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar con filtros */}
            <aside className="lg:col-span-1">
              <BalonesFilters
                grupos={filterOptions.grupos}
                marcas={filterOptions.marcas}
                minPrice={filterOptions.minPrice}
                maxPrice={filterOptions.maxPrice}
                totalProducts={totalProducts}
              />
            </aside>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              {Object.keys(groupedProducts).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No se encontraron balones</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Intenta ajustar los filtros para ver más resultados
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {Object.entries(groupedProducts).map(([deporte, productos]) => (
                    <div key={deporte} className="border-b border-gray-200 pb-8 last:border-b-0">
                      <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
                          Balones de {deporte}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {productos.length} {productos.length === 1 ? 'balón' : 'balones'} disponible{productos.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productos.map((product) => (
                          <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            slug={product.slug}
                            price={product.price}
                            images={product.images}
                            featured={product.featured}
                            marca={product.marca}
                            sku_interno={product.sku_interno}
                            stock={product.stock}
                            categoryId={product.categoryId}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
