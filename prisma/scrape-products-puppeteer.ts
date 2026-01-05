import 'dotenv/config';
import puppeteer from 'puppeteer';
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
async function getProductUrlsFromCategory(page: puppeteer.Page, categoryUrl: string): Promise<string[]> {
  const productUrls: string[] = [];
  try {
    console.log(`📂 Navegando a ${categoryUrl}...`);
    await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Esperar a que se carguen los productos
    await new Promise(r => setTimeout(r, 2000));
    
    // Buscar todos los enlaces a productos
    const links = await page.evaluate(() => {
      const productLinks: string[] = [];
      document.querySelectorAll('a[href*="/product-page/"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : `https://www.cpsmaterialdeportivo.com${href}`;
          if (!productLinks.includes(fullUrl)) {
            productLinks.push(fullUrl);
          }
        }
      });
      return productLinks;
    });
    
    productUrls.push(...links);
    console.log(`✅ Encontrados ${productUrls.length} productos en ${categoryUrl}`);
  } catch (error) {
    console.error(`❌ Error al obtener productos de ${categoryUrl}:`, error);
  }
  return productUrls;
}

// Función para extraer datos de un producto
async function scrapeProduct(page: puppeteer.Page, productUrl: string, categorySlug: string, subcategory?: string): Promise<ScrapedProduct | null> {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    
    // Extraer datos usando evaluación de página
    const productData = await page.evaluate(() => {
      // Extraer nombre
      const nameElement = document.querySelector('h1[data-hook="product-title"], h1.product-title, h1') as HTMLElement;
      const name = nameElement?.textContent?.trim() || 
                   document.title.split('|')[0].trim() || '';
      
      // Extraer precio
      let price: number | null = null;
      const priceElements = document.querySelectorAll('[data-hook="product-price"], .product-price, .price, [class*="price"]');
      for (const element of Array.from(priceElements)) {
        const priceText = element.textContent || '';
        const priceMatch = priceText.match(/(\d+[.,]\d+|\d+)/);
        if (priceMatch) {
          const priceStr = priceMatch[1].replace(',', '.');
          const parsedPrice = parseFloat(priceStr);
          if (!isNaN(parsedPrice) && parsedPrice > 0) {
            price = parsedPrice;
            break;
          }
        }
      }
      
      // Si no se encuentra precio, buscar en el texto de la página
      if (!price) {
        const bodyText = document.body.textContent || '';
        const priceMatch = bodyText.match(/(\d+[.,]\d+)\s*€/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1].replace(',', '.'));
        }
      }
      
      // Extraer descripción COMPLETA - incluyendo detalles técnicos
      let description = '';
      
      // 1. Buscar descripción principal
      const descSelectors = [
        '[data-hook="product-description"]',
        '.product-description',
        '.description',
        '[class*="product-description"]',
        '[class*="Description"]',
        '#product-description',
        '.product-details',
        '[data-hook*="description"]',
      ];
      
      for (const selector of descSelectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          description = element.textContent?.trim() || element.innerText?.trim() || '';
          if (description) break;
        }
      }
      
      // 2. Buscar detalles técnicos adicionales
      const technicalDetails: string[] = [];
      
      // Buscar secciones de especificaciones técnicas
      const techSelectors = [
        '[data-hook*="specification"]',
        '[data-hook*="Specification"]',
        '.specifications',
        '.technical-details',
        '[class*="specification"]',
        '[class*="technical"]',
        'table.specifications',
        '.product-specs',
      ];
      
      techSelectors.forEach((selector) => {
        try {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            const text = element.textContent?.trim() || element.innerText?.trim() || '';
            if (text && text.length > 10) {
              technicalDetails.push(text);
            }
          }
        } catch (e) {
          // Ignorar errores
        }
      });
      
      // 3. Buscar información de material, dimensiones, etc. en el texto completo
      const bodyText = document.body.textContent || '';
      const materialMatch = bodyText.match(/(?:Material|Fabricado|Composición)[:\s]+([^\n]+)/i);
      const dimensionMatch = bodyText.match(/(?:Dimensiones?|Medidas?|Tamaño)[:\s]+([^\n]+)/i);
      const weightMatch = bodyText.match(/(?:Peso|Weight)[:\s]+([^\n]+)/i);
      
      if (materialMatch && !description.includes(materialMatch[1])) {
        technicalDetails.push(`Material: ${materialMatch[1].trim()}`);
      }
      if (dimensionMatch && !description.includes(dimensionMatch[1])) {
        technicalDetails.push(`Dimensiones: ${dimensionMatch[1].trim()}`);
      }
      if (weightMatch && !description.includes(weightMatch[1])) {
        technicalDetails.push(`Peso: ${weightMatch[1].trim()}`);
      }
      
      // 4. Combinar descripción con detalles técnicos
      if (technicalDetails.length > 0) {
        description += '\n\n' + 'DETALLES TÉCNICOS:\n' + technicalDetails.join('\n');
      }
      
      // 5. Si no hay descripción, buscar meta description
      if (!description || description.length < 20) {
        const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        description = metaDesc?.content || description || '';
      }
      
      // 6. Limpiar descripción (eliminar espacios múltiples, etc.)
      description = description.replace(/\s+/g, ' ').trim();
      
      // Extraer imágenes - GALERÍA COMPLETA
      const images: string[] = [];
      
      // 1. Buscar imagen principal
      const mainImageSelectors = [
        'img[data-hook="product-image"]',
        '.product-image img',
        '.product-gallery img:first-child',
        '[data-hook*="product-image"] img',
        '.main-product-image img',
        'img[class*="product-main"]',
      ];
      
      for (const selector of mainImageSelectors) {
        const img = document.querySelector(selector) as HTMLImageElement;
        if (img) {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-image-info');
          if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
            let imageUrl = src;
            // Obtener URL de alta calidad para Wix
            if (src.includes('wixstatic.com')) {
              const imageId = src.match(/([^\/]+~mv2\.(jpg|png|webp))/i)?.[1];
              if (imageId) {
                imageUrl = `https://static.wixstatic.com/media/${imageId}/v1/fill/w_1200,h_1200,al_c,q_85,usm_0.66_1.00_0.01/${imageId}`;
              }
            }
            if (!images.includes(imageUrl)) {
              images.push(imageUrl);
            }
            break; // Solo la primera imagen principal
          }
        }
      }
      
      // 2. Buscar galería completa de imágenes
      const gallerySelectors = [
        '.product-gallery img',
        '[data-hook*="product-gallery"] img',
        '[data-hook*="ImageUiTpaWrapperDataHook"] img',
        '.product-images img',
        '[class*="product-gallery"] img',
        '[class*="ProductGallery"] img',
        'img[src*="wixstatic"]',
        'img[src*="product"]',
        'img[data-image-info]',
      ];
      
      for (const selector of gallerySelectors) {
        const imgElements = document.querySelectorAll(selector);
        for (const img of Array.from(imgElements)) {
          const imgEl = img as HTMLImageElement;
          const src = imgEl.src || 
                     imgEl.getAttribute('data-src') || 
                     imgEl.getAttribute('data-image-info') ||
                     JSON.parse(imgEl.getAttribute('data-image-info') || '{}')?.imageData?.uri;
          
          if (src && 
              !src.includes('logo') && 
              !src.includes('icon') && 
              !src.includes('avatar') &&
              !src.includes('placeholder')) {
            
            let imageUrl = src;
            
            // Procesar URLs de Wix para obtener alta calidad
            if (src.includes('wixstatic.com')) {
              // Extraer ID de imagen
              const imageIdMatch = src.match(/([^\/]+~mv2\.(jpg|png|webp|jpeg))/i);
              if (imageIdMatch) {
                const imageId = imageIdMatch[1];
                imageUrl = `https://static.wixstatic.com/media/${imageId}/v1/fill/w_1200,h_1200,al_c,q_85,usm_0.66_1.00_0.01/${imageId}`;
              } else {
                // Si ya tiene parámetros, intentar mejorarlos
                imageUrl = src.replace(/\/v1\/fill\/[^\/]+/, '/v1/fill/w_1200,h_1200,al_c,q_85,usm_0.66_1.00_0.01');
              }
            }
            
            // Asegurar URL completa
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = 'https://www.cpsmaterialdeportivo.com' + imageUrl;
            }
            
            if (imageUrl && !images.includes(imageUrl)) {
              images.push(imageUrl);
            }
          }
        }
      }
      
      // 3. Si no hay imágenes, buscar en atributos data
      if (images.length === 0) {
        const dataImageElements = document.querySelectorAll('[data-image-info]');
        dataImageElements.forEach((element) => {
          try {
            const dataInfo = element.getAttribute('data-image-info');
            if (dataInfo) {
              const imageData = JSON.parse(dataInfo);
              if (imageData?.imageData?.uri) {
                const imageId = imageData.imageData.uri;
                const imageUrl = `https://static.wixstatic.com/media/${imageId}/v1/fill/w_1200,h_1200,al_c,q_85,usm_0.66_1.00_0.01/${imageId}`;
                if (!images.includes(imageUrl)) {
                  images.push(imageUrl);
                }
              }
            }
          } catch (e) {
            // Ignorar errores de parsing
          }
        });
      }
      
      // Extraer variantes - BÚSQUEDA EXHAUSTIVA
      const variants: { color?: string[]; size?: string[]; measures?: string[] } = {};
      
      // Buscar selectores de COLOR - múltiples estrategias
      const colors: string[] = [];
      
      // 1. Selectores específicos de Wix
      const colorSelectors = [
        '[data-hook*="color"]',
        '[data-hook*="Color"]',
        '.color-option',
        'select[name*="color"] option',
        'select[name*="Color"] option',
        'button[data-hook*="color"]',
        'button[data-hook*="Color"]',
        '[aria-label*="color"]',
        '[aria-label*="Color"]',
        '.product-option-color',
        '[class*="color-option"]',
        '[class*="ColorOption"]',
      ];
      
      colorSelectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((element) => {
            const text = element.textContent?.trim() || element.getAttribute('aria-label') || '';
            const value = element.getAttribute('value') || text;
            if (value && 
                value !== 'Seleccionar' && 
                value !== 'Color' && 
                value.length < 50 && // Evitar textos muy largos
                !colors.includes(value) &&
                !value.match(/^\d+$/) // Evitar solo números
            ) {
              colors.push(value);
            }
          });
        } catch (e) {
          // Ignorar errores de selector
        }
      });
      
      if (colors.length > 0) variants.color = colors;
      
      // Buscar selectores de TALLA - múltiples estrategias
      const sizes: string[] = [];
      
      const sizeSelectors = [
        '[data-hook*="size"]',
        '[data-hook*="Size"]',
        '[data-hook*="talla"]',
        '[data-hook*="Talla"]',
        '.size-option',
        'select[name*="size"] option',
        'select[name*="Size"] option',
        'select[name*="talla"] option',
        'select[name*="Talla"] option',
        'button[data-hook*="size"]',
        'button[data-hook*="Size"]',
        '[aria-label*="size"]',
        '[aria-label*="Size"]',
        '[aria-label*="talla"]',
        '[aria-label*="Talla"]',
        '.product-option-size',
        '[class*="size-option"]',
        '[class*="SizeOption"]',
      ];
      
      sizeSelectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((element) => {
            const text = element.textContent?.trim() || element.getAttribute('aria-label') || '';
            const value = element.getAttribute('value') || text;
            if (value && 
                value !== 'Seleccionar' && 
                value !== 'Talla' && 
                value !== 'Size' &&
                value.length < 50 &&
                !sizes.includes(value) &&
                !value.match(/^\d+$/)
            ) {
              sizes.push(value);
            }
          });
        } catch (e) {
          // Ignorar errores de selector
        }
      });
      
      if (sizes.length > 0) variants.size = sizes;
      
      // Buscar MEDIDAS - en texto de la descripción o selectores específicos
      const measures: string[] = [];
      
      const measureSelectors = [
        '[data-hook*="measure"]',
        '[data-hook*="Measure"]',
        '[data-hook*="medida"]',
        '[data-hook*="Medida"]',
        'select[name*="measure"] option',
        'select[name*="medida"] option',
        '.measure-option',
        '[class*="measure-option"]',
      ];
      
      measureSelectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((element) => {
            const text = element.textContent?.trim() || element.getAttribute('aria-label') || '';
            const value = element.getAttribute('value') || text;
            if (value && 
                value !== 'Seleccionar' && 
                value !== 'Medida' &&
                value.length < 100 &&
                !measures.includes(value)
            ) {
              measures.push(value);
            }
          });
        } catch (e) {
          // Ignorar errores de selector
        }
      });
      
      // También buscar medidas en la descripción (patrones como "50x30x20 cm", "100x50", etc.)
      const measurePatterns = [
        /\d+\s*x\s*\d+\s*(?:x\s*\d+)?\s*(?:cm|mm|m)/gi,
        /\d+\s*cm\s*x\s*\d+\s*cm/gi,
        /Dimensiones?[:\s]+(\d+[^\d]*\d+)/gi,
      ];
      
      measurePatterns.forEach((pattern) => {
        const matches = description.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            if (!measures.includes(match.trim())) {
              measures.push(match.trim());
            }
          });
        }
      });
      
      if (measures.length > 0) variants.measures = measures;
      
      // Buscar productos relacionados - BÚSQUEDA EXHAUSTIVA
      const relatedProducts: string[] = [];
      const currentPath = window.location.pathname;
      
      // 1. Buscar en secciones específicas de productos relacionados
      const relatedSelectors = [
        '[data-hook*="related"]',
        '[data-hook*="Related"]',
        '.related-products',
        '.product-related',
        '[class*="related-product"]',
        '[class*="RelatedProduct"]',
        '.recommended-products',
        '.you-may-also-like',
      ];
      
      relatedSelectors.forEach((selector) => {
        try {
          const container = document.querySelector(selector);
          if (container) {
            const links = container.querySelectorAll('a[href*="/product-page/"]');
            links.forEach((link) => {
              const href = link.getAttribute('href');
              if (href) {
                const fullUrl = href.startsWith('http') ? href : `https://www.cpsmaterialdeportivo.com${href}`;
                const relatedSlug = fullUrl.split('/product-page/')[1]?.split('?')[0];
                if (relatedSlug && 
                    relatedSlug !== currentPath.split('/product-page/')[1] &&
                    !relatedProducts.includes(relatedSlug)) {
                  relatedProducts.push(relatedSlug);
                }
              }
            });
          }
        } catch (e) {
          // Ignorar errores
        }
      });
      
      // 2. Buscar en toda la página (solo si no encontramos en secciones específicas)
      if (relatedProducts.length === 0) {
        const allRelatedLinks = document.querySelectorAll('a[href*="/product-page/"]');
        allRelatedLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href) {
            const fullUrl = href.startsWith('http') ? href : `https://www.cpsmaterialdeportivo.com${href}`;
            const relatedSlug = fullUrl.split('/product-page/')[1]?.split('?')[0];
            if (relatedSlug && 
                relatedSlug !== currentPath.split('/product-page/')[1] &&
                !relatedProducts.includes(relatedSlug) &&
                relatedProducts.length < 10) { // Limitar a 10 productos relacionados
              relatedProducts.push(relatedSlug);
            }
          }
        });
      }
      
      return {
        name,
        price,
        description,
        images,
        variants: Object.keys(variants).length > 0 ? variants : undefined,
        relatedProducts: relatedProducts.length > 0 ? relatedProducts : undefined,
      };
    });
    
    if (!productData.name) {
      console.warn(`⚠️  No se encontró nombre en ${productUrl}`);
      return null;
    }
    
    // Calcular precio sin IVA (asumiendo 21% IVA)
    const priceWithoutIVA = productData.price ? productData.price / 1.21 : undefined;
    
    const slug = generateSlug(productData.name);
    
    const product: ScrapedProduct = {
      name: productData.name,
      slug,
      price: productData.price || 0,
      priceWithoutIVA,
      description: productData.description || `Producto ${productData.name}`,
      images: productData.images.length > 0 ? productData.images : [],
      category: categorySlug,
      subcategory,
      ...(productData.variants && { variants: productData.variants }),
      ...(productData.relatedProducts && { relatedProducts: productData.relatedProducts }),
    };
    
    // Si hay variantes, agregarlas a la descripción como JSON
    if (productData.variants && Object.keys(productData.variants).length > 0) {
      product.description += `\n\n<!-- VARIANTES: ${JSON.stringify(productData.variants)} -->`;
    }
    
    console.log(`✅ Extraído: ${product.name} (${product.price ? `${product.price}€` : 'sin precio'})`);
    return product;
  } catch (error) {
    console.error(`❌ Error al extraer producto de ${productUrl}:`, error);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando scraping de productos con Puppeteer...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
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
    const productUrls = await getProductUrlsFromCategory(page, categoryUrl);
    allProductUrls.push(...productUrls);
    
    // Pequeña pausa para no sobrecargar el servidor
    await new Promise(r => setTimeout(r, 2000));
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
    
    const product = await scrapeProduct(page, productUrl, categorySlug, subcategory);
    if (product) {
      allProducts.push(product);
    }
    
    // Pausa entre requests
    await new Promise(r => setTimeout(r, 1000));
    
    // Mostrar progreso
    if ((i + 1) % 10 === 0) {
      console.log(`📊 Progreso: ${i + 1}/${uniqueProductUrls.length} productos procesados`);
    }
  }
  
  await browser.close();
  
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
