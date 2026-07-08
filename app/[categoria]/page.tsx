import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Navigation from '@/app/components/Navigation';
import ProductCard from '@/app/components/ProductCard';
import AdvancedFilters from '@/app/components/AdvancedFilters';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import SubcategoryCard from '@/app/components/SubcategoryCard';
import { getCategoryName, getSubcategoryName } from '@/app/lib/navigationMapping';
import { generateCategoryMetadata, generateBreadcrumbs } from '@/app/lib/seoUtils';
import { convertProductsToClient, attachVariantInfoToProducts } from '@/app/lib/productUtils';
import ProductsPageClient from '@/app/components/ProductsPageClient';
import { navigationStructure } from '@/app/lib/navigationStructure';
import { getCategoryTree } from '@/app/lib/categoryTree';
import {
  generateStaticNavCategoryParams,
  getNavCategoryDisplay,
  isNavCategoryLanding,
  NAV_CATEGORY_SLUGS,
} from '@/app/lib/staticCategory';
import Footer from '@/components/Footer';

export const revalidate = 3600;

export async function generateStaticParams() {
  return generateStaticNavCategoryParams();
}

interface PageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const NAV_SLUGS = NAV_CATEGORY_SLUGS;

async function getCategory(slug: string) {
  let category = await prisma.category.findUnique({
    where: { slug },
  });
  // Asegurar que categorías del nav (textil, deportes, instalaciones, material-escolar) existan en BD
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

async function getProducts(categoriaSlug: string, filters: {
  marcas?: string[];
  tipos?: string[];
  precio_min?: string;
  precio_max?: string;
  disponibilidad?: string;
  ordenar?: string;
}) {
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

async function getFilterOptions(categoriaSlug: string) {
  const products = await prisma.product.findMany({
    where: {
      categoryId: categoriaSlug,
      published: true,
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
  
  // Obtener tipos de producto disponibles (solo para deportes)
  let availableTipos: { tipo_producto: string; _count: { tipo_producto: number } }[] = [];
  if (categoriaSlug === 'deportes') {
    const tiposData = await prisma.product.groupBy({
      by: ['tipo_producto'],
      where: {
        categoryId: categoriaSlug,
        visible_web: true,
        activo: true,
        tipo_producto: { not: null },
      },
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
  const { categoria } = await params;

  if (isNavCategoryLanding(categoria)) {
    const navCategory = getNavCategoryDisplay(categoria);
    return generateCategoryMetadata({
      categoria,
      categoryDescription: navCategory?.description,
    });
  }

  const category = await getCategory(categoria);
  const productCount = await prisma.product.count({
    where: {
      categoryId: categoria,
      published: true,
      visible_web: true,
      activo: true,
    },
  });

  return generateCategoryMetadata({
    categoria,
    categoryDescription: category?.description || undefined,
    productCount,
  });
}

/**
 * Subcategorías para la UI: fuente de verdad desde Product (getCategoryTree).
 * Orden según navigationStructure para mantener el orden deseado de las tarjetas.
 * Si el árbol no tiene subcategorías para esta categoría, fallback a nav estático + count.
 * Material Escolar: usar siempre las 9 subcategorías del nav.
 */
async function getSubcategoriesForCategory(categoriaSlug: string): Promise<{ nombre: string; slug: string }[]> {
  const navCategoria = navigationStructure.find((c) => c.slug === categoriaSlug);

  // Material Escolar: siempre las 9 subcategorías definidas en nav
  if (categoriaSlug === 'material-escolar' && navCategoria?.subcategorias?.length) {
    return navCategoria.subcategorias.map((s) => ({ nombre: s.nombre, slug: s.slug }));
  }

  // Textil: solo Ropa Casual, Calzado, Ropa Deportiva (no Accesorios/Complementos)
  if (categoriaSlug === 'textil' && navCategoria?.subcategorias?.length) {
    return navCategoria.subcategorias.map((s) => ({ nombre: s.nombre, slug: s.slug }));
  }

  // Deportes: solo Colectivos, Individual, Raqueta (Fitness está dentro de Individual)
  if (categoriaSlug === 'deportes' && navCategoria?.subcategorias?.length) {
    return navCategoria.subcategorias.map((s) => ({ nombre: s.nombre, slug: s.slug }));
  }

  // Instalaciones: solo las 6 subcategorías del nav (no las etiquetas crudas del catálogo Jim Sports)
  if (categoriaSlug === 'instalaciones' && navCategoria?.subcategorias?.length) {
    return navCategoria.subcategorias.map((s) => ({ nombre: s.nombre, slug: s.slug }));
  }

  const tree = await getCategoryTree(categoriaSlug);
  const categoryNode = tree.find((n) => n.categoryId === categoriaSlug);
  if (categoryNode && categoryNode.subcategories.length > 0) {
    const fromTree = categoryNode.subcategories.map((s) => ({ nombre: s.name, slug: s.slug }));
    // Ordenar según el orden definido en navigationStructure
    if (navCategoria?.subcategorias?.length) {
      const order = navCategoria.subcategorias.map((s) => s.slug);
      return fromTree.sort((a, b) => {
        const ia = order.indexOf(a.slug);
        const ib = order.indexOf(b.slug);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    return fromTree;
  }
  // Fallback: nav estático + count (compatibilidad con categorías que no tengan productos aún)
  const categoria = navigationStructure.find((c) => c.slug === categoriaSlug);
  if (!categoria?.subcategorias?.length) return [];
  const subcategoriesWithProducts = await Promise.all(
    categoria.subcategorias.map(async (subcategoria) => {
      const subcategoryName = getSubcategoryName(categoriaSlug, subcategoria.slug) || subcategoria.nombre;
      const count = await prisma.product.count({
        where: {
          categoryId: categoriaSlug,
          subcategory: subcategoryName,
          published: true,
          visible_web: true,
          activo: true,
        },
      });
      return { ...subcategoria, hasProducts: count > 0 };
    })
  );
  return subcategoriesWithProducts.filter((s) => s.hasProducts).map((s) => ({ nombre: s.nombre, slug: s.slug }));
}

function getSiteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://cpmaterialdeportivo.com')
  );
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { categoria } = await params;
  const filters = await searchParams;

  const navCategory = isNavCategoryLanding(categoria) ? getNavCategoryDisplay(categoria) : null;
  const subcategories = navCategory
    ? navCategory.subcategories.map((s) => ({ nombre: s.nombre, slug: s.slug }))
    : await getSubcategoriesForCategory(categoria);

  if (navCategory && subcategories.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <Breadcrumbs 
              items={generateBreadcrumbs({ categoria })} 
              baseUrl={getSiteBaseUrl()}
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-16 pb-12 px-8 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              {navCategory.name}
            </h1>
            {navCategory.description && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                {navCategory.description}
              </p>
            )}
          </div>
        </section>

        {/* Subcategories Grid */}
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.slug}
                  subcategory={subcategory}
                  categoriaSlug={categoria}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  const category = await getCategory(categoria);
  if (!category) {
    notFound();
  }

  const categoryName = getCategoryName(categoria) || category.name;

  if (subcategories.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <Breadcrumbs
              items={generateBreadcrumbs({ categoria })}
              baseUrl={getSiteBaseUrl()}
            />
          </div>
        </div>

        <section className="pt-16 pb-12 px-8 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              {categoryName}
            </h1>
            {category.description && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </section>

        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.slug}
                  subcategory={subcategory}
                  categoriaSlug={categoria}
                />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Si no hay subcategorías, mostrar productos directamente (comportamiento anterior)
  const marcaParams = Array.isArray(filters.marca) ? filters.marca : filters.marca ? [filters.marca] : [];
  const tipoParams = Array.isArray(filters.tipo) ? filters.tipo : filters.tipo ? [filters.tipo] : [];
  
  const [products, filterOptions] = await Promise.all([
    getProducts(categoria, {
      marcas: marcaParams as string[],
      tipos: tipoParams as string[],
      precio_min: filters.precio_min as string,
      precio_max: filters.precio_max as string,
      disponibilidad: filters.disponibilidad as string,
      ordenar: filters.ordenar as string,
    }),
    getFilterOptions(categoria),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <Breadcrumbs 
            items={generateBreadcrumbs({ categoria })} 
            baseUrl={getSiteBaseUrl()}
          />
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
