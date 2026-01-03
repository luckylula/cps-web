import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if Material Escolar categories exist
    const materialEscolarSlugs = [
      'psicomotricidad',
      'figuras-espuma',
      'balones-escolares',
      'juegos-alternativos',
      'educacion-infantil',
      'malabares',
      'material-foam',
      'colchonetas',
      'educacion-musical',
    ];

    const categories = await prisma.category.findMany({
      where: {
        slug: {
          in: materialEscolarSlugs,
        },
      },
      select: {
        slug: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json({
      found: categories.length,
      total: materialEscolarSlugs.length,
      categories: categories.map(c => ({
        slug: c.slug,
        name: c.name,
        productCount: c._count.products,
      })),
      missing: materialEscolarSlugs.filter(
        slug => !categories.find(c => c.slug === slug)
      ),
    });
  } catch (error) {
    console.error('Error checking categories:', error);
    return NextResponse.json(
      { error: 'Error al verificar categorías' },
      { status: 500 }
    );
  }
}
