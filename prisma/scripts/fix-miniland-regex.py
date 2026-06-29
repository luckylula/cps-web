#!/usr/bin/env python3
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

DECODE_TARIFA_JS = r"""const item = $input.first();
let text = '';
const binaryKeys = Object.keys(item.binary || {});
for (const key of binaryKeys.length ? binaryKeys : ['data']) {
  try {
    const buffer = await this.helpers.getBinaryDataBuffer(0, key);
    text = buffer.toString('utf-8');
    if (text.trim()) break;
  } catch (e) {
    const binMeta = item.binary?.[key];
    if (!binMeta) continue;
    let raw = typeof binMeta.data === 'string' ? binMeta.data : (binMeta.data?.data || '');
    if (!raw) continue;
    if (raw.startsWith('REF;') || raw.indexOf('REF;PRECIO') === 0) {
      text = raw;
    } else {
      text = Buffer.from(raw, 'base64').toString('utf-8');
    }
    if (text.trim()) break;
  }
}
if (!text.trim()) throw new Error('No se pudo leer miniland-tarifa.csv');
text = text.replace(/^\uFEFF/, '');
const lines = text.split('\n');
const dataLines = lines.filter((l) => l.trim() && !l.startsWith('REF;'));
if (dataLines.length === 0) throw new Error('Tarifa sin lineas de precio');
return [{ json: { tarifaText: text, tarifaCount: dataLines.length } }];
"""

BUILD_TARIFA_MAP_JS = r"""function buildTarifaMap(text) {
  const map = {};
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.trim() || line.startsWith('REF;')) continue;
    const parts = line.split(';');
    const ref = cleanText(parts[0]);
    const precio = parseFloat(String(parts[1] || '').replace(',', '.'));
    if (ref && Number.isFinite(precio) && precio > 0) map[ref] = precio;
  }
  if (Object.keys(map).length === 0) {
    throw new Error('Tarifa sin precios validos (0 refs). Revisar Decode Tarifa.');
  }
  return map;
}"""

for n in data["nodes"]:
    if n.get("id") == "decode-tarifa-v54":
        n["parameters"]["jsCode"] = DECODE_TARIFA_JS
        print("rewrote Decode Tarifa")
    if n.get("id") == "parse-classify-v5":
        code = n["parameters"]["jsCode"]
        # Replace buildTarifaMap function block
        start = code.find("function buildTarifaMap")
        end = code.find("function extractRefMiniland")
        if start == -1 or end == -1:
            raise SystemExit("buildTarifaMap block not found")
        code = code[:start] + BUILD_TARIFA_MAP_JS + "\n\n" + code[end:]
        n["parameters"]["jsCode"] = code
        print("rewrote buildTarifaMap in Parse")

data["name"] = "Miniland Sync v5.4.2 - CATALOGO + TARIFA"
path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("OK")
