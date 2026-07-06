// Parte ejecutable del nodo n8n "Parse CSV Manual".
// Se concatena después de made-for-sport-taxonomy.n8n.js (ver build-made-for-sport-n8n.cjs).

const csvText = items[0].json.data ?? items[0].json.body ?? items[0].json;
const lines = String(csvText).split(/\r?\n/);
const products = [];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const fields = line.split(';');
  const cleanFields = fields.map((field) => field.replace(/"/g, '').trim());

  const name = cleanFields[0] || '';
  const price = parseFloat(cleanFields[1]) || 0;
  const refProveedor = cleanFields[2] || null;
  const ean = cleanFields[3] || null;
  const stock = parseInt(cleanFields[4], 10) || 0;
  const description = cleanFields[5] || '';
  const imagenesStr = cleanFields[6] || '';

  const imagenes = imagenesStr
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  const skuInterno = `MF${refProveedor}`;
  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${slugify(skuInterno)}`;

  const taxonomy = classifyMadeForSportProduct(name, description);

  products.push({
    json: {
      proveedor: 'made_for_sport',
      ref_proveedor: refProveedor,
      ref_variante: null,
      ean,
      stock,
      name,
      description,
      price,
      imagenes,
      slug,
      sku_interno: skuInterno,
      categoryId: taxonomy.categoryId,
      subcategory: taxonomy.subcategory,
      grupo: taxonomy.grupo,
      marca: null,
      categoria: null,
      categoria_padre: null,
      color: null,
      talla: null,
      published: true,
      activo: true,
      visible_web: true,
    },
  });
}

return products;
