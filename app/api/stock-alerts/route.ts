import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const productId = Number(body?.productId);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: 'Producto inválido' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, visible_web: true, activo: true },
    });

    if (!product || !product.visible_web || !product.activo) {
      return NextResponse.json({ error: 'Producto no disponible' }, { status: 404 });
    }

    const existing = await prisma.stockAlert.findFirst({
      where: { productId, email, active: true },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: 'Ya estabas suscrito para este producto',
      });
    }

    await prisma.stockAlert.create({
      data: {
        productId,
        email,
        active: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Te avisaremos cuando vuelva a estar disponible',
    });
  } catch (error: any) {
    console.error('[STOCK ALERT] Error creating alert:', error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo guardar el aviso de stock' },
      { status: 500 }
    );
  }
}
