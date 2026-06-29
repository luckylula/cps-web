#!/usr/bin/env python3
"""Patch Miniland workflow v5.5: upsert legacy products by REF/EAN/image."""
import json
import re
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

INSERT_QUERY = r"""WITH d AS (
  SELECT
    '{{ String($json.name ?? "").replace(/'/g, "''") }}'::text AS name,
    '{{ String($json.slug ?? "").replace(/'/g, "''") }}'::text AS slug_new,
    '{{ String($json.description ?? "").replace(/'/g, "''") }}'::text AS description,
    {{ Number($json.precioBase ?? 0) }}::numeric AS precio_base,
    {{ Array.isArray($json.imagenes) && $json.imagenes.length > 0 ? "ARRAY[" + $json.imagenes.map(img => "'" + String(img).replace(/'/g, "''") + "'").join(",") + "]::text[]" : "ARRAY[]::text[]" }} AS images,
    {{ Number($json.stock ?? 0) }}::int AS stock,
    '{{ String($json.categoryId ?? "sin-clasificar") }}'::text AS category_id,
    '{{ String($json.subcategory ?? "").replace(/'/g, "''") }}'::text AS subcategory,
    {{ $json.grupo ? "'" + String($json.grupo).replace(/'/g, "''") + "'" : "NULL" }}::text AS grupo,
    {{ $json.tipo_producto ? "'" + String($json.tipo_producto).replace(/'/g, "''") + "'" : "NULL" }}::text AS tipo_producto,
    {{ Boolean($json.published ?? true) }}::boolean AS published,
    '{{ String($json.proveedor ?? "miniland") }}'::text AS proveedor,
    '{{ String($json.ref_proveedor ?? "").replace(/'/g, "''") }}'::text AS ref_proveedor,
    '{{ String($json.ref_magento_sku ?? $json.ref_proveedor ?? "").replace(/'/g, "''") }}'::text AS ref_sku,
    '{{ String($json.ref_miniland ?? "").replace(/'/g, "''") }}'::text AS ref_miniland,
    {{ $json.ean ? "'" + String($json.ean).replace(/'/g, "''") + "'" : "NULL" }}::text AS ean,
    '{{ String($json.marca ?? "Miniland").replace(/'/g, "''") }}'::text AS marca,
    {{ Boolean($json.activo ?? true) }}::boolean AS activo,
    {{ Boolean($json.visible_web ?? false) }}::boolean AS visible_web,
    '{{ String($json.sku_interno ?? "").replace(/'/g, "''") }}'::text AS sku_new
),
existing AS (
  SELECT p.id, p.sku_interno AS old_sku, p.slug AS old_slug
  FROM "Product" p, d
  WHERE LOWER(p.proveedor) = 'miniland'
    AND (
      (d.ean IS NOT NULL AND LENGTH(d.ean) >= 8 AND p.ean = d.ean)
      OR (d.ref_sku <> '' AND EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.images, ARRAY[]::text[])) AS im
        WHERE im LIKE '%' || d.ref_sku || '%'
      ))
      OR (d.ref_miniland <> '' AND EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.images, ARRAY[]::text[])) AS im
        WHERE im LIKE '%/' || d.ref_miniland || '_%' OR im LIKE '%' || d.ref_miniland || '_%'
      ))
      OR (d.ref_sku <> '' AND p.sku_interno = 'M' || d.ref_sku)
      OR (d.ref_sku <> '' AND p.ref_proveedor = d.ref_sku)
      OR (d.ref_miniland <> '' AND p.ref_proveedor = d.ref_miniland)
      OR (d.ref_miniland <> '' AND UPPER(p.ref_proveedor) = 'TEMP' || d.ref_miniland)
      OR (d.ref_miniland <> '' AND UPPER(p.sku_interno) = 'M' || 'TEMP' || d.ref_miniland)
    )
  ORDER BY p."updatedAt" DESC NULLS LAST
  LIMIT 1
),
upd AS (
  UPDATE "Product" p SET
    name = d.name,
    slug = COALESCE(e.old_slug, d.slug_new),
    description = d.description,
    price = ROUND((d.precio_base * CASE
      WHEN d.precio_base < 50 THEN 1.50 WHEN d.precio_base < 100 THEN 1.47
      WHEN d.precio_base < 200 THEN 1.43 WHEN d.precio_base < 400 THEN 1.38 ELSE 1.30
    END * 1.21)::numeric, 2),
    "precioBase" = d.precio_base,
    images = CASE WHEN array_length(d.images, 1) > 0 THEN d.images ELSE p.images END,
    stock = d.stock,
    "categoryId" = d.category_id,
    subcategory = d.subcategory,
    grupo = d.grupo,
    tipo_producto = d.tipo_producto,
    published = d.published,
    ref_proveedor = COALESCE(NULLIF(d.ref_miniland, ''), d.ref_proveedor),
    ean = COALESCE(d.ean, p.ean),
    marca = d.marca,
    activo = d.activo,
    visible_web = d.visible_web,
    sku_interno = COALESCE(e.old_sku, d.sku_new),
    "updatedAt" = NOW()
  FROM d
  LEFT JOIN existing e ON true
  WHERE p.id = e.id AND e.id IS NOT NULL
  RETURNING p.id
)
INSERT INTO "Product" (
  name, slug, description, price, "precioBase", images, stock, "categoryId", subcategory,
  grupo, tipo_producto, published, featured, "createdAt", "updatedAt", proveedor,
  ref_proveedor, ref_variante, ean, marca, categoria_texto, categoria_padre, color, talla,
  activo, visible_web, sku_interno
)
SELECT
  d.name, d.slug_new, d.description,
  ROUND((d.precio_base * CASE
    WHEN d.precio_base < 50 THEN 1.50 WHEN d.precio_base < 100 THEN 1.47
    WHEN d.precio_base < 200 THEN 1.43 WHEN d.precio_base < 400 THEN 1.38 ELSE 1.30
  END * 1.21)::numeric, 2),
  d.precio_base, d.images, d.stock, d.category_id, d.subcategory,
  d.grupo, d.tipo_producto, d.published, false, NOW(), NOW(), d.proveedor,
  COALESCE(NULLIF(d.ref_miniland, ''), d.ref_proveedor), NULL, d.ean, d.marca,
  NULL, NULL, NULL, NULL, d.activo, d.visible_web, d.sku_new
FROM d
WHERE NOT EXISTS (SELECT 1 FROM existing WHERE id IS NOT NULL)
ON CONFLICT (sku_interno) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = ROUND((EXCLUDED."precioBase" * CASE
    WHEN EXCLUDED."precioBase" < 50 THEN 1.50 WHEN EXCLUDED."precioBase" < 100 THEN 1.47
    WHEN EXCLUDED."precioBase" < 200 THEN 1.43 WHEN EXCLUDED."precioBase" < 400 THEN 1.38 ELSE 1.30
  END * 1.21)::numeric, 2),
  "precioBase" = EXCLUDED."precioBase",
  images = EXCLUDED.images,
  stock = EXCLUDED.stock,
  "categoryId" = EXCLUDED."categoryId",
  subcategory = EXCLUDED.subcategory,
  grupo = EXCLUDED.grupo,
  tipo_producto = EXCLUDED.tipo_producto,
  ref_proveedor = EXCLUDED.ref_proveedor,
  ean = EXCLUDED.ean,
  marca = EXCLUDED.marca,
  published = EXCLUDED.published,
  activo = EXCLUDED.activo,
  visible_web = EXCLUDED.visible_web,
  "updatedAt" = NOW()
RETURNING id;"""

for n in data["nodes"]:
    if n.get("id") == "insert-neon-v5":
        n["parameters"]["query"] = INSERT_QUERY
        n["name"] = "Upsert to Neon"
        n["notes"] = "v5.5: actualiza legacy (MTEMP*, slug viejo) por EAN/imagen/REF; conserva slug y sku_interno."
        print("Updated Insert -> Upsert SQL")
    if n.get("id") == "parse-classify-v5":
        code = n["parameters"]["jsCode"]
        code = re.sub(
            r"ref_proveedor: truncate\(sku, 100\),\r?\n\s*sku_interno: truncate\(`M\$\{sku\}`, 100\),",
            "ref_proveedor: truncate(refMiniland || sku, 100),\r\n      ref_magento_sku: truncate(sku, 100),\r\n      sku_interno: truncate(`M${sku}`, 100),",
            code,
            count=1,
        )
        if "ref_magento_sku" not in code:
            raise SystemExit("parse ref_magento_sku not applied")
        n["parameters"]["jsCode"] = code
        print("Updated parse ref_proveedor + ref_magento_sku")

data["name"] = "Miniland Sync v5.5 - CATALOGO + TARIFA + LEGACY UPSERT"

# Fix connection name if node renamed
conns = data["connections"]
if "Insert to Neon" in conns:
    conns["Upsert to Neon"] = conns.pop("Insert to Neon")
for key, val in list(conns.items()):
    for branch in val.get("main", []):
        for link in branch:
            if link.get("node") == "Insert to Neon":
                link["node"] = "Upsert to Neon"

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("OK v5.5")
