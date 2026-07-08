import { navigationStructure, type Categoria } from '@/app/lib/navigationStructure';
import { getCategoryName } from '@/app/lib/navigationMapping';

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  instalaciones: 'Equipamiento para instalaciones deportivas',
  'material-escolar': 'Material deportivo escolar',
  deportes: 'Material y equipamiento deportivo',
  textil: 'Ropa y calzado deportivo',
};

export const NAV_CATEGORY_SLUGS = navigationStructure.map((c) => c.slug);

export function getNavCategory(slug: string): Categoria | null {
  return navigationStructure.find((c) => c.slug === slug) ?? null;
}

export function getNavCategoryDisplay(slug: string) {
  const nav = getNavCategory(slug);
  if (!nav) return null;

  return {
    slug: nav.slug,
    name: getCategoryName(slug) || nav.nombre,
    description: CATEGORY_DESCRIPTIONS[slug],
    subcategories: nav.subcategorias.map((s) => ({
      nombre: s.nombre,
      slug: s.slug,
      grupos: s.grupos,
    })),
  };
}

/** Category landing pages that only show the subcategory grid from nav. */
export function isNavCategoryLanding(slug: string): boolean {
  const nav = getNavCategory(slug);
  return !!nav && nav.subcategorias.length > 0;
}

export function getNavSubcategory(categoriaSlug: string, subcategorySlug: string) {
  const nav = getNavCategory(categoriaSlug);
  return nav?.subcategorias.find((s) => s.slug === subcategorySlug) ?? null;
}

export function getStaticGroupsForSubcategory(categoriaSlug: string, subcategorySlug: string) {
  const sub = getNavSubcategory(categoriaSlug, subcategorySlug);
  if (!sub || sub.grupos.length === 0) return [];

  return sub.grupos.map((grupo) => ({
    nombre: grupo.nombre,
    slug: grupo.slug,
    count: 0,
    image: null as string | null,
  }));
}

export async function generateStaticNavCategoryParams() {
  return NAV_CATEGORY_SLUGS.map((categoria) => ({ categoria }));
}
