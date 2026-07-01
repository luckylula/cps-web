import 'dotenv/config';
import { Pool } from 'pg';

const p = new Pool({ connectionString: process.env.DATABASE_URL });

const a = await p.query(
  `SELECT ref_proveedor, name, price::text, "precioBase"::text, "updatedAt"
   FROM "Product" WHERE ref_proveedor = '0012964'`
);
const r = await p.query(
  `SELECT COUNT(*)::int n, MAX("updatedAt") u
   FROM "Product"
   WHERE LOWER(proveedor) = 'jim_sports'
     AND "updatedAt" > NOW() - INTERVAL '30 minutes'`
);
const s = await p.query(
  `SELECT ref_proveedor, price::float, "precioBase"::float, "updatedAt"
   FROM "Product"
   WHERE LOWER(proveedor) = 'jim_sports'
     AND "updatedAt" > NOW() - INTERVAL '30 minutes'
   ORDER BY "updatedAt" DESC LIMIT 10`
);

const prov = await p.query(
  `SELECT proveedor, COUNT(*)::int c FROM "Product" WHERE ref_proveedor = '0012964' GROUP BY proveedor`
);
const allRefs = await p.query(
  `SELECT ref_proveedor FROM "Product" WHERE LOWER(proveedor) = 'jim_sports' ORDER BY ref_proveedor`
);
const idx = allRefs.rows.findIndex((x) => x.ref_proveedor === '0012964');

console.log('0012964:', a.rows[0]);
console.log('proveedor en BD:', prov.rows);
console.log('posicion 0012964 en lista ordenada:', idx, 'de', allRefs.rows.length);
console.log('recientes 30m:', r.rows[0]);
console.log('muestra:', s.rows);
await p.end();
