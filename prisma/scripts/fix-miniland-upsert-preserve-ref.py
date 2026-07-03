#!/usr/bin/env python3
"""Evita colisión unique (proveedor, ref_proveedor) al actualizar legacy: no sobrescribir ref."""
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

REF_OLD = "    ref_proveedor = COALESCE(NULLIF(d.ref_miniland, ''), d.ref_proveedor),"
REF_NEW = "    ref_proveedor = COALESCE(NULLIF(p.ref_proveedor, ''), NULLIF(d.ref_miniland, ''), d.ref_proveedor),"

ORDER_OLD = '  ORDER BY p."updatedAt" DESC NULLS LAST\n  LIMIT 1'
ORDER_NEW = """  ORDER BY
    CASE
      WHEN p.ref_proveedor = COALESCE(NULLIF(d.ref_miniland, ''), NULLIF(d.ref_proveedor, ''), NULLIF(d.ref_sku, '')) THEN 0
      WHEN d.ean IS NOT NULL AND LENGTH(d.ean) >= 8 AND p.ean = d.ean THEN 1
      WHEN d.sku_new <> '' AND p.sku_interno = d.sku_new THEN 2
      ELSE 3
    END,
    p."updatedAt" DESC NULLS LAST
  LIMIT 1"""

for node in data["nodes"]:
    if node.get("name") != "Upsert to Neon":
        continue
    q = node["parameters"]["query"]
    if REF_OLD not in q:
        if "COALESCE(NULLIF(p.ref_proveedor" in q:
            print("ref_proveedor already preserved")
        else:
            raise SystemExit("ref_proveedor line not found")
    else:
        q = q.replace(REF_OLD, REF_NEW, 1)
        print("Patched ref_proveedor on UPDATE")
    if ORDER_OLD in q:
        q = q.replace(ORDER_OLD, ORDER_NEW, 1)
        print("Patched existing ORDER BY")
    node["parameters"]["query"] = q
    node["notes"] = "v5.6.5: preservar ref_proveedor en UPDATE legacy"
    break
else:
    raise SystemExit("Upsert to Neon not found")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
