import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentSlug = searchParams.get('parent');
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const categories = await prisma.category.findMany({
      where: {
        ...(parentSlug && {
          // If parentSlug is provided, we could filter by parent category
          // For now, we'll get all categories
        }),
      },
      include: {
        ...(includeProducts && {
          products: {
            where: {
              published: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
        }),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
