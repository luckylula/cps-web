#!/usr/bin/env python3
"""Fix duplicate (proveedor, ref_proveedor): mejor matching + ON CONFLICT fallback."""
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

EXISTING_OLD = """      OR (d.ref_miniland <> '' AND UPPER(p.sku_interno) = 'M' || 'TEMP' || d.ref_miniland)
    )
  ORDER BY p."updatedAt" DESC NULLS LAST"""

EXISTING_NEW = """      OR (d.ref_miniland <> '' AND UPPER(p.sku_interno) = 'M' || 'TEMP' || d.ref_miniland)
      OR (d.ref_proveedor <> '' AND p.ref_proveedor = d.ref_proveedor)
      OR (p.ref_proveedor = COALESCE(NULLIF(d.ref_miniland, ''), NULLIF(d.ref_proveedor, ''), NULLIF(d.ref_sku, '')))
      OR (d.sku_new <> '' AND p.sku_interno = d.sku_new)
    )
  ORDER BY p."updatedAt" DESC NULLS LAST"""

ON_CONFLICT_SKU = """ON CONFLICT (sku_interno) DO UPDATE SET
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
  "updatedAt" = NOW()"""

ON_CONFLICT_REF = """ON CONFLICT (proveedor, ref_proveedor) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = ROUND((EXCLUDED."precioBase" * CASE
    WHEN EXCLUDED."precioBase" < 50 THEN 1.50 WHEN EXCLUDED."precioBase" < 100 THEN 1.47
    WHEN EXCLUDED."precioBase" < 200 THEN 1.43 WHEN EXCLUDED."precioBase" < 400 THEN 1.38 ELSE 1.30
  END * 1.21)::numeric, 2),
  "precioBase" = EXCLUDED."precioBase",
  images = CASE WHEN array_length(EXCLUDED.images, 1) > 0 THEN EXCLUDED.images ELSE "Product".images END,
  stock = EXCLUDED.stock,
  "categoryId" = EXCLUDED."categoryId",
  subcategory = EXCLUDED.subcategory,
  grupo = EXCLUDED.grupo,
  tipo_producto = EXCLUDED.tipo_producto,
  ean = COALESCE(EXCLUDED.ean, "Product".ean),
  marca = EXCLUDED.marca,
  published = EXCLUDED.published,
  activo = EXCLUDED.activo,
  visible_web = EXCLUDED.visible_web,
  "updatedAt" = NOW()"""

for node in data["nodes"]:
    if node.get("name") != "Upsert to Neon":
        continue
    q = node["parameters"]["query"]
    if EXISTING_OLD not in q:
        if "d.ref_proveedor <> '' AND p.ref_proveedor = d.ref_proveedor" in q:
            print("existing match already patched")
        else:
            raise SystemExit("existing block not found")
    else:
        q = q.replace(EXISTING_OLD, EXISTING_NEW, 1)
        print("Patched existing CTE matching")
    if ON_CONFLICT_SKU in q:
        q = q.replace(ON_CONFLICT_SKU, ON_CONFLICT_REF, 1)
        print("Patched ON CONFLICT to product_unique_proveedor_ref")
    elif "product_unique_proveedor_ref" in q:
        print("ON CONFLICT already on proveedor+ref")
    else:
        raise SystemExit("ON CONFLICT block not found")
    node["parameters"]["query"] = q
    node["notes"] = "v5.6.4: fix duplicate proveedor+ref_proveedor"
    break
else:
    raise SystemExit("Upsert to Neon not found")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
