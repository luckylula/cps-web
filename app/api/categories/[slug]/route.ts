import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    
    // Handle both sync and async params (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;

    console.log(`[API] Fetching category with slug: ${slug}, includeProducts: ${includeProducts}`);

    const category = await prisma.category.findUnique({
      where: {
        slug: slug,
      },
    });

    console.log(`[API] Category found:`, category ? `${category.name} (${category.id})` : 'null');

    if (!category) {
      // Also check if any categories exist at all
      const allCategories = await prisma.category.findMany({
        select: { slug: true, name: true },
        take: 5,
      });
      console.log(`[API] Available categories (sample):`, allCategories);
      
      return NextResponse.json(
        { 
          error: 'Categoría no encontrada',
          requestedSlug: slug,
          availableCategories: allCategories.map(c => c.slug),
        },
        { status: 404 }
      );
    }

    // Si se solicitan productos, obtenerlos por separado usando categoryId
    if (includeProducts) {
      const products = await prisma.product.findMany({
        where: {
          categoryId: category.id, // categoryId es un String que coincide con Category.id
          visible_web: true,
          activo: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return NextResponse.json({
        ...category,
        products,
      });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('[API] Error fetching category:', error);
    console.error('[API] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { 
        error: 'Error al obtener categoría',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}
