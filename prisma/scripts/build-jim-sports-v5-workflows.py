#!/usr/bin/env python3
"""Genera Jim Sports v5: catálogo (rápido) + precios (por lotes con reanudación)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "files claude"

POSTGRES_CRED = {"postgres": {"id": "wum06K40sV6oLIqF", "name": "Postgres account"}}

TAXONOMY_JS = (ROOT / "prisma" / "scripts" / "jim-sports-taxonomy.n8n.js").read_text(encoding="utf-8")

PARSE_CSV_JS = TAXONOMY_JS + r"""
const csvText = items[0].json.data ?? items[0].json.body ?? items[0].json;
const lines = String(csvText).split(/\r?\n/);

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fixEncoding(str) {
  if (!str) return str;
  const map = {
    "\xc3\xb3": "ó", "\xc3\xa1": "á", "\xc3\xa9": "é", "\xc3\xad": "í", "\xc3\xba": "ú", "\xc3\xb1": "ñ",
    "\xc3\x81": "Á", "\xc3\x89": "É", "\xc3\x8d": "Í", "\xc3\x93": "Ó", "\xc3\x9a": "Ú", "\xc3\x91": "Ñ",
    "\xc3\xbc": "ü", "\xc3\x9c": "Ü", "\xc3\xa7": "ç", "\xc3\x87": "Ç",
  };
  let fixed = str;
  for (const [bad, good] of Object.entries(map)) fixed = fixed.split(bad).join(good);
  return fixed;
}

function resolveCategoryId(categoriaPadre, categoriaTexto) {
  if (categoriaTexto === "Textil" || ["Calzado","Bañadores"].includes(categoriaTexto) || ["Casual","Equipaciones"].includes(categoriaPadre)) return "textil";
  if (categoriaPadre === "Equipamiento" || ["Redes","Vestuarios","Equipamiento agua","Colchonetas","Baloncesto","Fútbol 11 y 7","Fútbol sala - Balonmano","Voleibol","Banquillos","Gimnasia","Tenis","Protecciones columnas","Otros deportes","Pádel"].includes(categoriaTexto)) return "instalaciones";
  if (["Psicomotricidad","Juegos"].includes(categoriaPadre)) return "material-escolar";
  return "deportes";
}

const groups = new Map();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const fields = line.split(";");
  const clean = fields.map(f => f.replace(/"/g, "").trim());
  const refPatron = clean[0] || null;
  const refVariante = clean[1] || null;
  const ean = clean[2] || null;
  const stock = parseInt(clean[3], 10) || 0;
  const name = fixEncoding(clean[4] || "");
  const marca = fixEncoding(clean[5] || null);
  const imagen = clean[6] || null;
  const categoriaTexto = fixEncoding(clean[7] || null);
  const categoriaPadre = fixEncoding(clean[8] || null);
  const color = fixEncoding(clean[9] || null);
  const talla = fixEncoding(clean[10] || null);
  if (!refPatron || !name || name.trim() === "") continue;
  if (!groups.has(refPatron)) {
    const rawCategoryId = resolveCategoryId(categoriaPadre || "", categoriaTexto || "");
    const rawSub = `${categoriaPadre || ""} > ${categoriaTexto || ""}`;
    const mapped = resolveJimSportsTaxonomy(categoriaPadre, categoriaTexto, rawSub, rawCategoryId) || {
      categoryId: rawCategoryId,
      subcategory: rawSub,
      grupo: null,
    };
    const skuPadre = `J${refPatron}`;
    const slug = `${slugify(name)}-${slugify(skuPadre)}`;
    groups.set(refPatron, {
      product: {
        proveedor: "jim_sports",
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
  groups.get(refPatron).variants.push({ proveedor: "jim_sports", ref_proveedor: refPatron, ref_variante: refVariante, sku_interno: variantSku, ean, stock, color, talla, imagen });
}

const out = [];
for (const g of groups.values()) {
  out.push({ json: { type: "product", ...g.product } });
  for (const v of g.variants) out.push({ json: { type: "variant", ...v } });
}
return out;"""

EXTRACT_PRICES_JS = r"""function calcularPrecioConMargen(precioBase) {
  const precio = parseFloat(precioBase);
  if (isNaN(precio) || precio <= 0) return { precioBase: 0, precioFinal: 0 };
  let multiplicador;
  if (precio < 50) multiplicador = 1.50;
  else if (precio < 100) multiplicador = 1.47;
  else if (precio < 200) multiplicador = 1.43;
  else if (precio < 400) multiplicador = 1.38;
  else multiplicador = 1.30;
  const precioConMargen = precio * multiplicador;
  return { precioBase: parseFloat(precio.toFixed(2)), precioFinal: parseFloat((precioConMargen * 1.21).toFixed(2)) };
}

const results = [];
for (const item of items) {
  if (!item.json.reference) continue;
  const refPatron = item.json.reference;
  const productPrice = calcularPrecioConMargen(item.json.price || 0);
  if (productPrice.precioFinal > 0) {
    results.push({ json: { type: "price", ref_proveedor: refPatron, ref_variante: "", precioBase: productPrice.precioBase, price: productPrice.precioFinal } });
  }
  if (item.json.variants && Array.isArray(item.json.variants)) {
    for (const variant of item.json.variants) {
      const variantPrice = calcularPrecioConMargen(variant.price || 0);
      if (variantPrice.precioFinal > 0) {
        results.push({ json: { type: "price", ref_proveedor: refPatron, ref_variante: variant.reference || null, precioBase: variantPrice.precioBase, price: variantPrice.precioFinal } });
      }
    }
  }
}

const staticData = $getWorkflowStaticData('global');
if (!Array.isArray(staticData.pendingPrices)) staticData.pendingPrices = [];
for (const r of results) staticData.pendingPrices.push(r.json);

// Un solo item de vuelta al bucle (evita que variantes cuenten como iteraciones extra)
return [{ json: { _continue: true, pricesAdded: results.length, pendingTotal: staticData.pendingPrices.length } }];"""

PICK_CHUNK_JS = r"""const CHUNK_SIZE = 400;

const csvText = $('Download CSV').first().json.data ?? $('Download CSV').first().json.body ?? $('Download CSV').first().json;
const lines = String(csvText).split(/\r?\n/);
const refs = new Set();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const ref = line.split(';')[0]?.replace(/"/g, '').trim();
  if (ref) refs.add(ref);
}

const allRefs = Array.from(refs).sort();
const staticData = $getWorkflowStaticData('global');
if (typeof staticData.offset !== 'number') staticData.offset = 0;
staticData.pendingPrices = [];

const start = staticData.offset;
const end = Math.min(start + CHUNK_SIZE, allRefs.length);
const chunk = allRefs.slice(start, end);
staticData.offset = end >= allRefs.length ? 0 : end;
staticData.totalRefs = allRefs.length;
staticData.chunkFrom = start;
staticData.chunkTo = end;
staticData.cycleComplete = end >= allRefs.length;

return chunk.map(ref => ({
  json: {
    ref_proveedor: ref,
    _chunk: { start, end, total: allRefs.length, nextOffset: staticData.offset, cycleComplete: staticData.cycleComplete },
  },
}));"""

COLLECT_PRICES_JS = r"""const staticData = $getWorkflowStaticData('global');
const prices = Array.isArray(staticData.pendingPrices) ? staticData.pendingPrices : [];
staticData.pendingPrices = [];
return prices
  .filter(p => p && p.price > 0 && p.ref_proveedor)
  .map(p => ({ json: p }));"""

# Catálogo v5.2: taxonomía web (categoryId/subcategory/grupo). No toca price/precioBase en UPDATE.
UPSERT_PRODUCT_CATALOG = (
    'INSERT INTO "Product" (name,slug,description,price,"precioBase",images,stock,"categoryId",subcategory,grupo,published,featured,'
    '"createdAt","updatedAt",proveedor,ref_proveedor,ref_variante,ean,marca,categoria_texto,categoria_padre,color,talla,activo,visible_web,sku_interno) '
    "VALUES ('{{ ($json.name ?? \"\").replace(/'/g, \"''\") }}','{{ ((($json.slug ?? \"\").trim() !== \"\" ? $json.slug : ($json.sku_interno ?? \"producto\"))).replace(/'/g, \"''\") }}','',0,0,"
    "{{ $json.imagen ? \"ARRAY['\" + $json.imagen.replace(/'/g, \"''\") + \"']::text[]\" : \"ARRAY[]::text[]\" }},0,"
    "'{{ $json.categoryId ?? \"deportes\" }}','{{ ($json.subcategory ?? \"\").replace(/'/g, \"''\") }}',"
    "{{ $json.grupo ? \"'\" + $json.grupo.replace(/'/g, \"''\") + \"'\" : \"NULL\" }},"
    "{{ $json.published === false ? 'false' : 'true' }},false,NOW(),NOW(),"
    "'{{ $json.proveedor ?? \"jim_sports\" }}','{{ $json.ref_proveedor ?? \"\" }}',NULL,NULL,"
    "{{ $json.marca ? \"'\" + $json.marca.replace(/'/g, \"''\") + \"'\" : \"NULL\" }},"
    "{{ $json.categoria_texto ? \"'\" + $json.categoria_texto.replace(/'/g, \"''\") + \"'\" : \"NULL\" }},"
    "{{ $json.categoria_padre ? \"'\" + $json.categoria_padre.replace(/'/g, \"''\") + \"'\" : \"NULL\" }},"
    "NULL,NULL,"
    "{{ $json.activo === false ? 'false' : 'true' }},{{ $json.visible_web === false ? 'false' : 'true' }},"
    "'{{ ($json.sku_interno ?? \"\").replace(/'/g, \"''\") }}') "
    "ON CONFLICT (proveedor, ref_proveedor) DO UPDATE SET "
    "name=CASE WHEN TRIM(EXCLUDED.name)<>'' THEN EXCLUDED.name ELSE \"Product\".name END,"
    "images=CASE WHEN array_length(EXCLUDED.images,1)>0 THEN EXCLUDED.images ELSE \"Product\".images END,"
    "marca=CASE WHEN EXCLUDED.marca IS NOT NULL AND TRIM(EXCLUDED.marca::text)<>'' THEN EXCLUDED.marca ELSE \"Product\".marca END,"
    "published=EXCLUDED.published,"
    "featured=EXCLUDED.featured,activo=EXCLUDED.activo,visible_web=EXCLUDED.visible_web,stock=0,"
    '"categoryId"=EXCLUDED."categoryId",'
    "subcategory=EXCLUDED.subcategory,"
    "grupo=EXCLUDED.grupo,"
    "categoria_padre=EXCLUDED.categoria_padre,"
    "categoria_texto=EXCLUDED.categoria_texto,"
    'slug="Product".slug,sku_interno=COALESCE("Product".sku_interno, EXCLUDED.sku_interno),'
    "proveedor=EXCLUDED.proveedor,ref_proveedor=EXCLUDED.ref_proveedor,\"updatedAt\"=NOW() RETURNING id;"
)

UPSERT_VARIANT_CATALOG = (
    'INSERT INTO "ProductVariant" ("productId",proveedor,ref_proveedor,ref_variante,sku_interno,ean,color,talla,stock,price,images,activo,visible_web,"createdAt","updatedAt") '
    "SELECT DISTINCT ON (v.sku_interno) p.id,v.proveedor,v.ref_proveedor,v.ref_variante,v.sku_interno,v.ean,v.color,v.talla,v.stock,NULL,v.images,v.activo,v.visible_web,NOW(),NOW() "
    "FROM (SELECT '{{ $json.proveedor ?? \"jim_sports\" }}'::text AS proveedor,'{{ $json.ref_proveedor ?? \"\" }}'::text AS ref_proveedor,"
    "{{ $json.ref_variante ? \"'\" + $json.ref_variante + \"'\" : \"NULL\" }}::text AS ref_variante,"
    "'{{ ($json.sku_interno ?? \"\").replace(/'/g, \"''\") }}'::text AS sku_interno,"
    "{{ $json.ean ? \"'\" + $json.ean + \"'\" : \"NULL\" }}::text AS ean,"
    "{{ $json.color ? \"'\" + $json.color.replace(/'/g, \"''\") + \"'\" : \"NULL\" }}::text AS color,"
    "{{ $json.talla ? \"'\" + $json.talla.replace(/'/g, \"''\") + \"'\" : \"NULL\" }}::text AS talla,"
    "{{ $json.stock ?? 0 }}::int AS stock,"
    "{{ $json.imagen ? \"ARRAY['\" + $json.imagen.replace(/'/g, \"''\") + \"']::text[]\" : \"ARRAY[]::text[]\" }} AS images,"
    "{{ $json.activo === false ? 'false' : 'true' }}::boolean AS activo,"
    "{{ $json.visible_web === false ? 'false' : 'true' }}::boolean AS visible_web) v "
    'JOIN "Product" p ON p.proveedor=v.proveedor AND p.ref_proveedor=v.ref_proveedor '
    "ORDER BY v.sku_interno, v.ean NULLS LAST "
    "ON CONFLICT (sku_interno) DO UPDATE SET ean=EXCLUDED.ean,color=EXCLUDED.color,talla=EXCLUDED.talla,stock=EXCLUDED.stock,"
    "images=EXCLUDED.images,activo=EXCLUDED.activo,visible_web=EXCLUDED.visible_web,\"updatedAt\"=NOW();"
)

UPDATE_PRODUCT_PRICE = (
    'UPDATE "Product" SET price={{ $json.price }}, "precioBase"={{ $json.precioBase }}, "updatedAt"=NOW() '
    "WHERE proveedor='jim_sports' AND ref_proveedor='{{ $json.ref_proveedor }}'; "
    'UPDATE "ProductVariant" SET price={{ $json.price }}, "updatedAt"=NOW() '
    "WHERE proveedor='jim_sports' AND ref_proveedor='{{ $json.ref_proveedor }}' AND ref_variante IS NULL;"
)

UPDATE_VARIANT_PRICE = (
    'UPDATE "ProductVariant" SET price={{ $json.price }}, "updatedAt"=NOW() '
    "WHERE proveedor='jim_sports' AND ref_proveedor='{{ $json.ref_proveedor }}' "
    "AND COALESCE(ref_variante, '') = '{{ $json.ref_variante ?? \"\" }}';"
)


def node(name, ntype, pos, nid, **params):
    n = {"name": name, "type": ntype, "typeVersion": params.pop("typeVersion", 2), "position": pos, "id": nid, "parameters": params.get("parameters", {})}
    for k, v in params.items():
        if k != "parameters":
            n[k] = v
    return n


def filter_node(name, pos, nid, type_value):
    return node(
        name,
        "n8n-nodes-base.filter",
        pos,
        nid,
        typeVersion=2.2,
        parameters={
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict", "version": 2},
                "conditions": [
                    {
                        "leftValue": "={{ $json.type }}",
                        "rightValue": type_value,
                        "operator": {"type": "string", "operation": "equals"},
                    }
                ],
                "combinator": "and",
            },
            "options": {},
        },
        notes=f"Solo items type={type_value}",
    )


def build_catalog():
    return {
        "name": "Jim Sports v5.2 - CATALOG (CSV + taxonomía web)",
        "nodes": [
            node("Every 4 hours", "n8n-nodes-base.scheduleTrigger", [0, 0], "trig-cat", typeVersion=1.2, parameters={"rule": {"interval": [{"field": "hours", "hoursInterval": 4}]}}),
            node("Download CSV", "n8n-nodes-base.httpRequest", [220, 0], "dl-cat", typeVersion=4.2, parameters={"url": "https://jimsports.shop/fichero-b2b/integracion_producto.csv", "options": {}}),
            node("Parse CSV + Fix Encoding", "n8n-nodes-base.code", [440, 0], "parse-cat", parameters={"jsCode": PARSE_CSV_JS}, notes="v5.2: catálogo + taxonomía web (resolveJimSportsTaxonomy). NO API. NO toca precios."),
            node("Loop Batches", "n8n-nodes-base.splitInBatches", [660, 0], "loop-cat", typeVersion=3, parameters={"batchSize": 100, "options": {}}),
            filter_node("Filter Products", [880, -80], "filt-prod", "product"),
            filter_node("Filter Variants", [880, 80], "filt-var", "variant"),
            node("Upsert Product", "n8n-nodes-base.postgres", [1100, -80], "up-prod-cat", typeVersion=2.5, parameters={"operation": "executeQuery", "query": UPSERT_PRODUCT_CATALOG, "options": {}}, alwaysOutputData=True, credentials=POSTGRES_CRED, notes="v5.2: actualiza categoryId/subcategory/grupo web. No machaca name/images/marca vacíos."),
            node("Upsert ProductVariant", "n8n-nodes-base.postgres", [1100, 80], "up-var-cat", typeVersion=2.6, parameters={"operation": "executeQuery", "query": UPSERT_VARIANT_CATALOG, "options": {}}, credentials=POSTGRES_CRED),
        ],
        "connections": {
            "Every 4 hours": {"main": [[{"node": "Download CSV", "type": "main", "index": 0}]]},
            "Download CSV": {"main": [[{"node": "Parse CSV + Fix Encoding", "type": "main", "index": 0}]]},
            "Parse CSV + Fix Encoding": {"main": [[{"node": "Loop Batches", "type": "main", "index": 0}]]},
            "Loop Batches": {"main": [[], [{"node": "Filter Products", "type": "main", "index": 0}, {"node": "Filter Variants", "type": "main", "index": 0}]]},
            "Filter Products": {"main": [[{"node": "Upsert Product", "type": "main", "index": 0}]]},
            "Filter Variants": {"main": [[{"node": "Upsert ProductVariant", "type": "main", "index": 0}]]},
            "Upsert Product": {"main": [[{"node": "Loop Batches", "type": "main", "index": 0}]]},
            "Upsert ProductVariant": {"main": [[{"node": "Loop Batches", "type": "main", "index": 0}]]},
        },
        "active": False,
        "settings": {"executionOrder": "v1", "executionTimeout": 900},
        "meta": {"instanceId": "aef744e3957da2c375c7aacb4bff35ae811f44f72fadc18bfa3421d85ee62dfe"},
        "tags": [{"name": "jim-sports"}, {"name": "v5"}],
    }


def build_prices():
    return {
        "name": "Jim Sports v5.1 - PRICES (lotes 400 refs / 30 min)",
        "nodes": [
            node("Every 30 minutes", "n8n-nodes-base.scheduleTrigger", [0, 0], "trig-price", typeVersion=1.2, parameters={"rule": {"interval": [{"field": "minutes", "minutesInterval": 30}]}}),
            node("Download CSV", "n8n-nodes-base.httpRequest", [220, 0], "dl-price", typeVersion=4.2, parameters={"url": "https://jimsports.shop/fichero-b2b/integracion_producto.csv", "options": {}}),
            node("Pick Chunk (400 refs)", "n8n-nodes-base.code", [440, 0], "chunk-price", parameters={"jsCode": PICK_CHUNK_JS}, notes="Reanudación con $getWorkflowStaticData. Ciclo completo ~4h con 2981 refs."),
            node("Loop REF Chunk", "n8n-nodes-base.splitInBatches", [660, 0], "loop-price", typeVersion=3, parameters={"batchSize": 10, "options": {}}),
            node("API Get Product", "n8n-nodes-base.httpRequest", [880, 0], "api-price", typeVersion=4.2, continueOnFail=True, parameters={
                "url": "=https://api.jimsports.com/v1/product/byref/{{ $json.ref_proveedor }}",
                "authentication": "genericCredentialType", "genericAuthType": "httpHeaderAuth", "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Accept", "value": "application/json"}, {"name": "ClientAuth", "value": "13658d28-28f7-493b-bb16-16307fe31398"}]},
                "options": {"batching": {"batch": {"batchSize": 1, "batchInterval": 1000}}},
            }, notes="1 req/s Jim Sports. batchInterval 1000ms."),
            node("Extract Prices + Apply Margins", "n8n-nodes-base.code", [1100, 0], "extract-price", parameters={"jsCode": EXTRACT_PRICES_JS}),
            node("Wait for API Loop", "n8n-nodes-base.noOp", [1320, 0], "wait-price", typeVersion=1),
            node("Collect All Prices", "n8n-nodes-base.code", [1540, 0], "collect-price", parameters={"jsCode": COLLECT_PRICES_JS}, notes="v5.1: lee pendingPrices de staticData (fix .all() solo devolvía ~10 items)."),
            node("Loop Price Writes", "n8n-nodes-base.splitInBatches", [1760, 0], "loop-write", typeVersion=3, parameters={"batchSize": 50, "options": {}}),
            node("Switch Price Target", "n8n-nodes-base.switch", [1980, 0], "sw-price", typeVersion=3, parameters={"rules": {"values": [
                {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"}, "conditions": [{"leftValue": "={{ $json.ref_variante }}", "rightValue": "", "operator": {"type": "string", "operation": "equals"}}]}},
                {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"}, "conditions": [{"leftValue": "={{ $json.ref_variante }}", "rightValue": "", "operator": {"type": "string", "operation": "notEquals"}}]}},
            ]}, "options": {}}),
            node("Update Product Price", "n8n-nodes-base.postgres", [2200, -80], "upd-prod-price", typeVersion=2.5, parameters={"operation": "executeQuery", "query": UPDATE_PRODUCT_PRICE, "options": {}}, credentials=POSTGRES_CRED),
            node("Update Variant Price", "n8n-nodes-base.postgres", [2200, 80], "upd-var-price", typeVersion=2.6, parameters={"operation": "executeQuery", "query": UPDATE_VARIANT_PRICE, "options": {}}, credentials=POSTGRES_CRED),
        ],
        "connections": {
            "Every 30 minutes": {"main": [[{"node": "Download CSV", "type": "main", "index": 0}]]},
            "Download CSV": {"main": [[{"node": "Pick Chunk (400 refs)", "type": "main", "index": 0}]]},
            "Pick Chunk (400 refs)": {"main": [[{"node": "Loop REF Chunk", "type": "main", "index": 0}]]},
            "Loop REF Chunk": {"main": [[{"node": "Wait for API Loop", "type": "main", "index": 0}], [{"node": "API Get Product", "type": "main", "index": 0}]]},
            "API Get Product": {"main": [[{"node": "Extract Prices + Apply Margins", "type": "main", "index": 0}]]},
            "Extract Prices + Apply Margins": {"main": [[{"node": "Loop REF Chunk", "type": "main", "index": 0}]]},
            "Wait for API Loop": {"main": [[{"node": "Collect All Prices", "type": "main", "index": 0}]]},
            "Collect All Prices": {"main": [[{"node": "Loop Price Writes", "type": "main", "index": 0}]]},
            "Loop Price Writes": {"main": [[], [{"node": "Switch Price Target", "type": "main", "index": 0}]]},
            "Switch Price Target": {"main": [[{"node": "Update Product Price", "type": "main", "index": 0}], [{"node": "Update Variant Price", "type": "main", "index": 0}]]},
            "Update Product Price": {"main": [[{"node": "Loop Price Writes", "type": "main", "index": 0}]]},
            "Update Variant Price": {"main": [[{"node": "Loop Price Writes", "type": "main", "index": 0}]]},
        },
        "active": False,
        "settings": {"executionOrder": "v1", "executionTimeout": 1200},
        "meta": {"instanceId": "aef744e3957da2c375c7aacb4bff35ae811f44f72fadc18bfa3421d85ee62dfe"},
        "tags": [{"name": "jim-sports"}, {"name": "v5"}],
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for builder, filename in [(build_catalog, "Jim_Sports_v5_CATALOG.json"), (build_prices, "Jim_Sports_v5_PRICES.json")]:
        path = OUT / filename
        path.write_text(json.dumps(builder(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("Wrote", path)


if __name__ == "__main__":
    main()
