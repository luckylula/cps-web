#!/usr/bin/env python3
"""Jim Sports: upsert por (proveedor, ref_proveedor), no solo sku_interno."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILES = [
    ROOT / "files claude" / "Jim_Sports_v4_FINAL.json",
    ROOT / "files claude" / "Jim_Sports_v4_SIMPLE.json",
    ROOT / "files claude" / "Jim_Sports_v4_ENCODING_FIXED.json",
    ROOT / "files claude" / "Jim_Sports_v4_ENCODING_FIXED_v2.json",
    ROOT / "files claude" / "Sync_Jim_Sports_CSV_v3_CON_PRECIOS.json",
]

OLD = (
    'ON CONFLICT (sku_interno) DO UPDATE SET '
    '"categoryId"=CASE WHEN "Product"."categoryId" IS NULL OR "Product"."categoryId"=\'\' OR "Product"."categoryId"=\'default\' THEN EXCLUDED."categoryId" ELSE "Product"."categoryId" END,'
    'subcategory=CASE WHEN "Product".subcategory IS NULL OR "Product".subcategory=\'\' THEN EXCLUDED.subcategory ELSE "Product".subcategory END,'
    "proveedor=EXCLUDED.proveedor,ref_proveedor=EXCLUDED.ref_proveedor,name=EXCLUDED.name,"
    'slug=CASE WHEN EXCLUDED.slug IS NULL OR EXCLUDED.slug=\'\' THEN "Product".slug ELSE EXCLUDED.slug END,'
    'price=EXCLUDED.price,"precioBase"=EXCLUDED."precioBase",images=EXCLUDED.images,stock=0,'
    "published=EXCLUDED.published,featured=EXCLUDED.featured,marca=EXCLUDED.marca,"
    'activo=EXCLUDED.activo,visible_web=EXCLUDED.visible_web,"updatedAt"=NOW() RETURNING id;'
)

NEW = (
    "ON CONFLICT ON CONSTRAINT product_unique_proveedor_ref DO UPDATE SET "
    "name=EXCLUDED.name,"
    "price=EXCLUDED.price,"
    '"precioBase"=EXCLUDED."precioBase",'
    "images=EXCLUDED.images,"
    "marca=EXCLUDED.marca,"
    "published=EXCLUDED.published,"
    "featured=EXCLUDED.featured,"
    "activo=EXCLUDED.activo,"
    "visible_web=EXCLUDED.visible_web,"
    "stock=0,"
    '"categoryId"=CASE WHEN "Product"."categoryId" IS NULL OR "Product"."categoryId"=\'\' OR "Product"."categoryId"=\'default\' THEN EXCLUDED."categoryId" ELSE "Product"."categoryId" END,'
    "subcategory=CASE WHEN \"Product\".subcategory IS NULL OR \"Product\".subcategory='' THEN EXCLUDED.subcategory ELSE \"Product\".subcategory END,"
    'slug="Product".slug,'
    'sku_interno=COALESCE("Product".sku_interno, EXCLUDED.sku_interno),'
    "proveedor=EXCLUDED.proveedor,"
    "ref_proveedor=EXCLUDED.ref_proveedor,"
    '"updatedAt"=NOW() RETURNING id;'
)

for path in FILES:
    if not path.exists():
        continue
    data = json.loads(path.read_text(encoding="utf-8"))
    changed = False
    for node in data.get("nodes", []):
        q = node.get("parameters", {}).get("query", "")
        if "INSERT INTO \"Product\"" not in q or "jim_sports" not in q.lower():
            continue
        if "product_unique_proveedor_ref" in q:
            print("OK:", path.name, node.get("name"))
            continue
        if OLD not in q:
            print("WARN: bloque no encontrado en", path.name, node.get("name"))
            continue
        node["parameters"]["query"] = q.replace(OLD, NEW)
        if node.get("name") == "Insert Product":
            node["name"] = "Upsert Product"
            node["notes"] = "v4.1: ON CONFLICT (proveedor, ref_proveedor); conserva slug y sku."
        changed = True
        print("Patched:", path.name, "->", node.get("name"))
    if changed:
        if "Jim_Sports_v4_FINAL" in path.name:
            data["name"] = "Jim Sports v4.1 - API REAL + UPSERT REF"
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

print("Done")
