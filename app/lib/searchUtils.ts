import { Prisma } from "@/generated/client";

export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeTerm(term: string): string {
  return removeAccents(term).toLowerCase().trim();
}

export function sqlUnaccentedLower(columnName: string): Prisma.Sql {
  return Prisma.sql`lower(regexp_replace(normalize(coalesce(${Prisma.raw(`"${columnName}"`)}, ''), NFD), U&'[\\0300-\\036F]', '', 'g'))`;
}

export function sqlAccentInsensitiveContains(
  columnName: string,
  term: string,
  minLength = 2,
): Prisma.Sql {
  const normalized = normalizeTerm(term);
  if (!normalized || normalized.length < minLength) return Prisma.sql`FALSE`;
  return Prisma.sql`${sqlUnaccentedLower(columnName)} LIKE ${`%${normalized}%`}`;
}

export function sqlAccentInsensitiveEquals(columnName: string, term: string): Prisma.Sql {
  const normalized = normalizeTerm(term);
  if (!normalized) return Prisma.sql`FALSE`;
  return Prisma.sql`${sqlUnaccentedLower(columnName)} = ${normalized}`;
}
