/**
 * Verifica que la query devuelve productos de textil / Ropa Casual.
 * Uso: npm run verify:textil-casual  (o node --import tsx prisma/verify-textil-casual.ts)
 */
import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL no definida');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Verificando productos textil / Ropa Casual...\n');

  const whereBase = {
    categoryId: 'textil',
    subcategory: 'Ropa Casual',
    published: true,
    visible_web: true,
    activo: true,
    name: { not: '' },
    OR: [
      { sku_interno: null },
      { sku_interno: { not: { endsWith: '-BASE' } } },
    ],
  };

  const count = await prisma.product.count({ where: whereBase });
  console.log('Count (categoryId=textil, subcategory=Ropa Casual, published, visible_web, activo, sku filter):', count);

  const sample = await prisma.product.findMany({
    where: whereBase,
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      subcategory: true,
      proveedor: true,
      ref_proveedor: true,
      visible_web: true,
      published: true,
    },
  });
  console.log('\nMuestra (hasta 5):');
  sample.forEach((p) => console.log(' ', p.id, p.name, p.subcategory, p.proveedor, p.ref_proveedor));

  const categoryExists = await prisma.category.findUnique({
    where: { slug: 'textil' },
  });
  console.log('\nCategory slug=textil existe:', !!categoryExists, categoryExists ? `(${categoryExists.name})` : '');

  await prisma.$disconnect();
  pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
