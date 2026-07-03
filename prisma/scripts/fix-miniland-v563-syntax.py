#!/usr/bin/env python3
"""Corrige SyntaxError en classifyProduct (if sin llaves tras patch v5.6.3)."""
import json
import re
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

BROKEN = re.compile(
    r"  if \(text\.match\(/puzzle\|puzle\|encaj\|apil\|bloque\|construc\|didactico\|educativo\|matematic\|numero\|letra\|aprendizaje\|memoria\|observacion/\)\)\s*\n"
    r"    const juego = resolveJuegoEscolarByName\(name, description\);\s*\n"
    r"    if \(juego\) return juego;\s*\n"
    r"    return \{ c: 'material-escolar', s: text\.match\(/manualidad\|pintura\|plastilina\|modelado\|arte/\) \? 'Manualidades' : "
    r"\(text\.match\(/didactico\|matematic\|numero\|letra/\) \? 'Material Did[^']+' : 'Juguetes Educativos'\), g: null, t: null \};",
    re.MULTILINE,
)

FIXED = """  if (text.match(/puzzle|puzle|encaj|apil|bloque|construc|didactico|educativo|matematic|numero|letra|aprendizaje|memoria|observacion/)) {
    const juegoCat = resolveJuegoEscolarByName(name, description);
    if (juegoCat) return juegoCat;
    return { c: 'material-escolar', s: text.match(/manualidad|pintura|plastilina|modelado|arte/) ? 'Manualidades' : (text.match(/didactico|matematic|numero|letra/) ? 'Material Didáctico' : 'Juguetes Educativos'), g: null, t: null };
  }"""

for node in data["nodes"]:
    code = node.get("parameters", {}).get("jsCode", "")
    if "function classifyProduct" not in code:
        continue

    code2, n = BROKEN.subn(FIXED.replace("\n", "\r\n"), code)
    if n == 0:
        code2, n = BROKEN.subn(FIXED, code)
    if n == 0:
        raise SystemExit("Broken block not found — already fixed?")

    code = code2.replace(
        "const juego = resolveJuegoEscolarByName(name, description);\r\n  if (juego) return juego;",
        "const juegoCat = resolveJuegoEscolarByName(name, description);\r\n  if (juegoCat) return juegoCat;",
    )
    code = code.replace(
        "const juego = resolveJuegoEscolarByName(name, description);\n  if (juego) return juego;",
        "const juegoCat = resolveJuegoEscolarByName(name, description);\n  if (juegoCat) return juegoCat;",
    )

    code = re.sub(
        r"return \{ c: 'material-escolar', s: 'Juegos en Educaci[^']+', g: null, t: null \};",
        "return { c: 'material-escolar', s: 'Juegos en Educación infantil', g: null, t: null };",
        code,
    )

    node["parameters"]["jsCode"] = code
    node["notes"] = "v5.6.3: juego en nombre (syntax fix)"
    print(f"Patched classify node ({n} block(s))")
    break
else:
    raise SystemExit("classify node not found")

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
