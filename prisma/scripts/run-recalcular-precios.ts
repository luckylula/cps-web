import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL no definida');
  process.exit(1);
}

const pool = new Pool({ connectionString });

const RESUMEN_SQL = `
WITH calculado AS (
  SELECT
    p.id,
    p.proveedor,
    p.price AS precio_actual,
    CASE
      WHEN LOWER(COALESCE(p.proveedor, '')) = 'miniland' THEN
        CEIL((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric * 2) / 2
      ELSE
        ROUND((
          p."precioBase" * 1.21 *
          CASE
            WHEN p."precioBase" <  50 THEN 1.50
            WHEN p."precioBase" < 100 THEN 1.47
            WHEN p."precioBase" < 200 THEN 1.43
            WHEN p."precioBase" < 400 THEN 1.38
            ELSE 1.30
          END
        )::numeric, 2)
    END AS precio_nuevo
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL AND p."precioBase" > 0
)
SELECT
  COALESCE(proveedor, '(sin proveedor)') AS proveedor,
  COUNT(*)::int AS total,
  COUNT(*) FILTER (WHERE precio_actual IS DISTINCT FROM precio_nuevo)::int AS a_actualizar,
  COUNT(*) FILTER (WHERE precio_actual IS NOT DISTINCT FROM precio_nuevo)::int AS ya_correctos
FROM calculado
GROUP BY proveedor
ORDER BY proveedor;
`;

const EJEMPLOS_SQL = `
WITH base AS (
  SELECT p.id, p.name, p.proveedor, p."sku_interno", p."precioBase" AS precio_base,
    p.price AS precio_actual,
    CASE
      WHEN p."precioBase" < 50 THEN 1.50 WHEN p."precioBase" < 100 THEN 1.47
      WHEN p."precioBase" < 200 THEN 1.43 WHEN p."precioBase" < 400 THEN 1.38 ELSE 1.30
    END AS margen,
    ROUND((p."precioBase" * 1.21)::numeric, 2) AS precio_con_iva
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL AND p."precioBase" > 0
),
calculado AS (
  SELECT b.*,
    CASE WHEN LOWER(COALESCE(b.proveedor, '')) = 'miniland'
      THEN CEIL((b.precio_con_iva * b.margen)::numeric * 2) / 2
      ELSE ROUND((b.precio_con_iva * b.margen)::numeric, 2)
    END AS precio_nuevo
  FROM base b
),
ranked AS (
  SELECT c.*, ROW_NUMBER() OVER (PARTITION BY COALESCE(c.proveedor, '?') ORDER BY c.precio_base) AS rn
  FROM calculado c WHERE c.precio_actual IS DISTINCT FROM c.precio_nuevo
)
SELECT proveedor, "sku_interno", LEFT(name, 40) AS nombre, precio_base::float, margen::float,
  precio_actual::float AS antes, precio_nuevo::float AS despues
FROM ranked WHERE rn <= 3 ORDER BY proveedor, precio_base;
`;

const UPDATE_SQL = `
UPDATE "Product" AS p
SET price = c.precio_nuevo, "updatedAt" = NOW()
FROM (
  SELECT p2.id,
    CASE WHEN LOWER(COALESCE(p2.proveedor, '')) = 'miniland' THEN
      CEIL((p2."precioBase" * 1.21 * CASE
        WHEN p2."precioBase" < 50 THEN 1.50 WHEN p2."precioBase" < 100 THEN 1.47
        WHEN p2."precioBase" < 200 THEN 1.43 WHEN p2."precioBase" < 400 THEN 1.38 ELSE 1.30
      END)::numeric * 2) / 2
    ELSE ROUND((p2."precioBase" * 1.21 * CASE
        WHEN p2."precioBase" < 50 THEN 1.50 WHEN p2."precioBase" < 100 THEN 1.47
        WHEN p2."precioBase" < 200 THEN 1.43 WHEN p2."precioBase" < 400 THEN 1.38 ELSE 1.30
      END)::numeric, 2)
    END AS precio_nuevo
  FROM "Product" p2
  WHERE p2."precioBase" IS NOT NULL AND p2."precioBase" > 0
) AS c
WHERE p.id = c.id AND p.price IS DISTINCT FROM c.precio_nuevo;
`;

const VERIFY_SQL = `
WITH ok AS (
  SELECT p.id, p.price,
    CASE WHEN LOWER(COALESCE(p.proveedor, '')) = 'miniland' THEN
      CEIL((p."precioBase" * 1.21 * CASE
        WHEN p."precioBase" < 50 THEN 1.50 WHEN p."precioBase" < 100 THEN 1.47
        WHEN p."precioBase" < 200 THEN 1.43 WHEN p."precioBase" < 400 THEN 1.38 ELSE 1.30
      END)::numeric * 2) / 2
    ELSE ROUND((p."precioBase" * 1.21 * CASE
        WHEN p."precioBase" < 50 THEN 1.50 WHEN p."precioBase" < 100 THEN 1.47
        WHEN p."precioBase" < 200 THEN 1.43 WHEN p."precioBase" < 400 THEN 1.38 ELSE 1.30
      END)::numeric, 2)
    END AS esperado
  FROM "Product" p WHERE p."precioBase" IS NOT NULL AND p."precioBase" > 0
)
SELECT COUNT(*)::int AS incorrectos FROM ok WHERE price IS DISTINCT FROM esperado;
`;

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== Resumen por proveedor (antes del UPDATE) ===\n');
    const resumen = await client.query(RESUMEN_SQL);
    console.table(resumen.rows);

    console.log('\n=== Ejemplos (3 por proveedor) ===\n');
    const ejemplos = await client.query(EJEMPLOS_SQL);
    console.table(ejemplos.rows);

    await client.query('BEGIN');
    const update = await client.query(UPDATE_SQL);
    const verify = await client.query(VERIFY_SQL);
    await client.query('COMMIT');

    console.log(`\n✅ UPDATE completado: ${update.rowCount} productos actualizados`);
    console.log(`✅ Verificación: ${verify.rows[0].incorrectos} precios incorrectos restantes`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error — ROLLBACK aplicado:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
