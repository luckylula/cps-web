"""Patrones SQL compartidos con app/lib/productExclusions.ts"""

NON_SELLABLE_SQL_REGEX = (
    "munec|muñec|muñeco|muneco|baby doll|soft body doll|newb\\.?\\s*doll|"
    "my friends.{0,16}me|diversity abroches|ropa.{0,48}para munec|traje.{0,48}para munec|"
    "conjunto.{0,48}para munec|pijama.{0,48}para munec|albornoz.{0,48}para munec|"
    "capa de ba[nñ]o.{0,48}para munec|set inclusivo para munec|expositor doll|"
    "display.{0,24}doll|canastilla para muneco|mordedor|biberon|chupete|lactancia|"
    "humidificador|termometro|vigilabebes|blw|puericultura"
)
