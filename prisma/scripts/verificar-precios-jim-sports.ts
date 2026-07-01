/**
 * Verificar precios Jim Sports en Neon (solo lectura).
 * Fórmula: price = ROUND(precioBase × margen × 1.21, 2)
 *
 * Uso:
 *   npx tsx prisma/scripts/verificar-precios-jim-sports.ts
 *   npx tsx prisma/scripts/verificar-precios-jim-sports.ts --since 2026-07-01T07:17:00Z
 *   npx tsx prisma/scripts/verificar-precios-jim-sports.ts --since 2026-07-01T07:17:00Z --api 5
 */
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const CLIENT_AUTH = process.env.JIM_SPORTS_CLIENT_AUTH ?? '13658d28-28f7-493b-bb16-16307fe31398';

const MARGEN = `CASE
  WHEN p."precioBase" < 50 THEN 1.50
  WHEN p."precioBase" < 100 THEN 1.47
  WHEN p."precioBase" < 200 THEN 1.43
  WHEN p."precioBase" < 400 THEN 1.38
  ELSE 1.30
END`;

function parseArgs() {
  const args = process.argv.slice(2);
  let since: string | null = null;
  let apiSample = 0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--since') since = args[++i] ?? null;
    else if (args[i] === '--api') apiSample = parseInt(args[++i], 10) || 0;
  }
  return { since, apiSample };
}

function calcularPrecioConMargen(precioBase: number) {
  if (!Number.isFinite(precioBase) || precioBase <= 0) return { precioBase: 0, price: 0 };
  let m = 1.3;
  if (precioBase < 50) m = 1.5;
  else if (precioBase < 100) m = 1.47;
  else if (precioBase < 200) m = 1.43;
  else if (precioBase < 400) m = 1.38;
  const price = Math.round(precioBase * m * 1.21 * 100) / 100;
  return { precioBase: Math.round(precioBase * 100) / 100, price };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const { since, apiSample } = parseArgs();
  const sinceClause = since ? `AND p."updatedAt" >= $1::timestamptz` : '';
  const params = since ? [since] : [];

  console.log('=== Verificación precios Jim Sports ===\n');
  if (since) console.log(`Filtro: productos actualizados desde ${since}\n`);

  const resumen = await pool.query(
    `
    WITH calc AS (
      SELECT
        p.ref_proveedor,
        p.price::float AS en_bd,
        ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float AS esperado,
        p."updatedAt"
      FROM "Product" p
      WHERE LOWER(p.proveedor) = 'jim_sports' AND p."precioBase" > 0
      ${sinceClause}
    )
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE en_bd IS NOT DISTINCT FROM esperado)::int AS formula_ok,
      COUNT(*) FILTER (WHERE en_bd IS DISTINCT FROM esperado)::int AS formula_mal,
      MIN("updatedAt") AS primero,
      MAX("updatedAt") AS ultimo
    FROM calc
    `,
    params
  );
  console.log('Resumen:', resumen.rows[0]);

  if (since) {
    const pendientes = await pool.query(
      `
      SELECT COUNT(*)::int AS pendientes
      FROM "Product" p
      WHERE LOWER(p.proveedor) = 'jim_sports'
        AND p."precioBase" > 0
        AND p."updatedAt" < $1::timestamptz
      `,
      [since]
    );
    console.log('Aún sin actualizar en este ciclo:', pendientes.rows[0]);
  }

  const mal = await pool.query(
    `
    WITH calc AS (
      SELECT
        p.ref_proveedor,
        LEFT(p.name, 40) AS name,
        p."precioBase"::float AS base,
        p.price::float AS en_bd,
        ROUND((p."precioBase" * ${MARGEN} * 1.21)::numeric, 2)::float AS esperado,
        p."updatedAt"
      FROM "Product" p
      WHERE LOWER(p.proveedor) = 'jim_sports' AND p."precioBase" > 0
      ${sinceClause}
    )
    SELECT * FROM calc
    WHERE en_bd IS DISTINCT FROM esperado
    ORDER BY ABS(COALESCE(en_bd, 0) - esperado) DESC
    LIMIT 10
    `,
    params
  );
  if (mal.rows.length === 0) {
    console.log('\n✓ Todos cuadran con base × margen × 1.21');
  } else {
    console.log('\nDiferencias (suele ser redondeo de 0,01 €):');
    console.table(mal.rows);
  }

  if (apiSample > 0) {
    console.log(`\n--- Muestra API Jim Sports (${apiSample} productos recientes) ---`);
    const { rows } = await pool.query(
      `
      SELECT ref_proveedor, "precioBase"::float AS base, price::float AS price
      FROM "Product"
      WHERE LOWER(proveedor) = 'jim_sports'
        ${since ? `AND "updatedAt" >= $1::timestamptz` : ''}
      ORDER BY "updatedAt" DESC
      LIMIT $${since ? 2 : 1}
      `,
      since ? [since, apiSample] : [apiSample]
    );

    let ok = 0;
    let fail = 0;
    for (const row of rows) {
      const res = await fetch(
        `https://api.jimsports.com/v1/product/byref/${encodeURIComponent(row.ref_proveedor)}`,
        { headers: { Accept: 'application/json', ClientAuth: CLIENT_AUTH } }
      );
      if (!res.ok) {
        fail++;
        console.log(`SKIP ${row.ref_proveedor}: API HTTP ${res.status}`);
        await sleep(1100);
        continue;
      }
      const data = await res.json();
      const expected = calcularPrecioConMargen(Number(data.price) || 0);
      const match =
        Math.abs(row.base - expected.precioBase) < 0.01 &&
        Math.abs(row.price - expected.price) < 0.01;
      if (match) {
        ok++;
        console.log(`OK ${row.ref_proveedor}: API ${data.price} → BD ${row.price} €`);
      } else {
        fail++;
        console.log(
          `FAIL ${row.ref_proveedor}: API ${data.price} → esperado ${expected.price}, BD ${row.price}`
        );
      }
      await sleep(1100);
    }
    console.log(`\nAPI vs BD: ${ok} ok, ${fail} fallos/skip de ${rows.length}`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
