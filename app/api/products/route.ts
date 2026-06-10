import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';
import { normalizeImages } from '@/app/lib/imageUtils';
import { sqlAccentInsensitiveContains } from '@/app/lib/searchUtils';

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
      published: true,
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

    const hasSearch = Boolean(search && search.trim().length >= 2);

    if (!hasSearch) {
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

    type ProductRow = {
      id: number;
      name: string;
      slug: string;
      price: Prisma.Decimal | null;
      images: string[];
      featured: boolean;
      marca: string | null;
      sku_interno: string | null;
      stock: number;
      categoryId: string;
    };

    let products: ProductRow[];

    if (hasSearch) {
      const searchTerm = search!.trim();
      const conditions: Prisma.Sql[] = [
        Prisma.sql`published = true`,
        Prisma.sql`visible_web = true`,
        Prisma.sql`activo = true`,
        Prisma.sql`name <> ''`,
        Prisma.sql`(sku_interno IS NULL OR sku_interno NOT LIKE '%' || '-BASE')`,
        Prisma.sql`(
          ${sqlAccentInsensitiveContains('name', searchTerm)}
          OR ${sqlAccentInsensitiveContains('sku_interno', searchTerm)}
          OR ${sqlAccentInsensitiveContains('marca', searchTerm)}
        )`,
      ];

      if (category) conditions.push(Prisma.sql`"categoryId" = ${category}`);
      if (subcategory) {
        conditions.push(Prisma.sql`subcategory = ${decodeURIComponent(subcategory.trim())}`);
      }
      if (grupo) conditions.push(Prisma.sql`grupo = ${decodeURIComponent(grupo.trim())}`);
      if (marca) conditions.push(sqlAccentInsensitiveContains('marca', marca.trim()));
      if (minPrice) conditions.push(Prisma.sql`price >= ${parseFloat(minPrice)}`);
      if (maxPrice) conditions.push(Prisma.sql`price <= ${parseFloat(maxPrice)}`);
      if (minPrice || maxPrice) conditions.push(Prisma.sql`price IS NOT NULL`);
      if (excludeId) conditions.push(Prisma.sql`id <> ${parseInt(excludeId)}`);

      const limitValue = limit ? parseInt(limit) : null;
      products = await prisma.$queryRaw<ProductRow[]>`
        SELECT
          id,
          name,
          slug,
          price,
          images,
          featured,
          marca,
          sku_interno,
          stock,
          "categoryId"
        FROM "Product"
        WHERE ${Prisma.join(conditions, ' AND ')}
        ORDER BY name ASC
        ${limitValue ? Prisma.sql`LIMIT ${limitValue}` : Prisma.empty}
      `;
    } else {
      products = await prisma.product.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        ...(limit && { take: parseInt(limit) }),
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          featured: true,
          marca: true,
          sku_interno: true,
          stock: true,
          categoryId: true,
        },
      });
    }

    const productIds = products.map((p) => p.id);
    const variantRows =
      productIds.length > 0
        ? await prisma.productVariant.findMany({
            where: { productId: { in: productIds } },
            select: { productId: true, stock: true },
          })
        : [];
    const productIdsWithVariants = new Set(variantRows.map((r) => r.productId));
    const productIdsWithVariantStock = new Set(
      variantRows.filter((r) => r.stock > 0).map((r) => r.productId)
    );

    const withHasStock = products.map((p) => {
      const rawImages = p.images;
      const images = normalizeImages(rawImages);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price != null ? Number(p.price) : null,
        images,
        featured: Boolean(p.featured),
        marca: p.marca ?? null,
        sku_interno: p.sku_interno ?? null,
        stock: Number(p.stock),
        categoryId: p.categoryId,
        hasStock: productIdsWithVariants.has(p.id)
          ? productIdsWithVariantStock.has(p.id)
          : p.stock > 0,
      };
    });

    return NextResponse.json(withHasStock);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}