#!/usr/bin/env python3
"""Miniland v5.6.3: productos con 'juego' en nombre → Juguetes Educativos, no Material Didáctico."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

HELPER = r"""
function resolveJuegoEscolarByName(name, description) {
  const text = norm((name || '') + ' ' + (description || ''));
  if (!text.includes('juego')) return null;
  if (/infantil|iniciacion|educacion infantil|bebe|0-3|1-2 anos/.test(text)) {
    return { c: 'material-escolar', s: 'Juegos en Educación infantil', g: null, t: null };
  }
  return { c: 'material-escolar', s: 'Juguetes Educativos', g: null, t: null };
}
"""

PUZZLE_OLD = (
    "  if (text.match(/puzzle|puzle|encaj|apil|bloque|construc|didactico|educativo|matematic|numero|letra|aprendizaje|memoria|observacion/))\n"
    "    return { c: 'material-escolar', s: text.match(/manualidad|pintura|plastilina|modelado|arte/) ? 'Manualidades' : (text.match(/didactico|matematic|numero|letra/) ? 'Material Didáctico' : 'Juguetes Educativos'), g: null, t: null };"
)

PUZZLE_NEW = (
    "  if (text.match(/puzzle|puzle|encaj|apil|bloque|construc|didactico|educativo|matematic|numero|letra|aprendizaje|memoria|observacion/)) {\n"
    "    const juegoCat = resolveJuegoEscolarByName(name, description);\n"
    "    if (juegoCat) return juegoCat;\n"
    "    return { c: 'material-escolar', s: text.match(/manualidad|pintura|plastilina|modelado|arte/) ? 'Manualidades' : (text.match(/didactico|matematic|numero|letra/) ? 'Material Didáctico' : 'Juguetes Educativos'), g: null, t: null };\n"
    "  }"
)

CLASSIFY_TAIL = "  return { c: 'sin-clasificar', s: 'Miniland pendiente', g: null, t: null };"
CLASSIFY_TAIL_NEW = (
    "  const juegoCat = resolveJuegoEscolarByName(name, description);\n"
    "  if (juegoCat) return juegoCat;\n"
    "  return { c: 'sin-clasificar', s: 'Miniland pendiente', g: null, t: null };"
)

for node in data["nodes"]:
    code = node.get("parameters", {}).get("jsCode", "")
    if "function classifyProduct" not in code:
        continue
    if "function resolveJuegoEscolarByName" not in code:
        code = code.replace("function classifyProduct", HELPER + "\nfunction classifyProduct", 1)

    for old, new in [(PUZZLE_OLD, PUZZLE_NEW), (PUZZLE_OLD.replace("\n", "\r\n"), PUZZLE_NEW.replace("\n", "\r\n"))]:
        if old in code:
            code = code.replace(old, new if "\r\n" in old else new, 1)
            break

    for old, new in [(CLASSIFY_TAIL, CLASSIFY_TAIL_NEW), (CLASSIFY_TAIL.replace("\n", "\r\n"), CLASSIFY_TAIL_NEW.replace("\n", "\r\n"))]:
        if old in code and "juegoCat" not in code.split(old)[0][-200:]:
            code = code.replace(old, new, 1)
            break

    node["parameters"]["jsCode"] = code
    node["notes"] = "v5.6.3: juego en nombre → Juguetes Educativos."
    print("Patched classify node")
    break

data["name"] = "Miniland Sync v5.6.3 - JUEGO → JUGUETES EDUCATIVOS"
path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
