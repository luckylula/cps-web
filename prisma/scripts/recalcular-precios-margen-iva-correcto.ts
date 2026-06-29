/**
 * Recalcular precios en Neon — fórmula Iván (CORRECTA)
 *
 *   1. precioConMargen = precioBase × margen
 *   2. precioFinal     = precioConMargen × 1.21
 *
 * Márgenes según precio base (sin IVA):
 *   < 50 € → 1.50 | < 100 € → 1.47 | < 200 € → 1.43 | < 400 € → 1.38 | ≥ 400 € → 1.30
 *
 * Miniland: 2 decimales (igual que Jim Sports / Made for Sport; sin redondeo a 0,50 €)
 *
 * Ejecutar:
 *   node --import tsx prisma/scripts/recalcular-precios-margen-iva-correcto.ts
 *
 * Solo UPDATE en "Product". Usa DATABASE_URL de .env / .env.local
 */

import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL no definida');
  process.exit(1);
}

const pool = new Pool({ connectionString });

/** SQL: margen dinámico según precioBase */
const MARGEN_SQL = `CASE
  WHEN p."precioBase" <  50 THEN 1.50
  WHEN p."precioBase" < 100 THEN 1.47
  WHEN p."precioBase" < 200 THEN 1.43
  WHEN p."precioBase" < 400 THEN 1.38
  ELSE 1.30
END`;

/** Fórmula CORRECTA: (base × margen) × 1.21 */
function sqlPrecioCorrecto(alias: string) {
  return `ROUND((${alias}."precioBase" * ${MARGEN_SQL.replace(/p\./g, `${alias}.`)} * 1.21)::numeric, 2)`;
}

const TEORICOS = [
  { base: 30, margen: 1.5 },
  { base: 80, margen: 1.47 },
  { base: 150, margen: 1.43 },
  { base: 500, margen: 1.3 },
];

function calcCorrecto(base: number, margen: number) {
  return Math.round(base * margen * 1.21 * 100) / 100;
}

function calcIvaPrimero(base: number, margen: number) {
  return Math.round(base * 1.21 * margen * 100) / 100;
}

function calcSinIva(base: number, margen: number) {
  return Math.round(base * margen * 100) / 100;
}

const RESUMEN_SQL = `
WITH calculado AS (
  SELECT
    p.id,
    p.proveedor,
    p.price AS precio_actual,
    ${sqlPrecioCorrecto('p')} AS precio_nuevo
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
  SELECT
    p.id, p.name, p.proveedor, p."sku_interno",
    p."precioBase"::float AS precio_base,
    p.price::float AS precio_actual,
    CASE
      WHEN p."precioBase" < 50 THEN 1.50 WHEN p."precioBase" < 100 THEN 1.47
      WHEN p."precioBase" < 200 THEN 1.43 WHEN p."precioBase" < 400 THEN 1.38 ELSE 1.30
    END::float AS margen
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL AND p."precioBase" > 0
),
calculado AS (
  SELECT
    b.*,
    ROUND((b.precio_base * b.margen)::numeric, 2)::float AS precio_con_margen,
    ROUND((b.precio_base * 1.21 * b.margen)::numeric, 2)::float AS precio_iva_primero,
    ROUND((b.precio_base * b.margen * 1.21)::numeric, 2)::float AS precio_correcto
  FROM base b
),
ranked AS (
  SELECT c.*,
    ROW_NUMBER() OVER (PARTITION BY COALESCE(c.proveedor, '?') ORDER BY c.precio_base) AS rn
  FROM calculado c
  WHERE c.precio_actual IS DISTINCT FROM c.precio_correcto
)
SELECT
  proveedor, "sku_interno", LEFT(name, 35) AS nombre,
  precio_base, margen, precio_con_margen,
  precio_actual AS en_bd_ahora,
  precio_iva_primero AS formula_iva_antes_margen,
  precio_correcto AS formula_correcta
FROM ranked
WHERE rn <= 3
ORDER BY proveedor, precio_base;
`;

const UPDATE_SQL = `
UPDATE "Product" AS p
SET price = c.precio_nuevo, "updatedAt" = NOW()
FROM (
  SELECT p2.id, ${sqlPrecioCorrecto('p2')} AS precio_nuevo
  FROM "Product" p2
  WHERE p2."precioBase" IS NOT NULL AND p2."precioBase" > 0
) AS c
WHERE p.id = c.id AND p.price IS DISTINCT FROM c.precio_nuevo;
`;

const VERIFY_SQL = `
WITH ok AS (
  SELECT p.id, p.price, ${sqlPrecioCorrecto('p')} AS esperado
  FROM "Product" p
  WHERE p."precioBase" IS NOT NULL AND p."precioBase" > 0
)
SELECT COUNT(*)::int AS incorrectos FROM ok WHERE price IS DISTINCT FROM esperado;
`;

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' FÓRMULA CORRECTA (Iván): (precioBase × margen) × 1.21');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Ejemplos teóricos:\n');
  console.log(
    'Base   │ Margen │ Sin IVA (×margen) │ IVA×Margen (viejo orden) │ CORRECTO (×margen×1.21)'
  );
  console.log(
    '───────┼────────┼───────────────────┼──────────────────────────┼─────────────────────────'
  );
  for (const { base, margen } of TEORICOS) {
    const sinIva = calcSinIva(base, margen);
    const ivaPrimero = calcIvaPrimero(base, margen);
    const correcto = calcCorrecto(base, margen);
    console.log(
      `${String(base).padStart(5)} € │ ${String(margen).padEnd(6)} │ ${String(sinIva).padStart(17)} € │ ${String(ivaPrimero).padStart(24)} € │ ${String(correcto).padStart(10)} €`
    );
  }
  console.log('\nMiniland 30 €: correcto =', calcCorrecto(30, 1.5), '€ (2 decimales, sin redondeo 0,50)\n');

  const client = await pool.connect();
  try {
    console.log('=== Resumen por proveedor ===\n');
    const resumen = await client.query(RESUMEN_SQL);
    console.table(resumen.rows);

    console.log('\n=== Ejemplos reales en BD ===\n');
    const ejemplos = await client.query(EJEMPLOS_SQL);
    if (ejemplos.rows.length === 0) {
      console.log('(Todos los precios ya coinciden con la fórmula correcta)\n');
    } else {
      console.table(ejemplos.rows);
    }

    await client.query('BEGIN');
    const update = await client.query(UPDATE_SQL);
    const verify = await client.query(VERIFY_SQL);
    await client.query('COMMIT');

    console.log(`\n✅ UPDATE: ${update.rowCount} productos actualizados`);
    console.log(`✅ Verificación: ${verify.rows[0].incorrectos} precios incorrectos restantes`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error — ROLLBACK:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
