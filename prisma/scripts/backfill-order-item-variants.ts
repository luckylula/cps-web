/**
 * Rellena OrderItem.refProveedor / color / talla desde Product / ProductVariant.
 *
 * Uso:
 *   npx tsx prisma/scripts/backfill-order-item-variants.ts
 *   npx tsx prisma/scripts/backfill-order-item-variants.ts --dry-run
 */
import 'dotenv/config';
import { Pool } from 'pg';

const dryRun = process.argv.includes('--dry-run');

function pick(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed) return trimmed;
  }
  return null;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const { rows } = await pool.query<{
    id: string;
    refProveedor: string | null;
    color: string | null;
    talla: string | null;
    product_ref: string | null;
    product_color: string | null;
    product_talla: string | null;
    variant_ref: string | null;
    ref_variante: string | null;
    variant_color: string | null;
    variant_talla: string | null;
  }>(`
    SELECT
      oi.id,
      oi."refProveedor",
      oi.color,
      oi.talla,
      p.ref_proveedor AS product_ref,
      p.color AS product_color,
      p.talla AS product_talla,
      v.ref_proveedor AS variant_ref,
      v.ref_variante,
      v.color AS variant_color,
      v.talla AS variant_talla
    FROM "OrderItem" oi
    JOIN "Product" p ON p.id = oi."productId"
    LEFT JOIN "ProductVariant" v ON v.id = oi."variantId"
  `);

  let updated = 0;
  const samples: object[] = [];

  for (const row of rows) {
    const nextRef = pick(row.ref_variante, row.variant_ref, row.product_ref, row.refProveedor);
    const nextColor = pick(row.variant_color, row.product_color, row.color);
    const nextTalla = pick(row.variant_talla, row.product_talla, row.talla);

    const changed =
      (row.refProveedor ?? null) !== nextRef ||
      (row.color ?? null) !== nextColor ||
      (row.talla ?? null) !== nextTalla;

    if (!changed) continue;

    if (samples.length < 10) {
      samples.push({
        id: row.id,
        antes: { ref: row.refProveedor, color: row.color, talla: row.talla },
        despues: { ref: nextRef, color: nextColor, talla: nextTalla },
      });
    }

    if (!dryRun) {
      await pool.query(
        `UPDATE "OrderItem"
         SET "refProveedor" = $1, color = $2, talla = $3
         WHERE id = $4`,
        [nextRef, nextColor, nextTalla, row.id]
      );
    }
    updated++;
  }

  const after = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE "refProveedor" IS NOT NULL AND "refProveedor" <> '')::int AS with_ref,
      COUNT(*) FILTER (WHERE color IS NOT NULL AND color <> '')::int AS with_color,
      COUNT(*) FILTER (WHERE talla IS NOT NULL AND talla <> '')::int AS with_talla
    FROM "OrderItem"
  `);

  console.log({ dryRun, total: rows.length, actualizados: updated, muestra: samples });
  console.log('Estado OrderItem:', after.rows[0]);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
