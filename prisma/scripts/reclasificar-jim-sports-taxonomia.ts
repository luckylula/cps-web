/**
 * Reclasifica productos Jim Sports a la taxonomía web (categoryId, subcategory, grupo).
 *
 * Uso:
 *   npx tsx prisma/scripts/reclasificar-jim-sports-taxonomia.ts
 *   npx tsx prisma/scripts/reclasificar-jim-sports-taxonomia.ts --dry-run
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { resolveJimSportsTaxonomy } from '../../app/lib/jimSportsTaxonomy';

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const { rows } = await pool.query<{
    id: number;
    ref_proveedor: string;
    categoria_padre: string | null;
    categoria_texto: string | null;
    categoryId: string;
    subcategory: string | null;
    grupo: string | null;
  }>(`
    SELECT id, ref_proveedor, categoria_padre, categoria_texto, "categoryId", subcategory, grupo
    FROM "Product"
    WHERE LOWER(proveedor) = 'jim_sports'
  `);

  let updated = 0;
  let skipped = 0;
  const samples: object[] = [];

  for (const row of rows) {
    const mapped = resolveJimSportsTaxonomy(
      row.categoria_padre,
      row.categoria_texto,
      row.subcategory,
      row.categoryId
    );
    if (!mapped) {
      skipped++;
      continue;
    }

    const changed =
      row.categoryId !== mapped.categoryId ||
      row.subcategory !== mapped.subcategory ||
      (row.grupo ?? null) !== mapped.grupo;

    if (!changed) continue;

    if (samples.length < 8) {
      samples.push({
        ref: row.ref_proveedor,
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

  const check = await pool.query(`
    SELECT
      COUNT(*) FILTER (
        WHERE "categoryId" = 'instalaciones'
          AND subcategory = 'Estructuras deportivas'
          AND grupo = 'Baloncesto'
      )::int AS baloncesto_estructuras,
      COUNT(*) FILTER (
        WHERE "categoryId" = 'deportes' AND subcategory = 'Colectivos'
      )::int AS deportes_colectivos,
      COUNT(*) FILTER (
        WHERE "categoryId" = 'textil' AND subcategory = 'Ropa Casual'
      )::int AS textil_casual
    FROM "Product"
    WHERE LOWER(proveedor) = 'jim_sports'
      AND published AND visible_web AND activo
  `);

  console.log({
    dryRun,
    total: rows.length,
    actualizados: updated,
    sin_mapeo: skipped,
  });
  console.log('Muestra cambios:', samples);
  console.log('Tras reclasificación:', check.rows[0]);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
