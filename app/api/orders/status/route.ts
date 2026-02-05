import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const redsysOrderId = request.nextUrl.searchParams.get('redsysOrderId');
  if (!redsysOrderId) {
    return NextResponse.json({ error: 'Missing redsysOrderId' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { redsysOrderId },
    select: { status: true, orderNumber: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ status: order.status, orderNumber: order.orderNumber });
}
