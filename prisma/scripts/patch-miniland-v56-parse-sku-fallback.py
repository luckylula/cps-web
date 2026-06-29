#!/usr/bin/env python3
"""Patch Miniland v5.6: extraer SKU desde ruta imagen cuando CSV interno trunca."""
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

EXTRACT_FN = """
function extractSkuFromRawCell(rawCell) {
  const hay = String(rawCell || '');
  const img = hay.match(/\\/(\\d{10})_\\d*\\.jpg/i);
  if (img && isValidSku(img[1])) return cleanText(img[1]);
  const matches = [...hay.matchAll(/,(\"?)(5005\\d{5,})\\1(?:,|$)/g)];
  for (let i = matches.length - 1; i >= 0; i--) {
    const candidate = cleanText(matches[i][2]);
    if (isValidSku(candidate)) return candidate;
  }
  return '';
}
""".replace("\n", "\r\n")

for node in data["nodes"]:
    if node.get("name") != "Parse + Classify + Tarifa":
        continue
    code = node["parameters"]["jsCode"]
    if "extractSkuFromRawCell" in code:
        print("Already patched")
        break

    old_skip = (
        "  if (inner.length < Math.max(map.skuIdx, map.nameIdx) + 1) {\r\n"
        "    skipped++;\r\n"
        "    continue;\r\n"
        "  }\r\n\r\n"
        "  let sku = cleanText(inner[map.skuIdx]);"
    )
    new_skip = (
        "  if (inner.length < map.nameIdx + 1) {\r\n"
        "    skipped++;\r\n"
        "    continue;\r\n"
        "  }\r\n\r\n"
        "  let sku = cleanText(inner[map.skuIdx]);\r\n"
        "  if (!isValidSku(sku)) sku = extractSkuFromRawCell(rawCell);"
    )
    if old_skip not in code:
        raise SystemExit("Expected skip block not found")

    anchor = "  return /^[A-Za-z0-9._-]+$/.test(s);\r\n}\r\n\r\n\nfunction buildTarifaMap"
    if anchor not in code:
        raise SystemExit("Anchor before buildTarifaMap not found")

    code = code.replace(anchor, "  return /^[A-Za-z0-9._-]+$/.test(s);\r\n}\r\n" + EXTRACT_FN + "\r\n\nfunction buildTarifaMap")
    code = code.replace(old_skip, new_skip)
    node["parameters"]["jsCode"] = code
    node["notes"] = "v5.6: fallback SKU desde imagen /5005XXXXXXXX_*.jpg si fila CSV truncada."
    print("Patched Parse + Classify + Tarifa")
    break
else:
    raise SystemExit("Parse node not found")

data["name"] = "Miniland Sync v5.6 - CATALOGO + TARIFA + LEGACY UPSERT"
path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
