#!/usr/bin/env python3
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

tarifa_block = r"""
function loadTarifaMap() {
  const fs = require('fs');
  const path = '/home/ubuntu/.n8n-files/miniland-tarifa.csv';
  let text = '';
  try { text = fs.readFileSync(path, 'utf-8'); } catch (e) {
    throw new Error('No se pudo leer tarifa: ' + path + ' - ' + e.message);
  }
  text = text.replace(/^\uFEFF/, '');
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('REF;')) continue;
    const parts = line.split(';');
    const ref = cleanText(parts[0]);
    const precio = parseFloat(String(parts[1] || '').replace(',', '.'));
    if (ref && Number.isFinite(precio) && precio > 0) map[ref] = precio;
  }
  if (Object.keys(map).length === 0) throw new Error('Tarifa vacia: ' + path);
  return map;
}

function extractRefMiniland(sku, rawCell) {
  const hay = String(rawCell || '');
  const m = hay.match(/\/security\/(\d+)_/i);
  if (m) return m[1];
  const s = cleanText(sku);
  if (/^5005\d+$/.test(s) && s.length >= 10) return s.slice(-5);
  if (/^\d{4,6}$/.test(s)) return s;
  return '';
}

function lookupPrecioBase(tarifaMap, sku, rawCell) {
  let ref = extractRefMiniland(sku, rawCell);
  if (ref && tarifaMap[ref] > 0) return { precioBase: tarifaMap[ref], refMiniland: ref };
  if (ref && ref.length === 6 && ref.startsWith('5')) {
    const alt = ref.slice(1);
    if (tarifaMap[alt] > 0) return { precioBase: tarifaMap[alt], refMiniland: alt };
  }
  return { precioBase: 0, refMiniland: ref || null };
}
"""

code = data["nodes"][2]["parameters"]["jsCode"]
marker = "function parseCSVAll(text, delimiter) {"
if marker not in code:
    raise SystemExit("marker parseCSVAll not found")
code = code.replace(marker, tarifa_block + "\r\n" + marker)

code = code.replace(
    "// --- Parse hibrido ; + coma en columna 0 ---\r\nconst outerRows = parseCSVAll(csvText, ';');",
    "// --- Parse hibrido ; + coma en columna 0 ---\r\nconst tarifaMap = loadTarifaMap();\r\nconst outerRows = parseCSVAll(csvText, ';');",
)

code = code.replace(
    "for (let i = 2; i < outerRows.length; i++) {\r\n  const inner = parseInnerRow(outerCell(outerRows[i]));",
    "for (let i = 2; i < outerRows.length; i++) {\r\n  const rawCell = outerCell(outerRows[i]);\r\n  const inner = parseInnerRow(rawCell);",
)

code = code.replace(
    "  const price = map.priceIdx >= 0 ? parsePrice(inner[map.priceIdx]) : 0;\r\n  const ean = map.eanIdx >= 0 ? cleanText(inner[map.eanIdx]) : '';",
    "  const image = map.imageIdx >= 0 ? cleanText(inner[map.imageIdx]) : '';\r\n  const { precioBase, refMiniland } = lookupPrecioBase(tarifaMap, sku, rawCell);\r\n  const ean = map.eanIdx >= 0 ? cleanText(inner[map.eanIdx]) : '';",
)

code = code.replace(
    "  const description = map.descIdx >= 0 ? stripHtml(inner[map.descIdx]) : '';\r\n  const image = map.imageIdx >= 0 ? cleanText(inner[map.imageIdx]) : '';",
    "  const description = map.descIdx >= 0 ? stripHtml(inner[map.descIdx]) : '';",
)

code = code.replace(
    "      precioBase: price,\r\n      price: price,",
    "      precioBase,\r\n      price: precioBase,\r\n      ref_miniland: refMiniland,",
)

data["nodes"][2]["parameters"]["jsCode"] = code
data["nodes"][2]["name"] = "Parse + Classify + Tarifa"
data["name"] = "Miniland Sync v5.4 - CATALOGO + TARIFA"
data["nodes"][1]["notes"] = (
    "Catalogo Magento 2026. Precios desde miniland-tarifa.csv (PRECIO distribuidor)."
)

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("OK: Miniland_Sync_v5_LOCAL_FILE.json -> v5.4")
