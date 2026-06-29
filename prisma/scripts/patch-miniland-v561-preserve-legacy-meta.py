#!/usr/bin/env python3
"""Patch Miniland v5.6.1: conservar categoria/visible_web en updates legacy."""
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

REPLACEMENTS = [
    (
        "  SELECT p.id, p.sku_interno AS old_sku, p.slug AS old_slug\n  FROM \"Product\" p, d",
        "  SELECT p.id, p.sku_interno AS old_sku, p.slug AS old_slug,\n"
        "    p.\"categoryId\" AS old_category, p.subcategory AS old_subcategory,\n"
        "    p.visible_web AS old_visible_web, p.grupo AS old_grupo\n  FROM \"Product\" p, d",
    ),
    (
        '    "categoryId" = d.category_id,\n    subcategory = d.subcategory,\n    grupo = d.grupo,',
        '    "categoryId" = COALESCE(e.old_category, d.category_id),\n'
        '    subcategory = COALESCE(e.old_subcategory, d.subcategory),\n'
        '    grupo = COALESCE(e.old_grupo, d.grupo),',
    ),
    (
        "    visible_web = d.visible_web,",
        "    visible_web = COALESCE(e.old_visible_web, d.visible_web),",
    ),
]

for node in data["nodes"]:
    if node.get("name") != "Upsert to Neon":
        continue
    q = node["parameters"]["query"]
    for old, new in REPLACEMENTS:
        if old not in q:
            raise SystemExit(f"Block not found: {old[:60]}...")
        q = q.replace(old, new)
    node["parameters"]["query"] = q
    node["notes"] = "v5.6.1: legacy conserva slug, sku, categoria y visible_web."
    print("Patched Upsert to Neon")
    break
else:
    raise SystemExit("Upsert node not found")

data["name"] = "Miniland Sync v5.6.1 - CATALOGO + TARIFA + LEGACY UPSERT"
path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
