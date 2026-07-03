import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const { rows } = await pool.query(`
    SELECT name, subcategory, "categoryId", visible_web, published, activo, ref_proveedor, proveedor
    FROM "Product"
    WHERE subcategory = 'Juguetes Educativos'
      AND (
        name ~* 'muñec|munec|doll|baby|beb[eé]|biber|chupet|puericultura|soft body'
        OR name ~* 'babys|babies'
      )
    ORDER BY proveedor, name
  `);
  console.log(`Coincidencias en Juguetes Educativos: ${rows.length}`);
  console.table(rows);

  const { rows: allDolls } = await pool.query(`
    SELECT subcategory, "categoryId", visible_web, COUNT(*)::int AS n
    FROM "Product"
    WHERE name ~* 'muñec|munec|doll|baby doll|soft body doll|beb[eé] reborn'
       OR name ~* '\\ybaby\\y'
    GROUP BY 1,2,3
    ORDER BY n DESC
  `);
  console.log('\nResumen muñecas/baby por subcategoría:');
  console.table(allDolls);

  await pool.end();
}

main().catch(console.error);
