#!/usr/bin/env python3
import json
import re
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

decode_node = {
    "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": (
            "const item = $input.first();\n"
            "let text = '';\n"
            "const binaryKeys = Object.keys(item.binary || {});\n"
            "for (const key of binaryKeys.length ? binaryKeys : ['data']) {\n"
            "  try {\n"
            "    const buffer = await this.helpers.getBinaryDataBuffer(0, key);\n"
            "    text = buffer.toString('utf-8');\n"
            "    if (text.trim()) break;\n"
            "  } catch (e) {\n"
            "    const binMeta = item.binary?.[key];\n"
            "    if (!binMeta) continue;\n"
            "    let raw = typeof binMeta.data === 'string' ? binMeta.data : (binMeta.data?.data || '');\n"
            "    if (!raw) continue;\n"
            "    if (raw.startsWith('REF;') || /^REF;PRECIO/.test(raw)) {\n"
            "      text = raw;\n"
            "    } else {\n"
            "      text = Buffer.from(raw, 'base64').toString('utf-8');\n"
            "    }\n"
            "    if (text.trim()) break;\n"
            "  }\n"
            "}\n"
            "if (!text.trim()) throw new Error('No se pudo leer miniland-tarifa.csv');\n"
            "text = text.replace(/^\\uFEFF/, '');\n"
            "const dataLines = text.split(/\\r?\\n/).filter((l) => l.trim() && !l.startsWith('REF;'));\n"
            "if (dataLines.length === 0) throw new Error('Tarifa sin lineas de precio');\n"
            "return [{ json: { tarifaText: text, tarifaCount: dataLines.length } }];\n"
        ),
    },
    "name": "Decode Tarifa",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [330, -120],
    "id": "decode-tarifa-v54",
    "notes": "Convierte tarifa binaria a JSON (n8n 2.x no expone binary en nodos posteriores).",
}

if not any(n.get("id") == "decode-tarifa-v54" for n in data["nodes"]):
    # insert after Read Tarifa (index 1)
    data["nodes"].insert(2, decode_node)

data["name"] = "Miniland Sync v5.4.1 - CATALOGO + TARIFA"
data["connections"]["Read Tarifa File"] = {
    "main": [[{"node": "Decode Tarifa", "type": "main", "index": 0}]]
}
data["connections"]["Decode Tarifa"] = {
    "main": [[{"node": "Read CSV File", "type": "main", "index": 0}]]
}

old_block = re.compile(
    r"\nasync function readBinaryTextFromItem[\s\S]*?\n\}\n\nasync function loadTarifaMap\(\) \{[\s\S]*?\n\}\n\nfunction extractRefMiniland",
    re.MULTILINE,
)

new_block = """
function buildTarifaMap(text) {
  const map = {};
  for (const line of text.split(/\\r?\\n/)) {
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
}

function extractRefMiniland"""

for n in data["nodes"]:
    if n.get("id") == "parse-classify-v5":
        code = n["parameters"]["jsCode"]
        code, n_subs = old_block.subn(new_block, code, count=1)
        if n_subs != 1:
            raise SystemExit(f"parse block replace failed ({n_subs})")
        code = code.replace(
            "const tarifaMap = await loadTarifaMap();",
            "const tarifaNode = $('Decode Tarifa').first();\n"
            "if (!tarifaNode?.json?.tarifaText) throw new Error('Decode Tarifa sin tarifaText');\n"
            "const tarifaMap = buildTarifaMap(tarifaNode.json.tarifaText);",
        )
        n["parameters"]["jsCode"] = code
        break
else:
    raise SystemExit("parse node not found")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("OK v5.4.1: Decode Tarifa node added")
