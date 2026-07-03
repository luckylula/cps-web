#!/usr/bin/env python3
"""Usar ON CONFLICT (proveedor, ref_proveedor) en lugar de ON CONSTRAINT (no existe en Neon)."""
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

OLD = "ON CONFLICT ON CONSTRAINT product_unique_proveedor_ref DO UPDATE SET"
NEW = "ON CONFLICT (proveedor, ref_proveedor) DO UPDATE SET"

for node in data["nodes"]:
    if node.get("name") != "Upsert to Neon":
        continue
    q = node["parameters"]["query"]
    if OLD not in q:
        if "ON CONFLICT (proveedor, ref_proveedor)" in q:
            print("Already patched")
            break
        raise SystemExit("ON CONFLICT block not found")
    q = q.replace(OLD, NEW, 1)
    node["parameters"]["query"] = q
    node["notes"] = "v5.6.4: ON CONFLICT (proveedor, ref_proveedor)"
    print("Patched ON CONFLICT columns")
    break
else:
    raise SystemExit("Upsert to Neon not found")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
