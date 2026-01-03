import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    
    const products = await prisma.product.findMany({
      where: {
        published: true,
        category: {
          slug: slug,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
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
