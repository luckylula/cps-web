/**
 * Verificar precios Miniland en Neon (solo lectura)
 * Fórmula: price = ROUND(precioBase × margen × 1.21, 2)
 *
 * node --import tsx prisma/scripts/verificar-precios-miniland.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const MARGEN = `CASE
  WHEN p."precioBase" <  50 THEN 1.50
  WHEN p."precioBase" < 100 THEN 1.47
  WHEN p."precioBase" < 200 THEN 1.43
  WHEN p."precioBase" < 400 THEN 1.38
  ELSE 1.30
END`;

async function main() {
  console.log('=== Verificación precios Miniland ===\n');
  console.log('Fórmula: precioFinal = ROUND(precioBase × margen × 1.21, 2)\n');

  const resumen = await pool.query(`
    WITH calc AS (
      SELECT
        p.id,
        p.price::float AS price,
        ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float AS esperado
      FROM "Product" p
      WHERE LOWER(p.proveedor) = 'miniland'
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
        END)::numeric, 2)::float AS sin_iva,
        ROUND((p."precioBase" * CASE
          WHEN p."precioBase" < 50 THEN 1.50 WHEN p."precioBase" < 100 THEN 1.47
          WHEN p."precioBase" < 200 THEN 1.43 WHEN p."precioBase" < 400 THEN 1.38 ELSE 1.30
        END * 1.21)::numeric, 2)::float AS esperado,
        p."updatedAt"
      FROM "Product" p
      WHERE LOWER(p.proveedor) = 'miniland'
        AND p."precioBase" IS NOT NULL AND p."precioBase" > 0
    )
    SELECT * FROM calc
    ORDER BY "updatedAt" DESC NULLS LAST
    LIMIT 8
  `);
  console.log('\nÚltimos actualizados (comprobar a mano base × margen × 1.21):');
  console.table(ejemplos.rows);

  const mal = await pool.query(`
    WITH calc AS (
      SELECT
        p."sku_interno",
        LEFT(p.name, 40) AS name,
        p."precioBase"::float AS base,
        p.price::float AS en_bd,
        ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float AS esperado
      FROM "Product" p
      WHERE LOWER(p.proveedor) = 'miniland'
        AND p."precioBase" IS NOT NULL AND p."precioBase" > 0
    )
    SELECT * FROM calc WHERE en_bd IS DISTINCT FROM esperado
    ORDER BY ABS(COALESCE(en_bd, 0) - esperado) DESC
    LIMIT 10
  `);
  if (mal.rows.length === 0) {
    console.log('\n✅ Todos los precios Miniland con precioBase > 0 coinciden con la fórmula.');
  } else {
    console.log('\n⚠️  Precios que NO coinciden (top 10):');
    console.table(mal.rows);
  }

  const sinBase = await pool.query(`
    SELECT COUNT(*)::int AS n
    FROM "Product"
    WHERE LOWER(proveedor) = 'miniland' AND (COALESCE("precioBase", 0) = 0 OR price IS NULL OR price = 0)
  `);
  console.log('\nProductos sin precio base o price=0:', sinBase.rows[0].n);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
