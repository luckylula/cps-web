/**
 * Aplicar criba Miniland: solo material-escolar visible en web.
 * bebe, juguetes y sin-clasificar quedan en BD pero ocultos (visible_web=false).
 *
 * node --import tsx prisma/scripts/activar-miniland-visible-web.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  const upd = await pool.query(`
    UPDATE "Product"
    SET
      visible_web = ("categoryId" = 'material-escolar'),
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
