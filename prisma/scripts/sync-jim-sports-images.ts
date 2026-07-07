/**
 * Sincroniza imágenes Jim Sports desde el CSV oficial hacia Product y ProductVariant.
 *
 * Uso:
 *   npx tsx prisma/scripts/sync-jim-sports-images.ts --dry-run
 *   npx tsx prisma/scripts/sync-jim-sports-images.ts
 *   npx tsx prisma/scripts/sync-jim-sports-images.ts --ref 24220
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import {
  buildProductGalleryImages,
  imagesArraysEqual,
  isValidJimSportsImageUrl,
  propagateVariantImages,
} from '../../app/lib/jimSportsImageUtils';

const CSV_URL = 'https://jimsports.shop/fichero-b2b/integracion_producto.csv';
const LOCAL_CSV = join(process.cwd(), 'integracion_producto.csv');

type CsvVariant = {
  ref_proveedor: string;
  ref_variante: string | null;
  sku_interno: string;
  color: string | null;
  talla: string | null;
  imagen: string | null;
};

type ProductGroup = {
  ref_proveedor: string;
  variants: CsvVariant[];
};

function fixEncoding(str: string): string {
  if (!str) return str;
  const map: Record<string, string> = {
    '\xc3\xb3': 'ó', '\xc3\xa1': 'á', '\xc3\xa9': 'é', '\xc3\xad': 'í', '\xc3\xba': 'ú', '\xc3\xb1': 'ñ',
    '\xc3\x81': 'Á', '\xc3\x89': 'É', '\xc3\x8d': 'Í', '\xc3\x93': 'Ó', '\xc3\x9a': 'Ú', '\xc3\x91': 'Ñ',
  };
  let fixed = str;
  for (const [bad, good] of Object.entries(map)) {
    fixed = fixed.split(bad).join(good);
  }
  return fixed;
}

async function loadCsvText(): Promise<string> {
  try {
    const res = await fetch(CSV_URL);
    if (res.ok) return res.text();
  } catch {
    // fallback local
  }
  return readFileSync(LOCAL_CSV, 'utf-8');
}

function parseCsvGroups(csvText: string, onlyRef?: string): Map<string, ProductGroup> {
  const groups = new Map<string, ProductGroup>();

  for (const line of csvText.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const clean = line.split(';').map((f) => f.replace(/"/g, '').trim());
    const refPatron = clean[0] || null;
    const refVariante = clean[1] || null;
    const imagen = clean[6] || null;
    const color = fixEncoding(clean[9] || '') || null;
    const talla = fixEncoding(clean[10] || '') || null;
    if (!refPatron || !refVariante) continue;
    if (onlyRef && refPatron !== onlyRef) continue;

    if (!groups.has(refPatron)) {
      groups.set(refPatron, { ref_proveedor: refPatron, variants: [] });
    }

    const variantSku = `J${refPatron}-${refVariante}`;
    groups.get(refPatron)!.variants.push({
      ref_proveedor: refPatron,
      ref_variante: refVariante,
      sku_interno: variantSku,
      color,
      talla,
      imagen: isValidJimSportsImageUrl(imagen) ? imagen : null,
    });
  }

  for (const group of groups.values()) {
    propagateVariantImages(group.variants);
  }

  return groups;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dryRun = false;
  let ref: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--ref') ref = args[++i];
  }
  return { dryRun, ref };
}

async function main() {
  const { dryRun, ref } = parseArgs();
  const csvText = await loadCsvText();
  const groups = parseCsvGroups(csvText, ref);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  let variantsChecked = 0;
  let variantsUpdated = 0;
  let productsChecked = 0;
  let productsUpdated = 0;

  for (const group of groups.values()) {
    const gallery = buildProductGalleryImages(group.variants);
    if (gallery.length === 0) continue;

    for (const variant of group.variants) {
      if (!isValidJimSportsImageUrl(variant.imagen)) continue;
      variantsChecked++;

      const { rows } = await pool.query<{ images: string[] }>(
        `SELECT images FROM "ProductVariant" WHERE sku_interno = $1 AND proveedor = 'jim_sports'`,
        [variant.sku_interno]
      );
      if (rows.length === 0) continue;

      const current = rows[0].images ?? [];
      const next = [variant.imagen];
      if (imagesArraysEqual(current, next)) continue;

      variantsUpdated++;
      if (!dryRun) {
        await pool.query(
          `UPDATE "ProductVariant" SET images = $1::text[], "updatedAt" = NOW() WHERE sku_interno = $2`,
          [next, variant.sku_interno]
        );
      }
    }

    const { rows: productRows } = await pool.query<{ id: number; images: string[] }>(
      `SELECT id, images FROM "Product" WHERE proveedor = 'jim_sports' AND ref_proveedor = $1`,
      [group.ref_proveedor]
    );
    if (productRows.length === 0) continue;

    productsChecked++;
    const currentGallery = productRows[0].images ?? [];
    if (imagesArraysEqual(currentGallery, gallery)) continue;

    productsUpdated++;
    if (!dryRun) {
      await pool.query(
        `UPDATE "Product" SET images = $1::text[], "updatedAt" = NOW() WHERE id = $2`,
        [gallery, productRows[0].id]
      );
    }
  }

  console.log({
    dryRun,
    refFilter: ref ?? null,
    productGroups: groups.size,
    variantsChecked,
    variantsUpdated,
    productsChecked,
    productsUpdated,
  });

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
