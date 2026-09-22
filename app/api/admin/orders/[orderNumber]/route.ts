import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unauthorizedAdminResponse, validateAdminAuth } from '@/app/lib/adminAuth';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

function serializeOrder(order: {
  total: { toString(): string } | number;
  discountAmount: { toString(): string } | number | null;
  shippingCost: { toString(): string } | number | null;
  items: Array<{
    price: { toString(): string } | number;
    subtotal: { toString(): string } | number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}) {
  return {
    ...order,
    total: Number(order.total),
    discountAmount: order.discountAmount != null ? Number(order.discountAmount) : null,
    shippingCost: order.shippingCost != null ? Number(order.shippingCost) : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> }
) {
  if (!validateAdminAuth(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { orderNumber } = await context.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error('[Admin Orders] GET detail error:', error);
    return NextResponse.json({ error: 'Error al obtener el pedido' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> }
) {
  if (!validateAdminAuth(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { orderNumber } = await context.params;
    const body = await request.json();
    const nextStatus = body?.status as string | undefined;

    if (!nextStatus || !ORDER_STATUSES.includes(nextStatus as OrderStatus)) {
      return NextResponse.json(
        { error: `Estado inválido. Usa: ${ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (order.status === nextStatus) {
      return NextResponse.json({ order: serializeOrder(order) });
    }

    if (order.status === 'CANCELLED' && nextStatus !== 'CANCELLED') {
      return NextResponse.json(
        {
          error:
            'Un pedido anulado no se puede reabrir desde el panel (el stock ya se pudo haber repuesto).',
        },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Al anular: reponer stock una sola vez
      if (nextStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus as OrderStatus },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      });
    });

    return NextResponse.json({
      order: serializeOrder(updated),
      stockRestored: nextStatus === 'CANCELLED' && order.status !== 'CANCELLED',
    });
  } catch (error) {
    console.error('[Admin Orders] PATCH error:', error);
    return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 });
  }
}
