import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Helper function to create or get category
async function getOrCreateCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  return await prisma.category.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      image: data.image,
    },
    create: {
      id: data.slug, // El id debe coincidir con el slug para consistencia
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
    },
  });
}

// Función para limpiar productos de prueba (desactivarlos en lugar de borrarlos)
async function cleanTestProducts() {
  console.log('🧹 Desactivando productos de prueba...');
  
  const testKeywords = ['joe biden', 'popo', 'xxxxx', 'soy la mejor', 'test', 'prueba'];
  
  const productsToDeactivate = await prisma.product.findMany({
    where: {
      OR: testKeywords.map(keyword => ({
        name: {
          contains: keyword,
          mode: 'insensitive',
        },
      })),
    },
    select: {
      id: true,
      name: true,
      published: true,
    },
  });
  
  if (productsToDeactivate.length > 0) {
    // Desactivar productos de prueba (published: false) en lugar de borrarlos
    // Esto preserva el historial de pedidos
    const updateResult = await prisma.product.updateMany({
      where: {
        OR: testKeywords.map(keyword => ({
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        })),
      },
      data: {
        published: false,
      },
    });
    
    console.log(`✅ Desactivados ${updateResult.count} productos de prueba (published: false)`);
    console.log(`   ℹ️  Los productos se mantienen en la base de datos para preservar el historial de pedidos`);
    
    // Mostrar algunos ejemplos de productos desactivados
    if (productsToDeactivate.length <= 10) {
      productsToDeactivate.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
      });
    } else {
      productsToDeactivate.slice(0, 5).forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
      });
      console.log(`   ... y ${productsToDeactivate.length - 5} productos más`);
    }
  } else {
    console.log('✅ No se encontraron productos de prueba para desactivar');
  }
}

async function main() {
  console.log('🌱 Iniciando seed final de productos desde scraping...\n');
  
  // 1. Limpiar productos de prueba
  await cleanTestProducts();
  console.log('');
  
  // 2. Leer productos desde JSON
  const jsonPath = join(process.cwd(), 'scraped-products.json');
  let scrapedProducts: ScrapedProduct[] = [];
  
  try {
    const jsonContent = readFileSync(jsonPath, 'utf-8');
    scrapedProducts = JSON.parse(jsonContent);
    console.log(`📖 Leídos ${scrapedProducts.length} productos desde ${jsonPath}\n`);
  } catch (error) {
    console.error(`❌ Error al leer ${jsonPath}:`, error);
    console.log('💡 Ejecuta primero: npm run scrape para generar el archivo JSON');
    process.exit(1);
  }
  
  // 3. Crear/obtener categorías
  const categories = await Promise.all([
    getOrCreateCategory({
      name: 'Material Escolar',
      slug: 'material-escolar',
      description: 'Artículos que te permiten enseñar y crear un entorno de aprendizaje deportivo.',
    }),
    getOrCreateCategory({
      name: 'Deporte Individual',
      slug: 'deporte-individual',
      description: 'Material para deportes individuales.',
    }),
    getOrCreateCategory({
      name: 'Deportes Colectivos',
      slug: 'deportes-colectivos',
      description: 'Material para deportes en equipo.',
    }),
    getOrCreateCategory({
      name: 'Material Complementario',
      slug: 'material-complementario',
      description: 'Material deportivo complementario.',
    }),
    getOrCreateCategory({
      name: 'Equipación Textil',
      slug: 'equipacion-textil',
      description: 'Equipación y ropa deportiva.',
    }),
  ]);
  
  const categoryMap = new Map(categories.map(cat => [cat.slug, cat]));
  
  // 4. Procesar productos
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: Array<{ product: string; error: string }> = [];
  
  for (const scrapedProduct of scrapedProducts) {
    try {
      const category = categoryMap.get(scrapedProduct.category);
      if (!category) {
        console.warn(`⚠️  Categoría no encontrada: ${scrapedProduct.category} para producto: ${scrapedProduct.name}`);
        skipped++;
        continue;
      }
      
      // Generar slug único
      const baseSlug = scrapedProduct.slug || generateSlug(scrapedProduct.name);
      const uniqueSlug = await ensureUniqueSlug(baseSlug);
      
      // Extraer variantes de la descripción si están en formato JSON
      let description = scrapedProduct.description;
      let variants: any = scrapedProduct.variants;
      
      const variantsMatch = description.match(/<!-- VARIANTES: ({.*?}) -->/);
      if (variantsMatch) {
        try {
          variants = JSON.parse(variantsMatch[1]);
          // Limpiar la descripción
          description = description.replace(/<!-- VARIANTES: .*? -->/, '').trim();
        } catch (e) {
          // Ignorar error de parsing
        }
      }
      
      // Si hay variantes, agregarlas a la descripción como texto legible
      if (variants && Object.keys(variants).length > 0) {
        const variantsText = Object.entries(variants)
          .map(([key, values]: [string, any]) => {
            if (Array.isArray(values) && values.length > 0) {
              return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${values.join(', ')}`;
            }
            return null;
          })
          .filter(Boolean)
          .join(' | ');
        
        if (variantsText) {
          description += `\n\nVariantes disponibles: ${variantsText}`;
        }
      }
      
      // Preparar datos del producto
      const productData = {
        name: scrapedProduct.name.trim(),
        slug: uniqueSlug,
        description: description || `Producto ${scrapedProduct.name}`,
        price: scrapedProduct.price || 0,
        images: scrapedProduct.images.length > 0 ? scrapedProduct.images : [],
        stock: scrapedProduct.stock || 0,
        categoryId: category.id,
        subcategory: scrapedProduct.subcategory || null,
        published: true, // Publicar todos los productos extraídos
        featured: false,
      };
      
      // Usar upsert para crear o actualizar
      const existingProduct = await prisma.product.findUnique({
        where: { slug: uniqueSlug },
      });
      
      if (existingProduct) {
        // Actualizar producto existente
        await prisma.product.update({
          where: { slug: uniqueSlug },
          data: productData,
        });
        updated++;
        console.log(`🔄 Actualizado: ${scrapedProduct.name}`);
      } else {
        // Crear nuevo producto
        await prisma.product.create({
          data: productData,
        });
        created++;
        console.log(`✨ Creado: ${scrapedProduct.name}`);
      }
    } catch (error: any) {
      console.error(`❌ Error al procesar ${scrapedProduct.name}:`, error.message);
      errors.push({
        product: scrapedProduct.name,
        error: error.message,
      });
      skipped++;
    }
  }
  
  // 5. Obtener estadísticas detalladas de productos en la base de datos
  const allProductsInDb = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // Contar productos con precio real (> 0)
  const productsWithPrice = allProductsInDb.filter(p => Number(p.price) > 0).length;
  
  // Contar productos con imágenes reales
  const productsWithImages = allProductsInDb.filter(p => p.images.length > 0).length;
  
  // Contar productos con descripción completa (> 50 caracteres)
  const productsWithDescription = allProductsInDb.filter(p => p.description.length > 50).length;
  
  // Contar productos recién creados (creados en esta sesión)
  const recentlyCreated = allProductsInDb.filter(p => {
    const created = new Date(p.createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Creados en los últimos 5 minutos
  }).length;
  
  // Contar productos recién actualizados (actualizados en esta sesión)
  const recentlyUpdated = allProductsInDb.filter(p => {
    const updated = new Date(p.updatedAt);
    const created = new Date(p.createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - updated.getTime()) / (1000 * 60);
    return diffMinutes < 5 && updated.getTime() !== created.getTime();
  }).length;
  
  // 6. Mostrar resumen DETALLADO
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN COMPLETO DEL SEED FINAL');
  console.log('='.repeat(70));
  console.log('\n📦 ESTADÍSTICAS DE PROCESAMIENTO:');
  console.log(`   ✅ Productos NUEVOS creados: ${created}`);
  console.log(`   🔄 Productos ACTUALIZADOS: ${updated}`);
  console.log(`   ⏭️  Productos omitidos (errores): ${skipped}`);
  console.log(`   📝 Total procesados en esta sesión: ${created + updated + skipped}`);
  console.log(`   📄 Total en archivo JSON: ${scrapedProducts.length}`);
  
  console.log('\n💰 ESTADÍSTICAS DE PRECIOS:');
  console.log(`   💵 Productos con precio REAL (> 0€): ${productsWithPrice}`);
  console.log(`   📊 Productos sin precio (0€): ${allProductsInDb.length - productsWithPrice}`);
  const avgPrice = allProductsInDb
    .filter(p => Number(p.price) > 0)
    .reduce((sum, p) => sum + Number(p.price), 0) / productsWithPrice || 0;
  console.log(`   📈 Precio promedio: ${avgPrice.toFixed(2)}€`);
  
  console.log('\n🖼️  ESTADÍSTICAS DE IMÁGENES:');
  console.log(`   📸 Productos con imágenes REALES: ${productsWithImages}`);
  console.log(`   🚫 Productos sin imágenes: ${allProductsInDb.length - productsWithImages}`);
  const avgImages = allProductsInDb
    .filter(p => p.images.length > 0)
    .reduce((sum, p) => sum + p.images.length, 0) / productsWithImages || 0;
  console.log(`   📊 Promedio de imágenes por producto: ${avgImages.toFixed(1)}`);
  
  console.log('\n📝 ESTADÍSTICAS DE DESCRIPCIONES:');
  console.log(`   ✍️  Productos con descripción completa (> 50 chars): ${productsWithDescription}`);
  console.log(`   📄 Productos con descripción corta: ${allProductsInDb.length - productsWithDescription}`);
  
  console.log('\n🔄 ESTADÍSTICAS DE ACTUALIZACIÓN:');
  console.log(`   🆕 Productos recién creados (últimos 5 min): ${recentlyCreated}`);
  console.log(`   🔄 Productos recién actualizados (últimos 5 min): ${recentlyUpdated}`);
  
  console.log('\n📊 RESUMEN GENERAL DE LA BASE DE DATOS:');
  console.log(`   📦 Total de productos en la base de datos: ${allProductsInDb.length}`);
  console.log(`   ✅ Productos publicados: ${allProductsInDb.filter(p => true).length}`); // Todos están publicados ahora
  
  // Productos con datos completos (precio + imágenes + descripción)
  const completeProducts = allProductsInDb.filter(p => 
    Number(p.price) > 0 && 
    p.images.length > 0 && 
    p.description.length > 50
  ).length;
  console.log(`   ⭐ Productos COMPLETOS (precio + imágenes + descripción): ${completeProducts}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ ERRORES ENCONTRADOS: ${errors.length}`);
    errors.slice(0, 10).forEach(({ product, error }) => {
      console.log(`   - ${product}: ${error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... y ${errors.length - 10} errores más`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ SEED FINAL COMPLETADO EXITOSAMENTE!');
  console.log('='.repeat(70));
  console.log('\n💡 PRÓXIMOS PASOS RECOMENDADOS:');
  console.log('   1. Revisar productos sin precio y actualizarlos manualmente');
  console.log('   2. Verificar productos sin imágenes y añadir imágenes');
  console.log('   3. Revisar descripciones y completar las que estén incompletas');
  console.log('   4. Verificar que las categorías y subcategorías sean correctas');
  console.log('   5. Probar la búsqueda y filtros en la web\n');
}

main()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
