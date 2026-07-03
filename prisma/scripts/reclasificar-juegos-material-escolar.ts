/**
 * Mueve productos con "juego" en el nombre fuera de Material Didáctico.
 * npx tsx prisma/scripts/reclasificar-juegos-material-escolar.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  const res = await pool.query(`
    UPDATE "Product"
    SET
      subcategory = CASE
        WHEN name ~* 'infantil|iniciacion|educacion infantil|bebe|0-3|1-2 anos'
          THEN 'Juegos en Educación infantil'
        ELSE 'Juguetes Educativos'
      END,
      "updatedAt" = NOW()
    WHERE "categoryId" = 'material-escolar'
      AND subcategory = 'Material Didáctico'
      AND name ~* 'juego'
    RETURNING proveedor, name, subcategory
  `);

  const psico = await pool.query(`
    UPDATE "Product"
    SET subcategory = 'Juguetes Educativos', "updatedAt" = NOW()
    WHERE "categoryId" = 'material-escolar'
      AND subcategory = 'Psicomotricidad'
      AND name ~* 'juego'
      AND name !~* 'juegos piscina|juego piscina'
    RETURNING name
  `);

  console.log('Material Didáctico → juegos:', res.rowCount);
  console.log('Psicomotricidad → juegos:', psico.rowCount);

  const check = await pool.query(`
    SELECT COUNT(*)::int AS n FROM "Product"
    WHERE "categoryId" = 'material-escolar'
      AND subcategory = 'Material Didáctico'
      AND name ~* 'juego'
  `);
  console.log('Juegos restantes en Material Didáctico:', check.rows[0].n);

  await pool.end();
}

main().catch(console.error);
