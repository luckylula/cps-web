import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL no está configurada en .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkProductSlug() {
  try {
    const slugToCheck = process.argv[2] || 'tu-si-q-vales';
    
    console.log(`🔍 Buscando producto con slug: "${slugToCheck}"\n`);

    // Buscar el producto
    const product = await prisma.product.findUnique({
      where: {
        slug: slugToCheck,
      },
    });

    if (product) {
      // Obtener la categoría por separado usando categoryId
      const category = await prisma.category.findUnique({
        where: {
          id: product.categoryId,
        },
      });

      console.log('✅ Producto encontrado:');
      console.log(`   ID: ${product.id}`);
      console.log(`   Nombre: ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Visible web: ${product.visible_web ? 'Sí' : 'No'}`);
      console.log(`   Activo: ${product.activo ? 'Sí' : 'No'}`);
      console.log(`   Categoría: ${category ? `${category.name} (${category.slug})` : `ID: ${product.categoryId}`}`);
      console.log(`   Precio: ${product.price ? `${product.price}€` : 'Consultar'}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Imágenes: ${product.images.length}`);
      
      if (!product.visible_web || !product.activo) {
        console.log('\n⚠️  El producto existe pero NO está visible en la web');
        if (!product.visible_web) console.log('   - visible_web: false');
        if (!product.activo) console.log('   - activo: false');
        console.log('   Por eso no aparece en la web.');
      }
    } else {
      console.log('❌ Producto NO encontrado con ese slug.\n');
      
      // Buscar productos similares
      console.log('🔍 Buscando productos con slugs similares...\n');
      const allProducts = await prisma.product.findMany({
        select: {
          slug: true,
          name: true,
          visible_web: true,
          activo: true,
        },
        take: 20,
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`📋 Primeros ${allProducts.length} productos en la base de datos:`);
      allProducts.forEach((p, i) => {
        const status = p.visible_web && p.activo ? '✅' : '❌';
        console.log(`   ${i + 1}. "${p.slug}" - ${p.name} ${status}`);
      });

      // Buscar si hay algún slug que contenga parte del texto
      const similar = allProducts.filter(p => 
        p.slug.toLowerCase().includes(slugToCheck.toLowerCase().substring(0, 5))
      );
      
      if (similar.length > 0) {
        console.log(`\n🔍 Productos con slugs similares:`);
        similar.forEach(p => {
          console.log(`   - "${p.slug}" - ${p.name}`);
        });
      }
    }

    // Estadísticas generales
    const totalProducts = await prisma.product.count();
    const visibleProducts = await prisma.product.count({
      where: { 
        visible_web: true,
        activo: true,
      },
    });

    console.log(`\n📊 Estadísticas:`);
    console.log(`   Total de productos: ${totalProducts}`);
    console.log(`   Productos visibles en web: ${visibleProducts}`);
    console.log(`   Productos no visibles: ${totalProducts - visibleProducts}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkProductSlug();
