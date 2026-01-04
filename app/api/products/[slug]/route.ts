import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);
    
    console.log('[API] Fetching product with slug:', slug);

    // findUnique solo puede usar campos únicos, así que primero buscamos por slug
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
      },
      include: {
        category: true,
      },
    });

    console.log('[API] Product found:', product ? `${product.name} (published: ${product.published})` : 'null');

    if (!product) {
      console.log('[API] Product not found for slug:', slug);
      return NextResponse.json(
        { error: 'Producto no encontrado', slug: slug },
        { status: 404 }
      );
    }

    // Verificar que esté publicado
    if (!product.published) {
      console.log('[API] Product exists but is not published:', slug);
      return NextResponse.json(
        { error: 'Producto no disponible', slug: slug },
        { status: 404 }
      );
    }

    console.log('[API] Returning product:', product.id);
    return NextResponse.json(product);
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
