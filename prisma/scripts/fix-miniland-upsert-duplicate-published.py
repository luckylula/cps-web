#!/usr/bin/env python3
"""Elimina published duplicado en Upsert to Neon (v5.6.2 patch)."""
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

for node in data["nodes"]:
    if node.get("name") != "Upsert to Neon":
        continue
    q = node["parameters"]["query"]
    old = "    tipo_producto = d.tipo_producto,\n    published = d.published,\n    ref_proveedor"
    new = "    tipo_producto = d.tipo_producto,\n    ref_proveedor"
    if old not in q:
        if "published = d.published" in q and "published = CASE" in q:
            q = q.replace("    published = d.published,\n", "", 1)
            print("Removed duplicate published = d.published")
        else:
            raise SystemExit("Expected duplicate published not found")
    else:
        q = q.replace(old, new, 1)
        print("Removed published = d.published before CASE block")
    node["parameters"]["query"] = q
    node["notes"] = "v5.6.3: fix duplicate published column in UPDATE"
    break
else:
    raise SystemExit("Upsert to Neon not found")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
