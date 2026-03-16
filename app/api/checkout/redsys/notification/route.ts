import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedsysApi } from '@/app/lib/redsys';
import { isResponseCodeOk, getResponseCodeMessage } from 'redsys-easy';

const N8N_WEBHOOK_URL = 'https://n8n.lulamartinezperez.com/webhook/pedido-confirmado';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REDSYS_SECRET_KEY) {
      return NextResponse.json(
        { error: 'El TPV no está configurado correctamente. Falta configuración de Redsys.' },
        { status: 500 },
      );
    }

    // Redsys envía la notificación como application/x-www-form-urlencoded
    // Leemos el cuerpo como texto y lo parseamos a objeto antes de pasarlo a redsys-easy.
    const contentType = request.headers.get('content-type') || '';
    let body: any;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const parsed: Record<string, string> = {};
      params.forEach((value, key) => {
        parsed[key] = value;
      });
      body = parsed;
    } else if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Fallback genérico: intentar formData, luego text
      try {
        const formData = await request.formData();
        const parsed: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') {
            parsed[key] = value;
          }
        }
        body = parsed;
      } catch {
        const text = await request.text();
        const params = new URLSearchParams(text);
        const parsed: Record<string, string> = {};
        params.forEach((value, key) => {
          parsed[key] = value;
        });
        body = parsed;
      }
    }

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
      include: { items: true },
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

    if (ok) {
      try {
        const webhookPayload = {
          orderNumber: order.orderNumber,
          customer: {
            nombre: order.nombre ?? '',
            apellidos: order.apellidos ?? '',
            nifCif: order.nifCif ?? null,
            direccion: {
              calle: order.direccion ?? '',
              piso: order.piso ?? null,
              codigoPostal: order.codigoPostal ?? '',
              ciudad: order.ciudad ?? '',
              provincia: order.provincia ?? '',
              completa: order.direccionCompleta ?? '',
            },
            nombreCompleto: order.nombreCompleto ?? `${order.nombre ?? ''} ${order.apellidos ?? ''}`.trim(),
            direccionLegacy: order.direccionCompleta ?? '',
            nombreCentro: order.nombreCentro ?? null,
            email: order.email,
            telefono: order.telefono,
            paymentMethod: order.paymentMethod ?? 'redsys',
          },
          items: order.items.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: Number(item.price),
            subtotal: Number(item.subtotal),
            variantId: item.variantId,
            color: null,
            talla: null,
          })),
          coupon: order.couponCode
            ? { code: order.couponCode, discountAmount: order.discountAmount ? Number(order.discountAmount) : 0 }
            : null,
          total: Number(order.total),
        };

        const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        if (webhookResponse.ok) {
          console.log('[Redsys Notification] Webhook n8n enviado correctamente para pedido', order.orderNumber);
        } else {
          const responseText = await webhookResponse.text();
          console.error('[Redsys Notification] Webhook n8n respondió con error:', webhookResponse.status, responseText);
        }
      } catch (webhookError: unknown) {
        console.error('[Redsys Notification] Error al enviar webhook n8n (no se interrumpe el flujo):', webhookError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Redsys Notification] Error procesando notificación:', error);
    return NextResponse.json({ error: 'Error interno procesando la notificación' }, { status: 500 });
  }
}

