/**
 * Aplicar criba Miniland: solo material-escolar vendible visible en web.
 * Muñecas, bebé y puericultura quedan ocultos siempre.
 *
 * npx tsx prisma/scripts/activar-miniland-visible-web.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { NON_SELLABLE_SQL_REGEX } from '../../app/lib/productExclusions';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const TXT = `lower(COALESCE(name, '') || ' ' || COALESCE(description, ''))`;

async function main() {
  await pool.query(`
    UPDATE "Product"
    SET visible_web = false, published = false, "updatedAt" = NOW()
    WHERE LOWER(proveedor) = 'miniland'
      AND ${TXT} ~* '${NON_SELLABLE_SQL_REGEX}'
  `);

  const upd = await pool.query(`
    UPDATE "Product"
    SET
      visible_web = ("categoryId" = 'material-escolar' AND NOT (${TXT} ~* '${NON_SELLABLE_SQL_REGEX}')),
      published = ("categoryId" = 'material-escolar' AND NOT (${TXT} ~* '${NON_SELLABLE_SQL_REGEX}')),
      "updatedAt" = NOW()
    WHERE LOWER(proveedor) = 'miniland'
  `);

  const r = await pool.query(`
    SELECT
      "categoryId",
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE visible_web = true)::int AS visibles
    FROM "Product"
    WHERE LOWER(proveedor) = 'miniland'
    GROUP BY 1
    ORDER BY total DESC
  `);

  console.log('Actualizados:', upd.rowCount);
  console.table(r.rows);
  await pool.end();
}

main();
