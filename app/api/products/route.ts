import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const limit = searchParams.get('limit');
    const excludeId = searchParams.get('excludeId');
    const search = searchParams.get('search');
    const marca = searchParams.get('marca');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build where clause - filtros base para productos visibles
    const where: any = {
      visible_web: true,
      activo: true,
    };

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
    }

    // Filter by categoryId (now TEXT, not FK)
    if (category) {
      where.categoryId = category;
    }

    // Filter by subcategory
    if (subcategory) {
      const trimmedSubcategory = subcategory.trim();
      where.subcategory = trimmedSubcategory;
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