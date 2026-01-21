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
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      published: true,
    };

    // Search functionality - search in product name
    if (search && search.trim().length >= 2) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive', // Case-insensitive search
      };
    }

    if (category) {
      where.category = { slug: category };
    }

    // Filter by subcategory - use exact match (trimmed)
    if (subcategory) {
      const trimmedSubcategory = subcategory.trim();
      where.subcategory = trimmedSubcategory;
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

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}