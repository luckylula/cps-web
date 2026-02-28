import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeImages } from '@/app/lib/imageUtils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+)
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
