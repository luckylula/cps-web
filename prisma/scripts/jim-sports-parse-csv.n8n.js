// Parte ejecutable del nodo n8n "Parse CSV + Fix Encoding".
// Se concatena después de jim-sports-taxonomy.n8n.js (ver build-jim-sports-n8n-catalog.cjs).

const csvText = items[0].json.data ?? items[0].json.body ?? items[0].json;
const lines = String(csvText).split(/\r?\n/);

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fixEncoding(str) {
  if (!str) return str;
  let fixed = str;
  fixed = fixed.replace(/\xc3\xb3/g, 'ó');
  fixed = fixed.replace(/\xc3\xa1/g, 'á');
  fixed = fixed.replace(/\xc3\xa9/g, 'é');
  fixed = fixed.replace(/\xc3\xad/g, 'í');
  fixed = fixed.replace(/\xc3\xba/g, 'ú');
  fixed = fixed.replace(/\xc3\xb1/g, 'ñ');
  fixed = fixed.replace(/\xc3\x81/g, 'Á');
  fixed = fixed.replace(/\xc3\x89/g, 'É');
  fixed = fixed.replace(/\xc3\x8d/g, 'Í');
  fixed = fixed.replace(/\xc3\x93/g, 'Ó');
  fixed = fixed.replace(/\xc3\x9a/g, 'Ú');
  fixed = fixed.replace(/\xc3\x91/g, 'Ñ');
  fixed = fixed.replace(/\xc3\xbc/g, 'ü');
  fixed = fixed.replace(/\xc3\x9c/g, 'Ü');
  fixed = fixed.replace(/\xc3\xa7/g, 'ç');
  fixed = fixed.replace(/\xc3\x87/g, 'Ç');
  fixed = fixed.replace(/\xc3\xa0/g, 'à');
  fixed = fixed.replace(/\xc3\x80/g, 'À');
  fixed = fixed.replace(/\xc3\xa8/g, 'è');
  fixed = fixed.replace(/\xc3\x88/g, 'È');
  fixed = fixed.replace(/\xc3\xac/g, 'ì');
  fixed = fixed.replace(/\xc3\x8c/g, 'Ì');
  fixed = fixed.replace(/\xc3\xb2/g, 'ò');
  fixed = fixed.replace(/\xc3\x92/g, 'Ò');
  fixed = fixed.replace(/\xc3\xb9/g, 'ù');
  fixed = fixed.replace(/\xc3\x99/g, 'Ù');
  return fixed;
}

function resolveCategoryId(categoriaPadre, categoriaTexto) {
  if (
    categoriaTexto === 'Textil' ||
    ['Calzado', 'Bañadores'].includes(categoriaTexto) ||
    ['Casual', 'Equipaciones'].includes(categoriaPadre)
  ) {
    return 'textil';
  }
  if (
    categoriaPadre === 'Equipamiento' ||
    [
      'Redes',
      'Vestuarios',
      'Equipamiento agua',
      'Colchonetas',
      'Baloncesto',
      'Fútbol 11 y 7',
      'Fútbol sala - Balonmano',
      'Voleibol',
      'Banquillos',
      'Gimnasia',
      'Tenis',
      'Protecciones columnas',
      'Otros deportes',
      'Pádel',
    ].includes(categoriaTexto)
  ) {
    return 'instalaciones';
  }
  if (['Psicomotricidad', 'Juegos'].includes(categoriaPadre)) {
    return 'material-escolar';
  }
  return 'deportes';
}

const groups = new Map();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const fields = line.split(';');
  const clean = fields.map((f) => f.replace(/"/g, '').trim());
  const refPatron = clean[0] || null;
  const refVariante = clean[1] || null;
  const ean = clean[2] || null;
  const stock = parseInt(clean[3], 10) || 0;
  const name = fixEncoding(clean[4] || '');
  const marca = fixEncoding(clean[5] || null);
  const imagen = clean[6] || null;
  const categoriaTexto = fixEncoding(clean[7] || null);
  const categoriaPadre = fixEncoding(clean[8] || null);
  const color = fixEncoding(clean[9] || null);
  const talla = fixEncoding(clean[10] || null);
  if (!refPatron || !name || name.trim() === '') continue;

  if (!groups.has(refPatron)) {
    const rawCategoryId = resolveCategoryId(categoriaPadre || '', categoriaTexto || '');
    const rawSub = `${categoriaPadre || ''} > ${categoriaTexto || ''}`;
    const mapped = resolveJimSportsTaxonomy(
      categoriaPadre,
      categoriaTexto,
      rawSub,
      rawCategoryId,
      name
    ) || {
      categoryId: rawCategoryId,
      subcategory: rawSub,
      grupo: null,
    };
    const skuPadre = `J${refPatron}`;
    const slug = `${slugify(name)}-${slugify(skuPadre)}`;
    groups.set(refPatron, {
      product: {
        proveedor: 'jim_sports',
        ref_proveedor: refPatron,
        sku_interno: skuPadre,
        name,
        marca,
        imagen,
        categoryId: mapped.categoryId,
        subcategory: mapped.subcategory,
        grupo: mapped.grupo,
        categoria_padre: categoriaPadre || null,
        categoria_texto: categoriaTexto || null,
        slug,
        published: true,
        activo: true,
        visible_web: true,
      },
      variants: [],
    });
  }

  const variantSku = refVariante ? `J${refPatron}-${refVariante}` : `J${refPatron}-BASE`;
  groups.get(refPatron).variants.push({
    proveedor: 'jim_sports',
    ref_proveedor: refPatron,
    ref_variante: refVariante,
    sku_interno: variantSku,
    ean,
    stock,
    color,
    talla,
    imagen,
  });
}

const out = [];
for (const g of groups.values()) {
  out.push({ json: { type: 'product', ...g.product } });
  for (const v of g.variants) {
    out.push({ json: { type: 'variant', ...v } });
  }
}
return out;
