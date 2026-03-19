import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if Material Escolar categories exist
    const materialEscolarSlugs = [
      'psicomotricidad',
      'figuras-espuma',
      'juegos-alternativos',
      'educacion-infantil',
      'malabares',
      'material-foam',
      'manualidades',
      'juguetes-educativos',
    ];

    const categories = await prisma.category.findMany({
      where: {
        slug: {
          in: materialEscolarSlugs,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
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
          slug: category.slug,
          name: category.name,
          productCount,
        };
      })
    );

    return NextResponse.json({
      found: categories.length,
      total: materialEscolarSlugs.length,
      categories: categoriesWithCounts,
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
