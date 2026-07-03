/**
 * Productos que CPS no vende: siempre ocultos en web (visible_web / published).
 * Usado en import Miniland, scripts post-import y criba de visibilidad.
 */

export const NON_SELLABLE_SQL_REGEX =
  "munec|muñec|muñeco|muneco|baby doll|soft body doll|newb\\.?\\s*doll|my friends.{0,16}me|diversity abroches|ropa.{0,48}para munec|traje.{0,48}para munec|conjunto.{0,48}para munec|pijama.{0,48}para munec|albornoz.{0,48}para munec|capa de ba[nñ]o.{0,48}para munec|set inclusivo para munec|expositor doll|display.{0,24}doll|canastilla para muneco|mordedor|biberon|chupete|lactancia|humidificador|termometro|vigilabebes|blw|puericultura";

const NON_SELLABLE_JS_PATTERN =
  /munec|muneco|baby doll|soft body doll|newb\.?\s*doll|my friends\s*&\s*me|diversity abroches|set inclusivo para munec|expositor doll|display.*doll|canastilla para muneco|mordedor|biberon|chupete|lactancia|humidificador|termometro|vigilabebes|blw|puericultura/i;

export function normalizeProductText(...parts: (string | null | undefined)[]): string {
  return parts
    .filter((p): p is string => Boolean(p))
    .join(' ')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

export function isNonSellableProduct(name: string, description?: string | null): boolean {
  const text = normalizeProductText(name, description);
  if (
    /newb\.?\s*doll|baby\s*doll|soft\s*body\s*doll/.test(text) ||
    /my friends\s*&\s*me|diversity abroches|set inclusivo para munec/.test(text)
  ) {
    return true;
  }
  if (/ropa|traje|conjunto|pijama|albornoz|capa de ban/.test(text) && /para munec/.test(text)) {
    return true;
  }
  return NON_SELLABLE_JS_PATTERN.test(text);
}

/** Fragmento SQL: columna de texto ya en lower o envuelta en lower(). */
export function sqlNonSellableMatch(columnSql: string): string {
  return `(${columnSql} ~* '${NON_SELLABLE_SQL_REGEX}')`;
}
