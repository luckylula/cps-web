import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeImages } from '@/app/lib/imageUtils';
import { normalizeVariantPrices } from '@/app/lib/productUtils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);
    
    console.log('[API] Fetching product with slug:', slug);

    // Buscar producto por slug con sus variantes
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
      },
      include: {
        variants: {
          where: {
            activo: true,
            visible_web: true,
          },
          orderBy: [
            { color: 'asc' },
            { talla: 'asc' },
          ],
        },
      },
    });

    console.log('[API] Product found:', product ? `${product.name} (visible_web: ${product.visible_web}, activo: ${product.activo})` : 'null');

    if (!product) {
      console.log('[API] Product not found for slug:', slug);
      return NextResponse.json(
        { error: 'Producto no encontrado', slug: slug },
        { status: 404 }
      );
    }

    // Verificar que esté visible y activo
    if (!product.visible_web || !product.activo) {
      console.log('[API] Product exists but is not visible or active:', slug);
      return NextResponse.json(
        { error: 'Producto no disponible', slug: slug },
        { status: 404 }
      );
    }

    // Obtener información de categoría (categoryId es TEXT, no FK)
    const category = await prisma.category.findUnique({
      where: {
        id: product.categoryId,
      },
    });

    const productPrice = product.price != null ? Number(product.price) : null;
    const normalizedVariants = normalizeVariantPrices(product.variants, productPrice);

    const productWithCategory = {
      ...product,
      price: productPrice,
      variants: normalizedVariants,
      images: normalizeImages(product.images ?? []),
      category: category || {
        id: product.categoryId,
        name: product.categoryId.charAt(0).toUpperCase() + product.categoryId.slice(1),
        slug: product.categoryId,
      },
    };

    console.log('[API] Returning product:', product.id);
    return NextResponse.json(productWithCategory);
  } catch (error: any) {
    console.error('[API] Error fetching product:', error);
    console.error('[API] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Error al obtener el producto',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}
