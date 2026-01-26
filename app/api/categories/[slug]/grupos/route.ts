import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// API para obtener grupos de una categoría con contadores
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);

    // Obtener todos los grupos únicos con conteo de productos
    const products = await prisma.product.findMany({
      where: {
        categoryId: slug,
        visible_web: true,
        activo: true,
      },
      select: {
        grupo: true,
      },
    });

    // Contar productos por grupo
    const grupoCounts: Record<string, number> = {};
    products.forEach((p) => {
      const grupoName = p.grupo || 'Sin clasificar';
      grupoCounts[grupoName] = (grupoCounts[grupoName] || 0) + 1;
    });

    // Convertir a array y ordenar
    const grupos = Object.entries(grupoCounts)
      .map(([nombre, count]) => ({
        nombre,
        count,
      }))
      .sort((a, b) => {
        // "Sin clasificar" al final
        if (a.nombre === 'Sin clasificar') return 1;
        if (b.nombre === 'Sin clasificar') return -1;
        return a.nombre.localeCompare(b.nombre);
      });

    return NextResponse.json(grupos);
  } catch (error) {
    console.error('Error fetching grupos:', error);
    return NextResponse.json(
      { error: 'Error al obtener grupos' },
      { status: 500 }
    );
  }
}
