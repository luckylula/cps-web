import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  const sql = readFileSync(join(process.cwd(), 'prisma/scripts/add-product-unique-proveedor-ref.sql'), 'utf8');
  await pool.query(sql);
  const r = await pool.query(`
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = '"Product"'::regclass AND contype = 'u'
    ORDER BY conname
  `);
  console.log('Unique constraints after migration:');
  console.table(r.rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
