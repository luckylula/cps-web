import { NextResponse } from 'next/server';
import { getCategoryTree } from '@/app/lib/categoryTree';

export const dynamic = 'force-dynamic';

/**
 * GET /api/categories/tree?categoryId=textil
 * Devuelve árbol de categorías desde Product: { categoryId, subcategories: { name, slug }[] }.
 * Solo productos published=true, visible_web=true, subcategory no nula/vacía.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const tree = await getCategoryTree(categoryId);
    return NextResponse.json(tree);
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return NextResponse.json(
      { error: 'Error al obtener árbol de categorías' },
      { status: 500 }
    );
  }
}
