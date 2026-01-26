import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// API para obtener subcategorías agrupadas con conteos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);

    // Obtener todas las subcategorías con conteo de productos
    const products = await prisma.product.findMany({
      where: {
        categoryId: slug,
        visible_web: true,
        activo: true,
        subcategory: {
          not: null,
        },
      },
      select: {
        subcategory: true,
      },
    });

    // Contar productos por subcategoría
    const subcategoryCounts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.subcategory) {
        subcategoryCounts[p.subcategory] = (subcategoryCounts[p.subcategory] || 0) + 1;
      }
    });

    // Agrupar por primer nivel (antes del ">")
    const grouped: Record<string, Array<{ name: string; fullName: string; count: number }>> = {};

    Object.entries(subcategoryCounts).forEach(([fullName, count]) => {
      const parts = fullName.split(' > ');
      const firstLevel = parts[0] || fullName;
      const secondLevel = parts[1] || fullName;

      if (!grouped[firstLevel]) {
        grouped[firstLevel] = [];
      }

      grouped[firstLevel].push({
        name: secondLevel,
        fullName: fullName,
        count: count,
      });
    });

    // Ordenar grupos y subcategorías
    const sortedGroups = Object.entries(grouped)
      .map(([groupName, items]) => ({
        groupName,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
        totalCount: items.reduce((sum, item) => sum + item.count, 0),
      }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName));

    return NextResponse.json(sortedGroups);
  } catch (error) {
    console.error('Error fetching grouped subcategories:', error);
    return NextResponse.json(
      { error: 'Error al obtener subcategorías' },
      { status: 500 }
    );
  }
}
