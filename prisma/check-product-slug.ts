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
      include: {
        category: true,
      },
    });

    if (product) {
      console.log('✅ Producto encontrado:');
      console.log(`   ID: ${product.id}`);
      console.log(`   Nombre: ${product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Publicado: ${product.published ? 'Sí' : 'No'}`);
      console.log(`   Categoría: ${product.category.name} (${product.category.slug})`);
      console.log(`   Precio: ${product.price}€`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Imágenes: ${product.images.length}`);
      
      if (!product.published) {
        console.log('\n⚠️  El producto existe pero NO está publicado (published: false)');
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
          published: true,
        },
        take: 20,
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`📋 Primeros ${allProducts.length} productos en la base de datos:`);
      allProducts.forEach((p, i) => {
        console.log(`   ${i + 1}. "${p.slug}" - ${p.name} ${p.published ? '✅' : '❌'}`);
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
    const publishedProducts = await prisma.product.count({
      where: { published: true },
    });

    console.log(`\n📊 Estadísticas:`);
    console.log(`   Total de productos: ${totalProducts}`);
    console.log(`   Productos publicados: ${publishedProducts}`);
    console.log(`   Productos no publicados: ${totalProducts - publishedProducts}`);
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
