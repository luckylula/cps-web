/**
 * Sincroniza precios Jim Sports por lotes (alternativa sólida fuera de n8n).
 *
 * Uso:
 *   npx tsx prisma/scripts/sync-jim-sports-prices.ts
 *   npx tsx prisma/scripts/sync-jim-sports-prices.ts --offset 0 --limit 400
 *   npx tsx prisma/scripts/sync-jim-sports-prices.ts --all
 *
 * Variables de entorno:
 *   DATABASE_URL, JIM_SPORTS_CLIENT_AUTH (opcional, tiene default del workflow)
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const CSV_URL = 'https://jimsports.shop/fichero-b2b/integracion_producto.csv';
const API_BASE = 'https://api.jimsports.com/v1/product/byref';
const CLIENT_AUTH = process.env.JIM_SPORTS_CLIENT_AUTH ?? '13658d28-28f7-493b-bb16-16307fe31398';
const STATE_FILE = join(process.cwd(), '.cache', 'jim-sports-price-offset.json');
const DEFAULT_CHUNK = 400;
const API_DELAY_MS = 1000;

type PriceRow = {
  ref_proveedor: string;
  ref_variante: string | null;
  precioBase: number;
  price: number;
};

function calcularPrecioConMargen(precioBase: number): { precioBase: number; price: number } {
  if (!Number.isFinite(precioBase) || precioBase <= 0) return { precioBase: 0, price: 0 };
  let m = 1.3;
  if (precioBase < 50) m = 1.5;
  else if (precioBase < 100) m = 1.47;
  else if (precioBase < 200) m = 1.43;
  else if (precioBase < 400) m = 1.38;
  const price = Math.round(precioBase * m * 1.21 * 100) / 100;
  return { precioBase: Math.round(precioBase * 100) / 100, price };
}

async function fetchCsvRefs(): Promise<string[]> {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`CSV HTTP ${res.status}`);
  const text = await res.text();
  const refs = new Set<string>();
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const ref = line.split(';')[0]?.replace(/"/g, '').trim();
    if (ref) refs.add(ref);
  }
  return Array.from(refs).sort();
}

async function fetchApiProduct(ref: string): Promise<{ reference?: string; price?: number; variants?: { reference?: string; price?: number }[] } | null> {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(ref)}`, {
    headers: { Accept: 'application/json', ClientAuth: CLIENT_AUTH },
  });
  if (!res.ok) return null;
  return res.json();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  let offset = 0;
  let limit = DEFAULT_CHUNK;
  let all = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--offset') offset = parseInt(args[++i], 10) || 0;
    else if (args[i] === '--limit') limit = parseInt(args[++i], 10) || DEFAULT_CHUNK;
    else if (args[i] === '--all') all = true;
  }
  return { offset, limit, all };
}

function loadState(): number {
  try {
    const raw = readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(raw).offset ?? 0;
  } catch {
    return 0;
  }
}

function saveState(offset: number, total: number) {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify({ offset, total, updatedAt: new Date().toISOString() }, null, 2));
}

async function applyPrices(pool: Pool, rows: PriceRow[]) {
  for (const row of rows) {
    if (row.ref_variante) {
      await pool.query(
        `UPDATE "ProductVariant" SET price = $1, "updatedAt" = NOW()
         WHERE proveedor = 'jim_sports' AND ref_proveedor = $2 AND COALESCE(ref_variante, '') = $3`,
        [row.price, row.ref_proveedor, row.ref_variante]
      );
    } else {
      await pool.query(
        `UPDATE "Product" SET price = $1, "precioBase" = $2, "updatedAt" = NOW()
         WHERE proveedor = 'jim_sports' AND ref_proveedor = $3`,
        [row.price, row.precioBase, row.ref_proveedor]
      );
      await pool.query(
        `UPDATE "ProductVariant" SET price = $1, "updatedAt" = NOW()
         WHERE proveedor = 'jim_sports' AND ref_proveedor = $2 AND ref_variante IS NULL`,
        [row.price, row.ref_proveedor]
      );
    }
  }
}

async function main() {
  const { offset: argOffset, limit, all } = parseArgs();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const refs = await fetchCsvRefs();
  const start = all ? 0 : (argOffset || loadState());
  const end = all ? refs.length : Math.min(start + limit, refs.length);
  const chunk = refs.slice(start, end);

  console.log(`Jim Sports prices: refs ${start}..${end - 1} de ${refs.length} (${chunk.length} en este lote)`);

  const priceRows: PriceRow[] = [];
  let apiOk = 0;
  let apiFail = 0;
  let written = 0;
  const FLUSH_EVERY = 25;

  for (const ref of chunk) {
    const data = await fetchApiProduct(ref);
    await sleep(API_DELAY_MS);
    if (!data?.reference) {
      apiFail++;
      continue;
    }
    apiOk++;
    const batch: PriceRow[] = [];
    const base = calcularPrecioConMargen(Number(data.price) || 0);
    if (base.price > 0) {
      batch.push({ ref_proveedor: data.reference, ref_variante: null, ...base });
    }
    for (const v of data.variants ?? []) {
      const vb = calcularPrecioConMargen(Number(v.price) || 0);
      if (vb.price > 0 && v.reference) {
        batch.push({
          ref_proveedor: data.reference,
          ref_variante: v.reference,
          precioBase: vb.precioBase,
          price: vb.price,
        });
      }
    }
    if (batch.length > 0) {
      priceRows.push(...batch);
      if (priceRows.length >= FLUSH_EVERY) {
        await applyPrices(pool, priceRows);
        written += priceRows.length;
        priceRows.length = 0;
        if (written % 100 === 0) {
          console.log(`Progreso: ${apiOk} API ok, ${written} precios escritos...`);
        }
      }
    }
  }

  if (priceRows.length > 0) {
    await applyPrices(pool, priceRows);
    written += priceRows.length;
  }

  const nextOffset = end >= refs.length ? 0 : end;
  if (!all) saveState(nextOffset, refs.length);

  console.log({ apiOk, apiFail, priceRows: written, nextOffset, cycleComplete: end >= refs.length });
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
