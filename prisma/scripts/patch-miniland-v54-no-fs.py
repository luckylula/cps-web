#!/usr/bin/env python3
import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

# Add Read Tarifa node after Manual Trigger node in array
tarifa_node = {
    "parameters": {
        "filePath": "/home/ubuntu/.n8n-files/miniland-tarifa.csv",
        "options": {},
    },
    "name": "Read Tarifa File",
    "type": "n8n-nodes-base.readBinaryFile",
    "typeVersion": 1,
    "position": [220, -120],
    "id": "read-tarifa-v54",
    "notes": "Tarifa Miniland 2026: REF;PRECIO;PVPR;DESCRIPCION",
}

# Insert after manual trigger (index 1)
if not any(n.get("id") == "read-tarifa-v54" for n in data["nodes"]):
    data["nodes"].insert(1, tarifa_node)

# Reposition Read CSV slightly
for n in data["nodes"]:
    if n.get("id") == "read-csv-local-v5":
        n["position"] = [440, 0]
        n["notes"] = "Catalogo Magento 2026 (datos producto, no precios)."
    if n.get("id") == "parse-classify-v5":
        n["position"] = [660, 0]
    if n.get("id") == "apply-margins-v5":
        n["position"] = [880, 0]
    if n.get("id") == "loop-batches-v5":
        n["position"] = [1100, 0]
    if n.get("id") == "insert-neon-v5":
        n["position"] = [1320, 0]

data["name"] = "Miniland Sync v5.4 - CATALOGO + TARIFA"
data["connections"] = {
    "Manual Trigger": {
        "main": [[{"node": "Read Tarifa File", "type": "main", "index": 0}]]
    },
    "Read Tarifa File": {
        "main": [[{"node": "Read CSV File", "type": "main", "index": 0}]]
    },
    "Read CSV File": {
        "main": [[{"node": "Parse + Classify + Tarifa", "type": "main", "index": 0}]]
    },
    "Parse + Classify + Tarifa": {
        "main": [[{"node": "Apply Margins", "type": "main", "index": 0}]]
    },
    "Apply Margins": {
        "main": [[{"node": "Loop Batches", "type": "main", "index": 0}]]
    },
    "Loop Batches": {
        "main": [
            [],
            [{"node": "Insert to Neon", "type": "main", "index": 0}],
        ]
    },
    "Insert to Neon": {
        "main": [[{"node": "Loop Batches", "type": "main", "index": 0}]]
    },
}

old_tarifa_fn = r"""
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
"""

new_tarifa_fn = r"""
async function readBinaryText(sourceItem, helpers) {
  let text = '';
  const binaryKeys = Object.keys(sourceItem?.binary || {});
  for (const key of binaryKeys.length ? binaryKeys : ['data']) {
    try {
      const buffer = await helpers.getBinaryDataBuffer(0, key);
      const chunk = buffer.toString('utf-8');
      if (chunk?.trim()) { text = chunk; break; }
    } catch (e) {
      const binMeta = sourceItem.binary?.[key];
      if (binMeta?.data && typeof binMeta.data === 'string') {
        text = Buffer.from(binMeta.data, 'base64').toString('utf-8');
        if (text.trim()) break;
      } else if (Buffer.isBuffer(binMeta)) {
        text = binMeta.toString('utf-8');
        if (text.trim()) break;
      }
    }
  }
  return text;
}

async function loadTarifaMap() {
  const tarifaItem = $('Read Tarifa File').first();
  if (!tarifaItem) throw new Error('Nodo Read Tarifa File sin datos');
  let text = await readBinaryText(tarifaItem, this.helpers);
  if (!text?.trim()) throw new Error('Tarifa CSV vacio - revisar miniland-tarifa.csv en VPS');
  text = text.replace(/^\uFEFF/, '');
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('REF;')) continue;
    const parts = line.split(';');
    const ref = cleanText(parts[0]);
    const precio = parseFloat(String(parts[1] || '').replace(',', '.'));
    if (ref && Number.isFinite(precio) && precio > 0) map[ref] = precio;
  }
  if (Object.keys(map).length === 0) throw new Error('Tarifa sin precios validos');
  return map;
}
"""

for n in data["nodes"]:
    if n.get("id") == "parse-classify-v5":
        code = n["parameters"]["jsCode"]
        if old_tarifa_fn.strip() not in code.replace("\r\n", "\n"):
            # try without caring about line endings - use unique substring
            if "require('fs')" not in code:
                raise SystemExit("fs block not found - already patched?")
            code = code.replace(
                "function loadTarifaMap() {\n  const fs = require('fs');",
                "PLACEHOLDER_START",
            )
            # fallback: replace whole block between loadTarifaMap and extractRefMiniland
            import re

            code = re.sub(
                r"function loadTarifaMap\(\) \{[\s\S]*?\n\}\n\nfunction extractRefMiniland",
                new_tarifa_fn.strip() + "\n\nfunction extractRefMiniland",
                code,
                count=1,
            )
        else:
            code = code.replace(old_tarifa_fn, new_tarifa_fn)

        code = code.replace(
            "const tarifaMap = loadTarifaMap();",
            "const tarifaMap = await loadTarifaMap();",
        )
        n["parameters"]["jsCode"] = code
        break
else:
    raise SystemExit("parse node not found")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Patched v5.4: Read Tarifa File node, no fs")
