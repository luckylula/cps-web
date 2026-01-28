import { Metadata } from 'next';
import { getCategoryName, getSubcategoryName, getGrupoName } from './navigationMapping';

interface SEOConfig {
  categoria?: string;
  subcategory?: string;
  grupo?: string;
  tipoProducto?: string;
  categoryDescription?: string;
  productCount?: number;
}

/**
 * Genera metadata SEO completa para páginas de categorías
 */
export function generateCategoryMetadata(config: SEOConfig): Metadata {
  const { categoria, subcategory, grupo, tipoProducto, categoryDescription, productCount } = config;

  // Construir título según jerarquía
  let title = '';
  let description = '';
  let canonical = '';

  if (tipoProducto && grupo && subcategory && categoria) {
    // Ejemplo: /deportes/colectivos/futbol/balones
    const grupoName = getGrupoName(categoria, subcategory, grupo) || grupo;
    const subcategoryName = getSubcategoryName(categoria, subcategory) || subcategory;
    title = `${tipoProducto} de ${grupoName} - ${subcategoryName} | CPS Material Deportivo`;
    description = `Compra ${tipoProducto.toLowerCase()} de ${grupoName.toLowerCase()} profesionales. Amplio catálogo con las mejores marcas${productCount ? ` (${productCount} productos disponibles)` : ''}.`;
    canonical = `/${categoria}/${subcategory}/${grupo}/${tipoProducto.toLowerCase()}`;
  } else if (grupo && subcategory && categoria) {
    // Ejemplo: /deportes/colectivos/futbol
    const grupoName = getGrupoName(categoria, subcategory, grupo) || grupo;
    const subcategoryName = getSubcategoryName(categoria, subcategory) || subcategory;
    const categoryName = getCategoryName(categoria) || categoria;
    // Formato: "Fútbol - Colectivos | CPS Material Deportivo"
    title = `${grupoName} - ${subcategoryName} | CPS Material Deportivo`;
    description = `Compra productos de ${grupoName.toLowerCase()} profesionales. Amplio catálogo de ${subcategoryName.toLowerCase()} en ${categoryName.toLowerCase()}${productCount ? ` (${productCount} productos disponibles)` : ''}.`;
    canonical = `/${categoria}/${subcategory}/${grupo}`;
  } else if (subcategory && categoria) {
    // Ejemplo: /deportes/colectivos
    const subcategoryName = getSubcategoryName(categoria, subcategory) || subcategory;
    const categoryName = getCategoryName(categoria) || categoria;
    title = `${subcategoryName} - ${categoryName} | CPS Material Deportivo`;
    description = categoryDescription || `Explora nuestra selección de productos de ${subcategoryName.toLowerCase()} en ${categoryName.toLowerCase()}${productCount ? ` (${productCount} productos disponibles)` : ''}.`;
    canonical = `/${categoria}/${subcategory}`;
  } else if (categoria) {
    // Ejemplo: /deportes
    const categoryName = getCategoryName(categoria) || categoria;
    title = `${categoryName} | CPS Material Deportivo`;
    description = categoryDescription || `Explora nuestra selección completa de productos de ${categoryName.toLowerCase()}${productCount ? ` (${productCount} productos disponibles)` : ''}.`;
    canonical = `/${categoria}`;
  } else {
    title = 'CPS Material Deportivo';
    description = 'Material deportivo profesional para centros educativos, clubes y colectivos.';
    canonical = '/';
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://cpsmaterialdeportivo.es';
  const fullUrl = `${baseUrl}${canonical}`;

  return {
    title,
    description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'CPS Material Deportivo',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Genera items de breadcrumbs según la jerarquía
 */
export function generateBreadcrumbs(config: SEOConfig): Array<{ label: string; href: string }> {
  const { categoria, subcategory, grupo, tipoProducto } = config;
  const items: Array<{ label: string; href: string }> = [
    { label: 'Inicio', href: '/' },
  ];

  if (categoria) {
    const categoryName = getCategoryName(categoria) || categoria;
    items.push({ label: categoryName, href: `/${categoria}` });
  }

  if (subcategory && categoria) {
    const subcategoryName = getSubcategoryName(categoria, subcategory) || subcategory;
    items.push({ label: subcategoryName, href: `/${categoria}/${subcategory}` });
  }

  if (grupo && subcategory && categoria) {
    const grupoName = getGrupoName(categoria, subcategory, grupo) || grupo;
    items.push({ label: grupoName, href: `/${categoria}/${subcategory}/${grupo}` });
  }

  if (tipoProducto && grupo && subcategory && categoria) {
    items.push({ label: tipoProducto, href: `/${categoria}/${subcategory}/${grupo}/${tipoProducto.toLowerCase()}` });
  }

  return items;
}
