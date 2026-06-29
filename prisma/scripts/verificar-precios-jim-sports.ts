import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const M = `CASE
  WHEN p."precioBase" < 50 THEN 1.50
  WHEN p."precioBase" < 100 THEN 1.47
  WHEN p."precioBase" < 200 THEN 1.43
  WHEN p."precioBase" < 400 THEN 1.38
  ELSE 1.30
END`;

async function main() {
  const r = await pool.query(`
    WITH calc AS (
      SELECT p.price::float AS en_bd,
        ROUND((p."precioBase" * ${M} * 1.21)::numeric, 2)::float AS esperado,
        p."updatedAt"
      FROM "Product" p
      WHERE LOWER(p.proveedor) = 'jim_sports' AND p."precioBase" > 0
    )
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE en_bd IS NOT DISTINCT FROM esperado)::int AS ok,
      COUNT(*) FILTER (WHERE en_bd IS DISTINCT FROM esperado)::int AS mal,
      MAX("updatedAt") AS ultimo_update
    FROM calc
  `);
  console.log(r.rows[0]);
  await pool.end();
}

main();
