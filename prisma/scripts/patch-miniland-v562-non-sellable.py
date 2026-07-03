#!/usr/bin/env python3
"""Miniland v5.6.2: ocultar muñecas/bebé siempre, incluso en updates legacy."""
import json
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))
from product_exclusions import NON_SELLABLE_SQL_REGEX

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / "Miniland_Sync_v5_LOCAL_FILE.json"
data = json.loads(path.read_text(encoding="utf-8"))

IS_NON_SELLABLE_FN = r"""
function isNonSellable(name, description) {
  const text = norm((name || '') + ' ' + (description || ''));
  if (/newb\.?\s*doll|baby\s*doll|soft\s*body\s*doll/.test(text)) return true;
  if (/my friends\s*&\s*me|diversity abroches|set inclusivo para munec/.test(text)) return true;
  if (/ropa|traje|conjunto|pijama|albornoz|capa de ban/.test(text) && /para munec/.test(text)) return true;
  return /munec|muneco|baby doll|soft body doll|expositor doll|display.*doll|canastilla para muneco|mordedor|biberon|chupete|lactancia|humidificador|termometro|vigilabebes|blw|puericultura/i.test(text);
}
"""

CLASSIFY_DOLL_LINE = (
    "  if (text.match(/munec|mun bb|baby doll|soft body doll|newb\\.?\\s*doll|mordedor|"
)
CLASSIFY_DOLL_REPLACEMENT = (
    "  if (isNonSellable(name, description))\n"
    "    return { c: 'bebe', s: 'Puericultura', g: null, t: null };\n"
    "  if (text.match(/munec|mun bb|baby doll|soft body doll|newb\\.?\\s*doll|mordedor|"
)

PUSH_BLOCK_OLD = """      stock: 999,
      categoryId: cats.c,
      subcategory: cats.s,
      grupo: cats.g,
      tipo_producto: cats.t,
      published: true,
      activo: true,
      visible_web: cats.c === 'material-escolar',"""

PUSH_BLOCK_NEW = """      stock: 999,
      categoryId: cats.c,
      subcategory: cats.s,
      grupo: cats.g,
      tipo_producto: cats.t,
      published: !isNonSellable(name, description) && cats.c === 'material-escolar',
      activo: true,
      visible_web: !isNonSellable(name, description) && cats.c === 'material-escolar',"""

UPSERT_VISIBLE_OLD = "    visible_web = COALESCE(e.old_visible_web, d.visible_web),"
UPSERT_VISIBLE_NEW = f"""    visible_web = CASE
      WHEN lower(d.name) ~* '{NON_SELLABLE_SQL_REGEX}'
        OR lower(COALESCE(d.description, '')) ~* '{NON_SELLABLE_SQL_REGEX}'
        OR d.visible_web = false
      THEN false
      ELSE COALESCE(e.old_visible_web, d.visible_web)
    END,
    published = CASE
      WHEN lower(d.name) ~* '{NON_SELLABLE_SQL_REGEX}'
        OR lower(COALESCE(d.description, '')) ~* '{NON_SELLABLE_SQL_REGEX}'
        OR d.visible_web = false
      THEN false
      ELSE d.published
    END,"""

UPSERT_PUBLISHED_DUPLICATE = "    tipo_producto = d.tipo_producto,\n    published = d.published,\n    ref_proveedor"
UPSERT_PUBLISHED_FIXED = "    tipo_producto = d.tipo_producto,\n    ref_proveedor"

for node in data["nodes"]:
    params = node.get("parameters", {})
    code = params.get("jsCode")
    if code and "function classifyProduct" in code:
        if "function isNonSellable" not in code:
            code = code.replace("function classifyProduct", IS_NON_SELLABLE_FN + "\nfunction classifyProduct", 1)
        if CLASSIFY_DOLL_LINE in code and "isNonSellable(name, description)" not in code.split("function classifyProduct")[1].split("}")[0][:400]:
            code = code.replace(CLASSIFY_DOLL_LINE, CLASSIFY_DOLL_REPLACEMENT, 1)
        if PUSH_BLOCK_OLD in code:
            code = code.replace(PUSH_BLOCK_OLD, PUSH_BLOCK_NEW, 1)
        params["jsCode"] = code
        node["notes"] = "v5.6.2: muñecas/bebé siempre ocultos (isNonSellable)."
        print("Patched Parse CSV / classify node")

    if node.get("name") == "Upsert to Neon":
        q = params.get("query", "")
        if UPSERT_VISIBLE_OLD in q:
            q = q.replace(UPSERT_VISIBLE_OLD, UPSERT_VISIBLE_NEW, 1)
        if UPSERT_PUBLISHED_DUPLICATE in q:
            q = q.replace(UPSERT_PUBLISHED_DUPLICATE, UPSERT_PUBLISHED_FIXED, 1)
        params["query"] = q
        node["notes"] = "v5.6.2: fuerza visible_web=false en muñecas/bebé."
        print("Patched Upsert to Neon")

data["name"] = "Miniland Sync v5.6.2 - CATALOGO + TARIFA + NON-SELLABLE HIDE"
path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Written", path.name)
