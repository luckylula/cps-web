import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Material Escolar category slugs
const MATERIAL_ESCOLAR_SLUGS = [
  'psicomotricidad',
  'figuras-espuma',
  'juegos-alternativos',
  'educacion-infantil',
  'malabares',
  'material-foam',
  // Nueva URL requerida
  'manualidades',
  'colchonetas',
  // Nueva URL requerida
  'juguetes-educativos',
  // Legacy slug (por compatibilidad con BD actual)
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
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`[API] Found ${categories.length} categories`);

    // Obtener productos para cada categoría por separado
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await prisma.product.findMany({
          where: {
            categoryId: category.id,
            visible_web: true,
            activo: true,
          },
          orderBy: {
            name: 'asc',
          },
        });

        return {
          ...category,
          products,
        };
      })
    );

    // Map to the expected format
    const categoriesMap: Record<string, any> = {};
    const slugToKey: Record<string, string> = {
      'psicomotricidad': 'psicomotricidad',
      'figuras-espuma': 'figurasEspuma',
      'juegos-alternativos': 'juegosAlternativos',
      'educacion-infantil': 'educacionInfantil',
      'malabares': 'malabares',
      'material-foam': 'materialFoam',
      // Legacy / nueva (la clave final se resuelve abajo para compatibilidad)
      'colchonetas': 'manualidades',
      'manualidades': 'manualidades',
      'educacion-musical': 'educacionMusical',
      'juguetes-educativos': 'educacionMusical',
    };

    categoriesWithProducts.forEach((category) => {
      const key = slugToKey[category.slug];
      if (!key) return;

      if (category.slug === 'colchonetas') {
        // Alias compatible: la UI nueva usa manualidades, pero mantenemos la clave legacy.
        categoriesMap.manualidades = category;
        categoriesMap.colchonetas = category;
        return;
      }

      if (key === 'educacionMusical') {
        // Normalizar la respuesta a la nueva URL/label.
        categoriesMap.educacionMusical = {
          ...category,
          slug: 'juguetes-educativos',
          name: 'Juguetes Educativos',
        };
        return;
      }

      // Normal (incluye slug manualidades -> key manualidades)
      categoriesMap[key] = category;
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
