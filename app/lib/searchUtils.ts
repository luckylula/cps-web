import { Prisma } from "@/generated/client";

const PRODUCT_SEARCH_COLUMNS = ['name', 'sku_interno', 'marca'] as const;

export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeTerm(term: string): string {
  return removeAccents(term).toLowerCase().trim();
}

function unaccentLowerSql(column: (typeof PRODUCT_SEARCH_COLUMNS)[number]): string {
  return `lower(regexp_replace(normalize(coalesce("${column}", ''), NFD), U&'[\\0300-\\036F]', '', 'g'))`;
}

export interface ProductSearchFilters {
  category?: string | null;
  subcategory?: string | null;
  grupo?: string | null;
  marca?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  excludeId?: string | null;
  limit?: string | null;
}

/** Safe parameterized SQL for product search (works with Prisma driver adapter). */
export function buildProductSearchQuery(
  searchTerm: string,
  filters: ProductSearchFilters = {}
): { sql: string; params: unknown[] } {
  const normalized = normalizeTerm(searchTerm);
  if (!normalized || normalized.length < 2) {
    return {
      sql: `SELECT id, name, slug, price, images, featured, marca, sku_interno, stock, "categoryId" FROM "Product" WHERE FALSE`,
      params: [],
    };
  }

  const params: unknown[] = [`%${normalized}%`];
  let idx = 2;

  const searchOr = PRODUCT_SEARCH_COLUMNS.map(
    (col) => `${unaccentLowerSql(col)} LIKE $1`
  ).join(' OR ');

  let sql = `
    SELECT id, name, slug, price, images, featured, marca, sku_interno, stock, "categoryId"
    FROM "Product"
    WHERE published = true
      AND visible_web = true
      AND activo = true
      AND name <> ''
      AND (sku_interno IS NULL OR sku_interno NOT LIKE '%' || '-BASE')
      AND (${searchOr})
  `;

  if (filters.category) {
    sql += ` AND "categoryId" = $${idx}`;
    params.push(filters.category);
    idx++;
  }
  if (filters.subcategory) {
    sql += ` AND subcategory = $${idx}`;
    params.push(decodeURIComponent(filters.subcategory.trim()));
    idx++;
  }
  if (filters.grupo) {
    sql += ` AND grupo = $${idx}`;
    params.push(decodeURIComponent(filters.grupo.trim()));
    idx++;
  }
  if (filters.marca) {
    sql += ` AND ${unaccentLowerSql('marca')} LIKE $${idx}`;
    params.push(`%${normalizeTerm(filters.marca)}%`);
    idx++;
  }
  if (filters.minPrice) {
    sql += ` AND price >= $${idx}`;
    params.push(parseFloat(filters.minPrice));
    idx++;
  }
  if (filters.maxPrice) {
    sql += ` AND price <= $${idx}`;
    params.push(parseFloat(filters.maxPrice));
    idx++;
  }
  if (filters.minPrice || filters.maxPrice) {
    sql += ` AND price IS NOT NULL`;
  }
  if (filters.excludeId) {
    sql += ` AND id <> $${idx}`;
    params.push(parseInt(filters.excludeId));
    idx++;
  }

  sql += ` ORDER BY name ASC`;

  if (filters.limit) {
    sql += ` LIMIT $${idx}`;
    params.push(parseInt(filters.limit));
  }

  return { sql, params };
}

/** Column expression with accents stripped, lowercased (single flat Sql fragment). */
export function sqlUnaccentedLower(columnName: string): Prisma.Sql {
  const column = Prisma.raw(`"${columnName}"`);
  return Prisma.sql`lower(regexp_replace(normalize(coalesce(${column}, ''), NFD), U&'[\\0300-\\036F]', '', 'g'))`;
}

export function sqlAccentInsensitiveContains(
  columnName: string,
  term: string,
  minLength = 2,
): Prisma.Sql {
  const normalized = normalizeTerm(term);
  if (!normalized || normalized.length < minLength) return Prisma.sql`FALSE`;
  const column = Prisma.raw(`"${columnName}"`);
  return Prisma.sql`lower(regexp_replace(normalize(coalesce(${column}, ''), NFD), U&'[\\0300-\\036F]', '', 'g')) LIKE ${`%${normalized}%`}`;
}

export function sqlAccentInsensitiveEquals(columnName: string, term: string): Prisma.Sql {
  const normalized = normalizeTerm(term);
  if (!normalized) return Prisma.sql`FALSE`;
  const column = Prisma.raw(`"${columnName}"`);
  return Prisma.sql`lower(regexp_replace(normalize(coalesce(${column}, ''), NFD), U&'[\\0300-\\036F]', '', 'g')) = ${normalized}`;
}
