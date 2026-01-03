import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection and fetch categories
    const categories = await prisma.category.findMany({
      where: {
        slug: {
          in: ['psicomotricidad', 'figuras-espuma', 'balones-escolares'],
        },
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      connection: 'OK',
      categoriesFound: categories.length,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
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
