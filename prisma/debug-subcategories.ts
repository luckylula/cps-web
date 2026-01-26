import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Analizando subcategorías en Material Escolar...\n');

  try {
    // Primero obtener la categoría para obtener su ID
    const category = await prisma.category.findUnique({
      where: {
        slug: 'material-escolar',
      },
    });

    if (!category) {
      console.error('❌ Categoría "material-escolar" no encontrada');
      process.exit(1);
    }

    // Obtener todos los productos de Material Escolar
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id, // Usar categoryId directamente
        visible_web: true,
        activo: true,
      },
      select: {
        id: true,
        name: true,
        subcategory: true,
      },
      take: 50,
    });

    console.log(`📦 Total de productos encontrados: ${products.length}\n`);

    // Agrupar por subcategoría
    const subcategoryCounts: Record<string, number> = {};
    let nullCount = 0;

    products.forEach((product) => {
      if (product.subcategory) {
        subcategoryCounts[product.subcategory] = (subcategoryCounts[product.subcategory] || 0) + 1;
      } else {
        nullCount++;
      }
    });

    console.log('📊 Distribución de subcategorías:');
    console.log('='.repeat(60));
    Object.entries(subcategoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([subcat, count]) => {
        console.log(`  "${subcat}": ${count} productos`);
      });
    
    if (nullCount > 0) {
      console.log(`  (sin subcategoría): ${nullCount} productos`);
    }

    console.log('\n📋 Subcategorías esperadas en la página:');
    const expectedSubcategories = [
      'Psicomotricidad',
      'Figuras espuma',
      'Balones de uso escolar',
      'Juegos alternativos',
      'Malabares',
      'Juegos en Educación infantil',
      'Material foam',
      'Colchonetas',
      'Educación musical',
    ];

    expectedSubcategories.forEach((subcat) => {
      const count = subcategoryCounts[subcat] || 0;
      const match = count > 0 ? '✅' : '❌';
      console.log(`  ${match} "${subcat}": ${count} productos`);
    });

    console.log('\n🔎 Ejemplos de productos:');
    console.log('='.repeat(60));
    products.slice(0, 10).forEach((product) => {
      console.log(`  - ${product.name}`);
      console.log(`    Subcategoría: "${product.subcategory || '(null)'}"`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
