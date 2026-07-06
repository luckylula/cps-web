/**
 * Reclasifica productos Made for Sport con subcategorías legacy (p. ej. Redes y porterías).
 *
 * Uso:
 *   npx tsx prisma/scripts/reclasificar-made-for-sport-taxonomia.ts
 *   npx tsx prisma/scripts/reclasificar-made-for-sport-taxonomia.ts --dry-run
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { resolveMadeForSportTaxonomy } from '../../app/lib/madeForSportTaxonomy';

const dryRun = process.argv.includes('--dry-run');
const LEGACY_SUBCATEGORIES = new Set(['Redes y porterías', 'Tenis de mesa', 'Juegos']);

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const { rows } = await pool.query<{
    id: number;
    ref_proveedor: string;
    name: string;
    categoryId: string;
    subcategory: string | null;
    grupo: string | null;
  }>(`
    SELECT id, ref_proveedor, name, "categoryId", subcategory, grupo
    FROM "Product"
    WHERE LOWER(proveedor) = 'made_for_sport'
  `);

  let updated = 0;
  const samples: object[] = [];

  for (const row of rows) {
    let mapped: ReturnType<typeof resolveMadeForSportTaxonomy> = null;

    if (row.subcategory === 'Tenis de mesa') {
      mapped = { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Tenis de mesa' };
    } else {
      mapped = resolveMadeForSportTaxonomy(row.name, row.grupo, row.subcategory);
    }

    if (!mapped) continue;

    const needsFix =
      LEGACY_SUBCATEGORIES.has(row.subcategory ?? '') ||
      row.subcategory === 'Tenis de mesa' ||
      row.categoryId === 'material-escolar' ||
      row.categoryId !== mapped.categoryId ||
      row.subcategory !== mapped.subcategory ||
      (row.grupo ?? null) !== mapped.grupo;

    if (!needsFix) continue;

    if (samples.length < 10) {
      samples.push({
        ref: row.ref_proveedor,
        name: row.name,
        antes: `${row.categoryId} | ${row.subcategory} | ${row.grupo}`,
        despues: `${mapped.categoryId} | ${mapped.subcategory} | ${mapped.grupo}`,
      });
    }

    if (!dryRun) {
      await pool.query(
        `UPDATE "Product"
         SET "categoryId" = $1, subcategory = $2, grupo = $3, "updatedAt" = NOW()
         WHERE id = $4`,
        [mapped.categoryId, mapped.subcategory, mapped.grupo, row.id]
      );
    }
    updated++;
  }

  console.log(dryRun ? 'DRY RUN — Made for Sport' : 'Made for Sport reclasificados:', updated);
  console.log('Ejemplos:', JSON.stringify(samples, null, 2));

  const remaining = await pool.query(`
    SELECT COUNT(*)::int AS n FROM "Product"
    WHERE LOWER(proveedor) = 'made_for_sport'
      AND subcategory IN ('Redes y porterías', 'Tenis de mesa', 'Juegos')
  `);
  console.log('Restantes en subcategorías legacy:', remaining.rows[0].n);

  await pool.end();
}

main().catch(console.error);
