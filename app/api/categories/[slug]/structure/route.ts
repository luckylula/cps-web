import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// API para obtener estructura jerárquica completa de una categoría
// Devuelve: grupos -> deportes (subcategorías agrupadas por primer nivel)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);

    // Obtener todos los productos de la categoría
    const products = await prisma.product.findMany({
      where: {
        categoryId: slug,
        visible_web: true,
        activo: true,
      },
      select: {
        grupo: true,
        subcategory: true,
        images: true,
      },
    });

    // Estructura: grupo -> deporte (primer nivel de subcategory) -> subcategorías completas
    const estructura: Record<string, {
      nombre: string;
      count: number;
      image: string | null;
      deportes: Record<string, {
        nombre: string;
        subcategory: string;
        count: number;
      }>;
    }> = {};

    products.forEach((p) => {
      const grupoName = p.grupo || 'Sin clasificar';
      const subcategory = p.subcategory;

      if (!estructura[grupoName]) {
        // Obtener la primera imagen válida de los productos de este grupo
        const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
        estructura[grupoName] = {
          nombre: grupoName,
          count: 0,
          image: firstImage,
          deportes: {},
        };
      }

      // Si no tiene imagen aún, intentar obtener una de este producto
      if (!estructura[grupoName].image && p.images && p.images.length > 0) {
        estructura[grupoName].image = p.images[0];
      }

      estructura[grupoName].count += 1;

      if (subcategory) {
        // Extraer primer nivel (deporte)
        const parts = subcategory.split(' > ');
        const deporteName = parts[0] || subcategory;

        if (!estructura[grupoName].deportes[deporteName]) {
          estructura[grupoName].deportes[deporteName] = {
            nombre: deporteName,
            subcategory: subcategory,
            count: 0,
          };
        }

        estructura[grupoName].deportes[deporteName].count += 1;
      }
    });

    // Convertir a array y ordenar
    const grupos = Object.values(estructura)
      .map((grupo) => ({
        nombre: grupo.nombre,
        count: grupo.count,
        image: grupo.image,
        deportes: Object.values(grupo.deportes)
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      }))
      .sort((a, b) => {
        // "Sin clasificar" al final
        if (a.nombre === 'Sin clasificar') return 1;
        if (b.nombre === 'Sin clasificar') return -1;
        return a.nombre.localeCompare(b.nombre);
      });

    return NextResponse.json({
      categoryId: slug,
      grupos,
    });
  } catch (error) {
    console.error('Error fetching category structure:', error);
    return NextResponse.json(
      { error: 'Error al obtener estructura de categoría' },
      { status: 500 }
    );
  }
}
