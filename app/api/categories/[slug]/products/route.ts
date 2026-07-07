import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeImages } from '@/app/lib/imageUtils';
import {
  attachVariantInfoToProducts,
  convertProductsToClient,
} from '@/app/lib/productUtils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    
    const products = await prisma.product.findMany({
      where: {
        categoryId: slug,
        published: true,
        visible_web: true,
        activo: true,
      },
      orderBy: {
        name: 'asc',
      },
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

    const productIds = products.map((p) => p.id);
    const variantRows =
      productIds.length > 0
        ? await prisma.productVariant.findMany({
            where: {
              productId: { in: productIds },
              activo: true,
              visible_web: true,
            },
            select: { productId: true, stock: true, price: true },
          })
        : [];

    const enrichedProducts = attachVariantInfoToProducts(
      products,
      variantRows.map((r) => ({
        productId: r.productId,
        stock: r.stock,
        price: r.price != null ? Number(r.price) : null,
      }))
    );

    const withHasStock = convertProductsToClient(
      enrichedProducts.map((p) => ({
        ...p,
        images: normalizeImages(p.images),
      }))
    );

    return NextResponse.json(withHasStock);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
