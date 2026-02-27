import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redsysOrderId = searchParams.get('redsysOrderId');
    const orderNumber = searchParams.get('orderNumber');

    if (!redsysOrderId && !orderNumber) {
      return NextResponse.json(
        { error: 'Debes proporcionar redsysOrderId o orderNumber' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: redsysOrderId ? { redsysOrderId } : { orderNumber: orderNumber! },
    });

    if (!order) {
      return NextResponse.json({ status: 'NOT_FOUND' }, { status: 200 });
    }

    return NextResponse.json(
      {
        status: order.status,
        orderNumber: order.orderNumber,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Orders Status] Error obteniendo estado del pedido:', error);
    return NextResponse.json(
      { error: 'Error interno obteniendo estado del pedido' },
      { status: 500 },
    );
  }
}

