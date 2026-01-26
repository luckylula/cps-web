import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const grupo = searchParams.get('grupo');
    const limit = searchParams.get('limit');
    const excludeId = searchParams.get('excludeId');
    const search = searchParams.get('search');
    const marca = searchParams.get('marca');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build where clause - filtros base para productos visibles
    // Excluir productos que son variantes (tienen color/talla pero NO tienen variantes asociadas)
    // Solo mostrar productos padre (sin variantes) o productos que no tienen variantes
    const where: any = {
      visible_web: true,
      activo: true,
      name: {
        not: '',
      },
    };

    // Excluir productos que tienen sku_interno terminando en "-BASE" (restos antiguos)
    const skuFilter: any[] = [
      {
        sku_interno: null,
      },
      {
        sku_interno: {
          not: {
            endsWith: '-BASE',
          },
        },
      },
    ];

    // Search functionality - search in product name, SKU, or marca
    if (search && search.trim().length >= 2) {
      const searchTerm = search.trim();
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          sku_interno: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          marca: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
      // Combinar con el filtro de SKU
      where.AND = [
        {
          OR: skuFilter,
        },
      ];
    } else {
      // Si no hay búsqueda, aplicar el filtro de SKU directamente
      where.OR = skuFilter;
    }

    // Filter by categoryId (now TEXT, not FK)
    if (category) {
      where.categoryId = category;
    }

    // Filter by subcategory (puede contener ">" para jerarquías)
    if (subcategory) {
      const trimmedSubcategory = decodeURIComponent(subcategory.trim());
      where.subcategory = trimmedSubcategory;
    }

    // Filter by grupo
    if (grupo) {
      const trimmedGrupo = decodeURIComponent(grupo.trim());
      where.grupo = trimmedGrupo;
    }

    // Filter by marca
    if (marca) {
      where.marca = {
        contains: marca.trim(),
        mode: 'insensitive',
      };
    }

    // Filter by price range (only for products with price)
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
      // Only show products that have a price
      where.price.not = null;
    }

    if (excludeId) {
      where.id = { not: parseInt(excludeId) };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
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