import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedsysAPI, isRedsysConfigured } from '@/lib/redsys';
import { isResponseCodeOk } from 'redsys-easy';

export const dynamic = 'force-dynamic';

/**
 * Redsys sends a POST with JSON body when payment completes.
 * We verify the signature and update the order status.
 */
export async function POST(request: NextRequest) {
  if (!isRedsysConfigured()) {
    return NextResponse.json({ error: 'Redsys not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const redsys = getRedsysAPI();

    const notification = redsys.processRestNotification(body);
    const { order: redsysOrderId, response: responseCode } = notification;

    if (!isResponseCodeOk(responseCode)) {
      console.error('[Redsys Notification] Payment failed for order', redsysOrderId, 'code:', responseCode);
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({
      where: { redsysOrderId },
    });

    if (!order) {
      console.error('[Redsys Notification] Order not found:', redsysOrderId);
      return NextResponse.json({ received: true });
    }

    if (order.status !== 'PENDING') {
      console.log('[Redsys Notification] Order already processed:', redsysOrderId);
      return NextResponse.json({ received: true });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' },
    });

    console.log('[Redsys Notification] Order confirmed:', order.orderNumber);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Redsys Notification] Error:', error);
    return NextResponse.json({ error: 'Invalid notification' }, { status: 400 });
  }
}
