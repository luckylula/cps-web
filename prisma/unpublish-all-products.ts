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

async function unpublishAllProducts() {
  try {
    console.log('🔄 Actualizando todos los productos a published: false...\n');

    // Contar productos antes
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total de productos en la base de datos: ${totalProducts}`);

    // Actualizar todos los productos
    const result = await prisma.product.updateMany({
      where: {
        // Sin filtro = todos los productos
      },
      data: {
        published: false,
      },
    });

    console.log(`\n✅ Actualizados ${result.count} productos a published: false`);
    console.log('\n📝 Todos los productos están ahora ocultos en la web.');
    console.log('   Cuando subas tu Excel con los 2 productos activos,');
    console.log('   solo esos pasarán a published: true.\n');
  } catch (error) {
    console.error('❌ Error al actualizar productos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

unpublishAllProducts();
