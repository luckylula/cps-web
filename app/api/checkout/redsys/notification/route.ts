import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedsysApi } from '@/app/lib/redsys';
import { isResponseCodeOk, getResponseCodeMessage } from 'redsys-easy';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REDSYS_SECRET_KEY) {
      return NextResponse.json(
        { error: 'El TPV no está configurado correctamente. Falta configuración de Redsys.' },
        { status: 500 },
      );
    }

    const body = await request.json();

    let notification;
    try {
      const redsysApi = getRedsysApi();
      notification = redsysApi.processDirectRestNotification(body);
    } catch (err) {
      console.error('[Redsys Notification] Error verificando firma:', err);
      return NextResponse.json({ error: 'Notificación no válida' }, { status: 400 });
    }

    const redsysOrderId = notification.Ds_Order;
    const responseCode = notification.Ds_Response;

    if (!redsysOrderId) {
      console.error('[Redsys Notification] Falta Ds_Order en la notificación');
      return NextResponse.json({ error: 'Notificación incompleta' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { redsysOrderId },
    });

    if (!order) {
      console.error('[Redsys Notification] Pedido no encontrado para redsysOrderId:', redsysOrderId);
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const ok = isResponseCodeOk(responseCode);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: ok ? 'CONFIRMED' : 'CANCELLED',
      },
    });

    console.log('[Redsys Notification] Pedido', order.orderNumber, 'actualizado a', ok ? 'CONFIRMED' : 'CANCELLED');
    if (!ok) {
      console.log('[Redsys Notification] Código de respuesta:', responseCode, '-', getResponseCodeMessage(responseCode));
    }

    // Respuesta 200 para que Redsys no reintente
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Redsys Notification] Error procesando notificación:', error);
    return NextResponse.json({ error: 'Error interno procesando la notificación' }, { status: 500 });
  }
}

