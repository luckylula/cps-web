import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// API para obtener subcategorías de una categoría específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);

    // Obtener todas las subcategorías únicas para esta categoría
    const products = await prisma.product.findMany({
      where: {
        categoryId: slug, // slug es el categoryId (deportes, textil, etc.)
        visible_web: true,
        activo: true,
        subcategory: {
          not: null,
        },
      },
      select: {
        subcategory: true,
      },
      distinct: ['subcategory'],
    });

    // Extraer subcategorías únicas y ordenarlas
    const subcategories = products
      .map((p) => p.subcategory)
      .filter((sub): sub is string => sub !== null)
      .sort();

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Error al obtener subcategorías' },
      { status: 500 }
    );
  }
}
