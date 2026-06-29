/**
 * Verificar precios Made for Sport en Neon (solo lectura)
 * Fórmula: price = ROUND(precioBase × margen × 1.21, 2)
 *
 * node --import tsx prisma/scripts/verificar-precios-made-for-sport.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const PROVEEDOR = "LOWER(p.proveedor) = 'made_for_sport'";

const MARGEN = `CASE
  WHEN p."precioBase" <  50 THEN 1.50
  WHEN p."precioBase" < 100 THEN 1.47
  WHEN p."precioBase" < 200 THEN 1.43
  WHEN p."precioBase" < 400 THEN 1.38
  ELSE 1.30
END`;

async function main() {
  console.log('=== Verificación precios Made for Sport ===\n');
  console.log('Fórmula: precioFinal = ROUND(precioBase × margen × 1.21, 2)\n');

  const resumen = await pool.query(`
    WITH calc AS (
      SELECT
        p.id,
        p.price::float AS price,
        ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float AS esperado
      FROM "Product" p
      WHERE ${PROVEEDOR}
        AND p."precioBase" IS NOT NULL AND p."precioBase" > 0
    )
    SELECT
      COUNT(*)::int AS con_precio_base,
      COUNT(*) FILTER (WHERE price IS DISTINCT FROM esperado)::int AS incorrectos,
      COUNT(*) FILTER (WHERE price IS NOT DISTINCT FROM esperado)::int AS correctos,
      COUNT(*) FILTER (WHERE price IS NULL OR price = 0)::int AS price_cero
    FROM calc
  `);
  console.log('Resumen:', resumen.rows[0]);

  const ejemplos = await pool.query(`
    WITH calc AS (
      SELECT
        p."sku_interno",
        LEFT(p.name, 45) AS name,
        p."precioBase"::float AS base,
        p.price::float AS en_bd,
        CASE
          WHEN p."precioBase" < 50 THEN 1.50 WHEN p."precioBase" < 100 THEN 1.47
          WHEN p."precioBase" < 200 THEN 1.43 WHEN p."precioBase" < 400 THEN 1.38 ELSE 1.30
        END::float AS margen,
        ROUND((p."precioBase" * CASE
          WHEN p."precioBase" < 50 THEN 1.50 WHEN p."precioBase" < 100 THEN 1.47
          WHEN p."precioBase" < 200 THEN 1.43 WHEN p."precioBase" < 400 THEN 1.38 ELSE 1.30
        END * 1.21)::numeric, 2)::float AS esperado,
        p."updatedAt"
      FROM "Product" p
      WHERE ${PROVEEDOR}
        AND p."precioBase" IS NOT NULL AND p."precioBase" > 0
    )
    SELECT * FROM calc
    ORDER BY "updatedAt" DESC NULLS LAST
    LIMIT 8
  `);
  console.log('\nÚltimos actualizados:');
  console.table(ejemplos.rows);

  const mal = await pool.query(`
    WITH calc AS (
      SELECT
        p."sku_interno",
        LEFT(p.name, 40) AS name,
        p."precioBase"::float AS base,
        p.price::float AS en_bd,
        ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float AS esperado,
        ABS(p.price::float - ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float) AS diff
      FROM "Product" p
      WHERE ${PROVEEDOR}
        AND p."precioBase" IS NOT NULL AND p."precioBase" > 0
    )
    SELECT * FROM calc WHERE en_bd IS DISTINCT FROM esperado
    ORDER BY diff DESC
    LIMIT 10
  `);
  if (mal.rows.length === 0) {
    console.log('\n✅ Todos los precios Made for Sport con precioBase > 0 coinciden con la fórmula.');
  } else {
    console.log('\n⚠️  Precios que NO coinciden (top 10):');
    console.table(mal.rows);
  }

  const patron = await pool.query(`
    WITH calc AS (
      SELECT
        p.price::float AS en_bd,
        ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float AS esperado
      FROM "Product" p
      WHERE ${PROVEEDOR}
        AND p."precioBase" IS NOT NULL AND p."precioBase" > 0
        AND p.price IS DISTINCT FROM ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)
    )
    SELECT
      CASE
        WHEN en_bd = CEIL(esperado) AND en_bd > esperado THEN 'redondeo_al_euro'
        WHEN ABS(en_bd - esperado) <= 0.011 THEN 'diff_1_centimo'
        ELSE 'otro'
      END AS tipo,
      COUNT(*)::int AS n
    FROM calc
    GROUP BY 1
    ORDER BY n DESC
  `);
  if (patron.rows.length > 0) {
    console.log('\nTipo de discrepancia en incorrectos:');
    console.table(patron.rows);
  }

  const sinBase = await pool.query(`
    SELECT COUNT(*)::int AS n
    FROM "Product"
    WHERE LOWER(proveedor) = 'made_for_sport'
      AND (COALESCE("precioBase", 0) = 0 OR price IS NULL OR price = 0)
  `);
  console.log('\nProductos sin precio base o price=0:', sinBase.rows[0].n);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
