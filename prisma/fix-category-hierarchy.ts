import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mapeo de slugs de subcategorías a nombres de subcategoría
const SUBCATEGORY_MAPPING: Record<string, string> = {
  'psicomotricidad': 'Psicomotricidad',
  'figuras-espuma': 'Figuras espuma',
  'balones-escolares': 'Balones de uso escolar',
  'juegos-alternativos': 'Juegos alternativos',
  'educacion-infantil': 'Juegos en Educación infantil',
  'malabares': 'Malabares',
  'material-foam': 'Material foam',
  'colchonetas': 'Colchonetas',
  'educacion-musical': 'Educación musical',
};

async function main() {
  console.log('🔧 Iniciando corrección de jerarquía de categorías...\n');

  try {
    // Obtener la categoría principal "Material Escolar"
    const materialEscolar = await prisma.category.findUnique({
      where: { slug: 'material-escolar' },
    });

    if (!materialEscolar) {
      console.error('❌ Error: No se encontró la categoría "Material Escolar"');
      console.log('   Creando la categoría...');
      const newCategory = await prisma.category.create({
        data: {
          id: 'material-escolar', // El id debe coincidir con el slug para consistencia
          name: 'Material Escolar',
          slug: 'material-escolar',
          description: 'Artículos que te permiten enseñar y crear un entorno de aprendizaje deportivo.',
        },
      });
      console.log('✅ Categoría "Material Escolar" creada');
      process.exit(0);
    }

    console.log(`✅ Categoría principal encontrada: "${materialEscolar.name}" (ID: ${materialEscolar.id})\n`);

    let totalUpdated = 0;
    let totalErrors = 0;
    const errors: Array<{ product: string; error: string }> = [];

    // Procesar cada subcategoría
    for (const [slug, subcategoryName] of Object.entries(SUBCATEGORY_MAPPING)) {
      console.log(`\n📦 Procesando subcategoría: ${subcategoryName} (slug: ${slug})`);
      console.log('─'.repeat(60));

      // Buscar la categoría de subcategoría
      const subcategoryCategory = await prisma.category.findUnique({
        where: { slug },
      });

      if (!subcategoryCategory) {
        console.log(`⚠️  No se encontró categoría con slug: ${slug}`);
        continue;
      }

      // Obtener productos por separado usando categoryId
      const products = await prisma.product.findMany({
        where: {
          categoryId: subcategoryCategory.id,
          visible_web: true,
          activo: true,
        },
      });

      console.log(`   Encontrados ${products.length} productos en esta categoría`);

      // Actualizar cada producto
      for (const product of products) {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              categoryId: materialEscolar.id,
              subcategory: subcategoryName,
            },
          });

          totalUpdated++;
          console.log(`   ✅ Actualizado: ${product.name}`);
        } catch (error: any) {
          totalErrors++;
          const errorMsg = error.message || 'Error desconocido';
          errors.push({
            product: product.name,
            error: errorMsg,
          });
          console.log(`   ❌ Error al actualizar "${product.name}": ${errorMsg}`);
        }
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE CORRECCIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos actualizados: ${totalUpdated}`);
    console.log(`❌ Errores: ${totalErrors}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errores encontrados:`);
      errors.slice(0, 10).forEach(({ product, error }) => {
        console.log(`   - ${product}: ${error}`);
      });
      if (errors.length > 10) {
        console.log(`   ... y ${errors.length - 10} errores más`);
      }
    }

    console.log('\n✅ Corrección de jerarquía completada!');
  } catch (error: any) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
