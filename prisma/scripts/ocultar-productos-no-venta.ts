/**
 * Oculta productos que CPS no vende (muñecas, bebé, puericultura, etc.).
 * Ejecutar tras cada import Miniland o cuando se añadan reglas nuevas.
 *
 * npx tsx prisma/scripts/ocultar-productos-no-venta.ts
 * npx tsx prisma/scripts/ocultar-productos-no-venta.ts --dry-run
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { NON_SELLABLE_SQL_REGEX } from '../../app/lib/productExclusions';

const dryRun = process.argv.includes('--dry-run');
const TXT = `lower(COALESCE(name, '') || ' ' || COALESCE(description, ''))`;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  const where = `${TXT} ~* '${NON_SELLABLE_SQL_REGEX}'`;

  const preview = await pool.query(`
    SELECT proveedor, subcategory, COUNT(*)::int AS n
    FROM "Product"
    WHERE ${where}
      AND (visible_web = true OR published = true)
    GROUP BY proveedor, subcategory
    ORDER BY n DESC
  `);

  console.log(dryRun ? '[dry-run] Productos a ocultar por proveedor/subcategoría:' : 'Ocultando productos no vendibles...');
  console.table(preview.rows);

  if (!dryRun) {
    const products = await pool.query(`
      UPDATE "Product"
      SET visible_web = false, published = false, "updatedAt" = NOW()
      WHERE ${where}
      RETURNING id
    `);

    const ids = products.rows.map((r: { id: number }) => r.id);
    if (ids.length > 0) {
      await pool.query(
        `UPDATE "ProductVariant"
         SET visible_web = false, "updatedAt" = NOW()
         WHERE "productId" = ANY($1::int[])`,
        [ids]
      );
    }

    console.log('Productos ocultados:', products.rowCount);
  }

  const visibles = await pool.query(`
    SELECT COUNT(*)::int AS n
    FROM "Product"
    WHERE subcategory = 'Juguetes Educativos'
      AND visible_web = true
      AND ${where}
  `);
  console.log('Muñecas/bebé aún visibles en Juguetes Educativos:', visibles.rows[0].n);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
