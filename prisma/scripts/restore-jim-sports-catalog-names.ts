/**
 * Restaura nombres, marca, imágenes y subcategoría Jim Sports desde el CSV oficial.
 * Uso: npx tsx prisma/scripts/restore-jim-sports-catalog-names.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { resolveJimSportsTaxonomy } from '../../app/lib/jimSportsTaxonomy';

const CSV_URL = 'https://jimsports.shop/fichero-b2b/integracion_producto.csv';

function fixEncoding(str: string | null): string | null {
  if (!str) return str;
  const map: Record<string, string> = {
    '\xc3\xb3': 'ó', '\xc3\xa1': 'á', '\xc3\xa9': 'é', '\xc3\xad': 'í', '\xc3\xba': 'ú', '\xc3\xb1': 'ñ',
  };
  let fixed = str;
  for (const [bad, good] of Object.entries(map)) fixed = fixed.split(bad).join(good);
  return fixed;
}

function slugify(str: string) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`CSV HTTP ${res.status}`);
  const text = await res.text();

  const products = new Map<
    string,
    {
      name: string;
      marca: string | null;
      imagen: string | null;
      categoria_padre: string;
      categoria_texto: string;
      categoryId: string;
      subcategory: string;
      grupo: string | null;
    }
  >();

  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const clean = line.split(';').map((f) => f.replace(/"/g, '').trim());
    const refPatron = clean[0];
    const name = fixEncoding(clean[4] || '');
    const marca = fixEncoding(clean[5] || null);
    const imagen = clean[6] || null;
    const categoriaTexto = fixEncoding(clean[7] || '');
    const categoriaPadre = fixEncoding(clean[8] || '');
    if (!refPatron || !name?.trim()) continue;
    if (!products.has(refPatron)) {
      const rawSub = `${categoriaPadre || ''} > ${categoriaTexto || ''}`;
      const categoryId =
        categoriaTexto === 'Textil' ||
        ['Calzado', 'Bañadores'].includes(categoriaTexto || '') ||
        ['Casual', 'Equipaciones'].includes(categoriaPadre || '')
          ? 'textil'
          : categoriaPadre === 'Equipamiento' ||
              [
                'Redes', 'Vestuarios', 'Equipamiento agua', 'Colchonetas', 'Baloncesto',
                'Fútbol 11 y 7', 'Fútbol sala - Balonmano', 'Voleibol', 'Banquillos', 'Gimnasia',
                'Tenis', 'Protecciones columnas', 'Otros deportes', 'Pádel',
              ].includes(categoriaTexto || '')
            ? 'instalaciones'
            : ['Psicomotricidad', 'Juegos'].includes(categoriaPadre || '')
              ? 'material-escolar'
              : 'deportes';
      const mapped =
        resolveJimSportsTaxonomy(categoriaPadre, categoriaTexto, rawSub, categoryId, name.trim()) ?? {
          categoryId,
          subcategory: rawSub,
          grupo: null,
        };
      products.set(refPatron, {
        name: name.trim(),
        marca,
        imagen,
        categoria_padre: categoriaPadre || '',
        categoria_texto: categoriaTexto || '',
        categoryId: mapped.categoryId,
        subcategory: mapped.subcategory,
        grupo: mapped.grupo,
      });
    }
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  const emptyBefore = await pool.query(`
    SELECT COUNT(*)::int AS n FROM "Product"
    WHERE LOWER(proveedor) = 'jim_sports' AND (name IS NULL OR TRIM(name) = '')
  `);
  console.log('Productos sin nombre antes:', emptyBefore.rows[0].n);

  let updated = 0;
  for (const [ref, data] of products) {
    const slug = `${slugify(data.name)}-${slugify(`J${ref}`)}`;
    const images = data.imagen ? [data.imagen] : [];
    const r = await pool.query(
      `UPDATE "Product" SET
        name = $1,
        marca = $2,
        images = $3::text[],
        "categoryId" = $4,
        subcategory = $5,
        grupo = $6,
        categoria_padre = $7,
        categoria_texto = $8,
        slug = CASE WHEN slug IS NULL OR TRIM(slug) = '' THEN $9 ELSE slug END,
        "updatedAt" = NOW()
      WHERE proveedor = 'jim_sports' AND ref_proveedor = $10`,
      [
        data.name,
        data.marca,
        images,
        data.categoryId,
        data.subcategory,
        data.grupo,
        data.categoria_padre || null,
        data.categoria_texto || null,
        slug,
        ref,
      ]
    );
    updated += r.rowCount ?? 0;
  }

  const emptyAfter = await pool.query(`
    SELECT COUNT(*)::int AS n FROM "Product"
    WHERE LOWER(proveedor) = 'jim_sports' AND (name IS NULL OR TRIM(name) = '')
  `);

  const aro = await pool.query(
    `SELECT ref_proveedor, name, price FROM "Product" WHERE ref_proveedor = '0012964'`
  );

  console.log({ filas_csv: products.size, productos_actualizados: updated });
  console.log('Productos sin nombre después:', emptyAfter.rows[0].n);
  console.log('0012964:', aro.rows[0]);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
