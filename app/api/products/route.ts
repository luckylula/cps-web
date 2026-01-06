import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const limit = searchParams.get('limit');
    const excludeId = searchParams.get('excludeId');

    // Debug logging
    console.log('[API /products] Params:', {
      category,
      subcategory,
      limit,
      excludeId,
    });

    // Build where clause
    const where: any = {
      published: true,
    };

    if (category) {
      where.category = { slug: category };
    }

    // Filter by subcategory - use exact match (trimmed)
    if (subcategory) {
      const trimmedSubcategory = subcategory.trim();
      where.subcategory = trimmedSubcategory;
      console.log('[API /products] Filtering by subcategory:', trimmedSubcategory);
    }

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
    });

    console.log(`[API /products] Found ${products.length} products`);
    if (subcategory && products.length > 0) {
      console.log('[API /products] Sample product subcategories:', 
        products.slice(0, 3).map(p => ({ name: p.name, subcategory: p.subcategory }))
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}