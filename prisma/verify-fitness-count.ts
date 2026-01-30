/**
 * Verifica el conteo de productos para Fitness (deportes / Individual / Fitness).
 * Query correcto: categoryId='deportes', grupo='Individual', subcategory='Fitness'.
 * Ejecutar: npm run verify:fitness-count
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
  const whereCorrect = {
    categoryId: 'deportes',
    grupo: 'Individual',
    subcategory: 'Fitness',
    published: true,
    visible_web: true,
    activo: true,
    name: { not: '' as const },
    OR: [
      { sku_interno: null },
      { sku_interno: { not: { endsWith: '-BASE' } } },
    ],
  };

  const countWithFlags = await prisma.product.count({ where: whereCorrect });

  const whereSinPublished = {
    categoryId: 'deportes',
    grupo: 'Individual',
    subcategory: 'Fitness',
    visible_web: true,
    activo: true,
    name: { not: '' as const },
    OR: [
      { sku_interno: null },
      { sku_interno: { not: { endsWith: '-BASE' } } },
    ],
  };
  const countSinPublished = await prisma.product.count({ where: whereSinPublished });

  const countSoloTres = await prisma.product.count({
    where: {
      categoryId: 'deportes',
      grupo: 'Individual',
      subcategory: 'Fitness',
    },
  });

  console.log('Fitness (deportes / Individual / Fitness):');
  console.log('  Solo categoryId+grupo+subcategory (como tu SQL):', countSoloTres);
  console.log('  + visible_web, activo, name, sku_interno:', countWithFlags);
  console.log('  Referencia esperada: 344');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
