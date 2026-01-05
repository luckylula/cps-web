import 'dotenv/config';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

interface ScrapedProduct {
  name: string;
  slug: string;
  price: number;
  priceWithoutIVA?: number;
  description: string;
  images: string[];
  category: string;
  subcategory?: string;
  variants?: {
    color?: string[];
    size?: string[];
    measures?: string[];
  };
  relatedProducts?: string[];
  stock?: number;
}

// Mapeo de URLs de categorías a slugs de nuestra base de datos
const categoryMapping: Record<string, { slug: string; subcategories: Record<string, string> }> = {
  'material-escolar': {
    slug: 'material-escolar',
    subcategories: {
      'psicomotricidad': 'Psicomotricidad',
      'figuras-espuma-1': 'Figuras espuma',
      'balonesdeusoescolar': 'Balones de uso escolar',
      'juegosaltrenativos': 'Juegos alternativos',
      'juegoseneducacioninfantil': 'Juegos en Educación infantil',
      'materialfoam': 'Material foam',
      'colchonetas': 'Colchonetas',
      'educacionmusical': 'Educación musical',
      'malabares': 'Malabares',
    },
  },
  'deporteindividual': {
    slug: 'deporte-individual',
    subcategories: {},
  },
  'deportescolectivos': {
    slug: 'deportes-colectivos',
    subcategories: {},
  },
  'materialdeportivocomplementario': {
    slug: 'material-complementario',
    subcategories: {},
  },
  'equipaci-n-t-xtil': {
    slug: 'equipacion-textil',
    subcategories: {},
  },
};

// Función para generar slug desde nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Función para extraer precio de un texto
function extractPrice(text: string): number | null {
  // Buscar patrones como "45,90 €", "45.90€", "45,90€", etc.
  const priceMatch = text.match(/(\d+[.,]\d+|\d+)/);
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(',', '.');
    const price = parseFloat(priceStr);
    return isNaN(price) ? null : price;
  }
  return null;
}

// Función para obtener todas las URLs de productos de una categoría
async function getProductUrlsFromCategory(categoryUrl: string): Promise<string[]> {
  const productUrls: string[] = [];
  try {
    const response = await fetch(categoryUrl);
    if (!response.ok) {
      console.warn(`⚠️  No se pudo acceder a ${categoryUrl}`);
      return [];
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Buscar todos los enlaces a productos
    $('a[href*="/product-page/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : `https://www.cpsmaterialdeportivo.com${href}`;
        if (!productUrls.includes(fullUrl)) {
          productUrls.push(fullUrl);
        }
      }
    });
    
    console.log(`✅ Encontrados ${productUrls.length} productos en ${categoryUrl}`);
  } catch (error) {
    console.error(`❌ Error al obtener productos de ${categoryUrl}:`, error);
  }
  return productUrls;
}

// Función para extraer datos de un producto
async function scrapeProduct(productUrl: string, categorySlug: string, subcategory?: string): Promise<ScrapedProduct | null> {
  try {
    const response = await fetch(productUrl);
    if (!response.ok) {
      console.warn(`⚠️  No se pudo acceder a ${productUrl}`);
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extraer nombre
    const name = $('h1[data-hook="product-title"], h1.product-title, h1').first().text().trim() || 
                 $('title').text().split('|')[0].trim();
    
    if (!name) {
      console.warn(`⚠️  No se encontró nombre en ${productUrl}`);
      return null;
    }
    
    // Extraer precio
    let price: number | null = null;
    $('[data-hook="product-price"], .product-price, .price').each((_, element) => {
      const priceText = $(element).text();
      const extractedPrice = extractPrice(priceText);
      if (extractedPrice && !price) {
        price = extractedPrice;
      }
    });
    
    // Si no se encuentra precio, buscar en el texto de la página
    if (!price) {
      const bodyText = $('body').text();
      const priceMatch = bodyText.match(/(\d+[.,]\d+)\s*€/);
      if (priceMatch) {
        price = parseFloat(priceMatch[1].replace(',', '.'));
      }
    }
    
    // Calcular precio sin IVA (asumiendo 21% IVA)
    const priceWithoutIVA = price ? price / 1.21 : undefined;
    
    // Extraer descripción
    const description = $('[data-hook="product-description"], .product-description, .description').text().trim() ||
                       $('meta[name="description"]').attr('content') || '';
    
    // Extraer imágenes
    const images: string[] = [];
    $('img[data-hook="product-image"], .product-image img, img').each((_, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        const fullUrl = src.startsWith('http') ? src : `https://www.cpsmaterialdeportivo.com${src}`;
        if (!images.includes(fullUrl)) {
          images.push(fullUrl);
        }
      }
    });
    
    // Extraer variantes (color, talla, medidas)
    const variants: { color?: string[]; size?: string[]; measures?: string[] } = {};
    
    // Buscar selectores de color
    $('[data-hook*="color"], .color-option, select[name*="color"] option').each((_, element) => {
      const color = $(element).text().trim();
      if (color && color !== 'Seleccionar' && color !== 'Color') {
        if (!variants.color) variants.color = [];
        if (!variants.color.includes(color)) variants.color.push(color);
      }
    });
    
    // Buscar selectores de talla
    $('[data-hook*="size"], .size-option, select[name*="size"] option').each((_, element) => {
      const size = $(element).text().trim();
      if (size && size !== 'Seleccionar' && size !== 'Talla') {
        if (!variants.size) variants.size = [];
        if (!variants.size.includes(size)) variants.size.push(size);
      }
    });
    
    // Buscar productos relacionados
    const relatedProducts: string[] = [];
    $('a[href*="/product-page/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && href !== productUrl) {
        const relatedSlug = href.split('/product-page/')[1];
        if (relatedSlug && !relatedProducts.includes(relatedSlug)) {
          relatedProducts.push(relatedSlug);
        }
      }
    });
    
    const slug = generateSlug(name);
    
    const product: ScrapedProduct = {
      name,
      slug,
      price: price || 0,
      priceWithoutIVA,
      description: description || `Producto ${name}`,
      images: images.length > 0 ? images : [],
      category: categorySlug,
      subcategory,
      ...(Object.keys(variants).length > 0 && { variants }),
      ...(relatedProducts.length > 0 && { relatedProducts }),
    };
    
    // Si hay variantes, agregarlas a la descripción como JSON
    if (Object.keys(variants).length > 0) {
      product.description += `\n\n<!-- VARIANTES: ${JSON.stringify(variants)} -->`;
    }
    
    console.log(`✅ Extraído: ${name} (${price ? `${price}€` : 'sin precio'})`);
    return product;
  } catch (error) {
    console.error(`❌ Error al extraer producto de ${productUrl}:`, error);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando scraping de productos...\n');
  
  const allProducts: ScrapedProduct[] = [];
  const baseUrl = 'https://www.cpsmaterialdeportivo.com';
  
  // URLs de categorías principales
  const categoryUrls = [
    `${baseUrl}/material-escolar`,
    `${baseUrl}/deporteindividual`,
    `${baseUrl}/deportescolectivos`,
    `${baseUrl}/materialdeportivocomplementario`,
    `${baseUrl}/equipaci-n-t-xtil`,
  ];
  
  // Obtener todas las URLs de productos
  const allProductUrls: string[] = [];
  for (const categoryUrl of categoryUrls) {
    const categorySlug = categoryUrl.split('/').pop() || '';
    const productUrls = await getProductUrlsFromCategory(categoryUrl);
    allProductUrls.push(...productUrls);
    
    // Pequeña pausa para no sobrecargar el servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Eliminar duplicados
  const uniqueProductUrls = [...new Set(allProductUrls)];
  console.log(`\n📦 Total de productos únicos encontrados: ${uniqueProductUrls.length}\n`);
  
  // Extraer datos de cada producto
  for (let i = 0; i < uniqueProductUrls.length; i++) {
    const productUrl = uniqueProductUrls[i];
    const urlParts = productUrl.split('/');
    const categoryPath = urlParts[urlParts.length - 2] || '';
    
    // Determinar categoría y subcategoría
    let categorySlug = 'material-escolar'; // default
    let subcategory: string | undefined;
    
    for (const [urlPath, mapping] of Object.entries(categoryMapping)) {
      if (categoryPath.includes(urlPath) || productUrl.includes(urlPath)) {
        categorySlug = mapping.slug;
        // Intentar determinar subcategoría desde la URL
        for (const [subUrl, subName] of Object.entries(mapping.subcategories)) {
          if (productUrl.includes(subUrl)) {
            subcategory = subName;
            break;
          }
        }
        break;
      }
    }
    
    const product = await scrapeProduct(productUrl, categorySlug, subcategory);
    if (product) {
      allProducts.push(product);
    }
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mostrar progreso
    if ((i + 1) % 10 === 0) {
      console.log(`📊 Progreso: ${i + 1}/${uniqueProductUrls.length} productos procesados`);
    }
  }
  
  // Guardar resultados en JSON
  const outputFile = 'scraped-products.json';
  writeFileSync(outputFile, JSON.stringify(allProducts, null, 2), 'utf-8');
  
  console.log(`\n✅ Scraping completado!`);
  console.log(`📝 Total de productos extraídos: ${allProducts.length}`);
  console.log(`💾 Datos guardados en: ${outputFile}`);
  console.log(`\n📊 Resumen:`);
  console.log(`   - Productos con precio: ${allProducts.filter(p => p.price > 0).length}`);
  console.log(`   - Productos con imágenes: ${allProducts.filter(p => p.images.length > 0).length}`);
  console.log(`   - Productos con descripción: ${allProducts.filter(p => p.description.length > 10).length}`);
}

main().catch(console.error);
