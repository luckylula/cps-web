import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Si se solicitan productos, obtenerlos por separado ya que categoryId no es FK
    if (includeProducts) {
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          const products = await prisma.product.findMany({
            where: {
              categoryId: category.id,
              visible_web: true,
              activo: true,
            },
            orderBy: {
              name: 'asc',
            },
          });
          return {
            ...category,
            products,
          };
        })
      );
      return NextResponse.json(categoriesWithProducts);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
