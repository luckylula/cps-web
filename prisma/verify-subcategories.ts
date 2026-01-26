import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Subcategorías esperadas de Material Escolar
const EXPECTED_SUBCATEGORIES = [
  { name: 'Psicomotricidad', slug: 'psicomotricidad' },
  { name: 'Figuras espuma', slug: 'figuras-espuma' },
  { name: 'Balones de uso escolar', slug: 'balones-escolares' },
  { name: 'Juegos alternativos', slug: 'juegos-alternativos' },
  { name: 'Malabares', slug: 'malabares' },
  { name: 'Juegos en Educación infantil', slug: 'educacion-infantil' },
  { name: 'Material foam', slug: 'material-foam' },
  { name: 'Colchonetas', slug: 'colchonetas' },
  { name: 'Educación musical', slug: 'educacion-musical' },
];

async function main() {
  console.log('🔍 Verificando subcategorías de Material Escolar...\n');

  try {
    for (const expected of EXPECTED_SUBCATEGORIES) {
      console.log(`\n📦 Verificando: ${expected.name} (slug: ${expected.slug})`);
      console.log('─'.repeat(60));
      
      // Buscar categoría por slug
      const category = await prisma.category.findUnique({
        where: { slug: expected.slug },
      });

      if (category) {
        // Obtener productos por separado usando categoryId
        const products = await prisma.product.findMany({
          where: {
            categoryId: category.id,
            visible_web: true,
            activo: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            visible_web: true,
            activo: true,
          },
        });

        console.log(`✅ Categoría encontrada: "${category.name}"`);
        console.log(`   ID: ${category.id}`);
        console.log(`   Productos visibles: ${products.length}`);
        
        if (products.length > 0) {
          console.log(`   Ejemplos de productos:`);
          products.slice(0, 3).forEach((p) => {
            console.log(`     - ${p.name}`);
          });
        } else {
          console.log(`   ⚠️  No hay productos visibles en esta categoría`);
        }
      } else {
        console.log(`❌ Categoría NO encontrada con slug: ${expected.slug}`);
      }
    }

    // Verificar también si hay productos con category = 'material-escolar'
    console.log(`\n\n📦 Verificando categoría principal: Material Escolar`);
    console.log('─'.repeat(60));
    const materialEscolar = await prisma.category.findUnique({
      where: { slug: 'material-escolar' },
    });

    if (materialEscolar) {
      // Obtener productos por separado usando categoryId
      const products = await prisma.product.findMany({
        where: {
          categoryId: materialEscolar.id,
          visible_web: true,
          activo: true,
        },
        select: {
          id: true,
          name: true,
          subcategory: true,
        },
        take: 5,
      });

      console.log(`✅ Categoría "Material Escolar" encontrada`);
      console.log(`   Productos visibles: ${products.length}`);
      if (products.length > 0) {
        console.log(`   Ejemplos (con subcategoría):`);
        products.forEach((p) => {
          console.log(`     - ${p.name}: subcategory="${p.subcategory || '(null)'}"`);
        });
      }
    } else {
      console.log(`❌ Categoría "Material Escolar" NO encontrada`);
    }

    console.log('\n\n✅ Verificación completada\n');

  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
