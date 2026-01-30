/**
 * Árbol de categorías desde Product (fuente de verdad).
 * Solo productos con published=true, visible_web=true, subcategory no nula/vacía.
 */
import { prisma } from '@/lib/prisma';
import { getSubcategoryName } from '@/app/lib/navigationMapping';

export interface SubcategoryItem {
  name: string;
  slug: string;
}

export interface CategoryTreeItem {
  categoryId: string;
  subcategories: SubcategoryItem[];
}

/**
 * Slug estable para subcategoría: "Ropa Casual" -> "ropa-casual".
 * No modifica slugs existentes en Product.
 */
export function normalizeSubcategorySlug(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const BASE_WHERE = {
  published: true,
  visible_web: true,
  subcategory: { not: null },
} as const;

/**
 * Devuelve el árbol de categorías desde Product.
 * Nivel 1: categoryId, Nivel 2: subcategory (nombre y slug).
 * Solo productos published=true, visible_web=true, subcategory no nula/vacía.
 * Orden alfabético por categoryId y por subcategory.
 */
export async function getCategoryTree(
  categoryIdFilter?: string
): Promise<CategoryTreeItem[]> {
  const where: { published: boolean; visible_web: boolean; subcategory: { not: null }; categoryId?: string } = {
    ...BASE_WHERE,
  };
  if (categoryIdFilter) {
    where.categoryId = categoryIdFilter;
  }

  const raw = await prisma.product.groupBy({
    by: ['categoryId', 'subcategory'],
    where,
    _count: { id: true },
  });

  const byCategory: Record<string, SubcategoryItem[]> = {};
  for (const row of raw) {
    const sub = row.subcategory;
    if (sub == null || String(sub).trim() === '') continue;
    const name = String(sub).trim();
    const slug = normalizeSubcategorySlug(name);
    if (!slug) continue;
    if (!byCategory[row.categoryId]) {
      byCategory[row.categoryId] = [];
    }
    const exists = byCategory[row.categoryId].some((s) => s.slug === slug);
    if (!exists) {
      byCategory[row.categoryId].push({ name, slug });
    }
  }

  const result: CategoryTreeItem[] = Object.entries(byCategory)
    .map(([categoryId, subcategories]) => ({
      categoryId,
      subcategories: subcategories.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.categoryId.localeCompare(b.categoryId));

  if (process.env.NODE_ENV !== 'production' && (categoryIdFilter === 'textil' || !categoryIdFilter)) {
    const textil = result.find((r) => r.categoryId === 'textil');
    const ropaCasual = textil?.subcategories.find((s) => s.slug === 'ropa-casual');
    console.debug('[getCategoryTree] textil subcategories:', textil?.subcategories?.length ?? 0, 'Ropa Casual:', ropaCasual ? 'yes' : 'no');
  }

  return result;
}

/**
 * Resuelve slug de subcategoría a nombre para filtrar en BD.
 * Usa mapping estático primero; si no existe, busca en Product (distinct subcategory donde slug normalizado coincida).
 */
export async function getSubcategoryNameFromSlug(
  categoryId: string,
  slug: string
): Promise<string | null> {
  const fromMapping = getSubcategoryName(categoryId, slug);
  if (fromMapping) return fromMapping;

  const slugNorm = slug.toLowerCase().trim();
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      published: true,
      visible_web: true,
      subcategory: { not: null },
    },
    select: { subcategory: true },
    take: 500,
  });
  const found = products.find((p) => p.subcategory && normalizeSubcategorySlug(p.subcategory) === slugNorm);
  return found?.subcategory ?? null;
}
