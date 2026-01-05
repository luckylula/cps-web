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

    const products = await prisma.product.findMany({
      where: {
        published: true,
        ...(category && { category: { slug: category } }),
        ...(subcategory && { subcategory: subcategory }),
        ...(excludeId && { id: { not: excludeId } }),
      },
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