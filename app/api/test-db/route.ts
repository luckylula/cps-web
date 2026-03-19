import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection and fetch categories
    const categories = await prisma.category.findMany({
      where: {
        slug: {
          in: ['psicomotricidad', 'figuras-espuma', 'educacion-infantil'],
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Contar productos para cada categoría por separado
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await prisma.product.count({
          where: {
            categoryId: category.id,
            visible_web: true,
            activo: true,
          },
        });

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          productCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      connection: 'OK',
      categoriesFound: categories.length,
      categories: categoriesWithCounts,
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
