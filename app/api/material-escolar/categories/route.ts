import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Material Escolar category slugs
const MATERIAL_ESCOLAR_SLUGS = [
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

export async function GET() {
  try {
    console.log('[API] Fetching Material Escolar categories...');
    
    const categories = await prisma.category.findMany({
      where: {
        slug: {
          in: MATERIAL_ESCOLAR_SLUGS,
        },
      },
      include: {
        products: {
          where: {
            published: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`[API] Found ${categories.length} categories`);

    // Map to the expected format
    const categoriesMap: Record<string, any> = {};
    const slugToKey: Record<string, string> = {
      'psicomotricidad': 'psicomotricidad',
      'figuras-espuma': 'figurasEspuma',
      'balones-escolares': 'balonesEscolares',
      'juegos-alternativos': 'juegosAlternativos',
      'educacion-infantil': 'educacionInfantil',
      'malabares': 'malabares',
      'material-foam': 'materialFoam',
      'colchonetas': 'colchonetas',
      'educacion-musical': 'educacionMusical',
    };

    categories.forEach((category) => {
      const key = slugToKey[category.slug];
      if (key) {
        categoriesMap[key] = category;
      }
    });

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories: categoriesMap,
    });
  } catch (error: any) {
    console.error('[API] Error fetching Material Escolar categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}
