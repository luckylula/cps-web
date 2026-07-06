/**
 * Reclasifica productos textil mal ubicados (Ropa Casual / Ropa Deportiva / Equipaciones).
 *
 * Uso:
 *   npx tsx prisma/scripts/reclasificar-textil-taxonomia.ts
 *   npx tsx prisma/scripts/reclasificar-textil-taxonomia.ts --dry-run
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { classifyMadeForSportProduct } from '../../app/lib/madeForSportTaxonomy';
import { classifyTextilByName } from '../../app/lib/textilTaxonomy';

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const { rows } = await pool.query<{
    id: number;
    ref_proveedor: string;
    name: string;
    proveedor: string;
    categoryId: string;
    subcategory: string | null;
    grupo: string | null;
  }>(`
    SELECT id, ref_proveedor, name, proveedor, "categoryId", subcategory, grupo
    FROM "Product"
    WHERE "categoryId" = 'textil'
  `);

  let updated = 0;
  const samples: object[] = [];

  for (const row of rows) {
    let mapped: { categoryId: string; subcategory: string | null; grupo: string | null } | null =
      null;

    if (row.proveedor?.toLowerCase() === 'made_for_sport') {
      const byName = classifyMadeForSportProduct(row.name);
      if (byName.categoryId !== 'textil') {
        mapped = byName;
      }
    } else if (row.proveedor?.toLowerCase() === 'jim_sports') {
      mapped = classifyTextilByName(row.name);
      if (
        mapped?.subcategory === 'Ropa Casual' &&
        row.grupo === 'Por deporte - Pádel'
      ) {
        mapped = null;
      }
    }

    if (!mapped) continue;

    const needsFix =
      row.categoryId !== mapped.categoryId ||
      row.subcategory !== mapped.subcategory ||
      (row.grupo ?? null) !== mapped.grupo;

    if (!needsFix) continue;

    if (samples.length < 12) {
      samples.push({
        ref: row.ref_proveedor,
        name: row.name,
        proveedor: row.proveedor,
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

  console.log(dryRun ? 'DRY RUN — Textil' : 'Textil reclasificados:', updated);
  console.log('Ejemplos:', JSON.stringify(samples, null, 2));

  const counts = await pool.query(`
    SELECT subcategory, grupo, COUNT(*)::int AS n
    FROM "Product"
    WHERE "categoryId" = 'textil'
    GROUP BY subcategory, grupo
    ORDER BY subcategory, n DESC
  `);
  console.log('Distribución textil actual:', counts.rows);

  await pool.end();
}

main().catch(console.error);
