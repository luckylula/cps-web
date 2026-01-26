import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// API para obtener subcategorías de un grupo específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; grupo: string }> | { slug: string; grupo: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug, grupo } = resolvedParams;
    const decodedGrupo = decodeURIComponent(grupo);

    // Obtener productos del grupo con sus subcategorías
    const products = await prisma.product.findMany({
      where: {
        categoryId: slug,
        grupo: decodedGrupo === 'Sin clasificar' ? null : decodedGrupo,
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

    // Convertir a array ordenado
    const result = Object.entries(grouped)
      .map(([deporte, items]) => ({
        nombre: deporte,
        subcategory: items[0]?.fullName || deporte,
        count: items.reduce((sum, item) => sum + item.count, 0),
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching subcategories for grupo:', error);
    return NextResponse.json(
      { error: 'Error al obtener subcategorías del grupo' },
      { status: 500 }
    );
  }
}
