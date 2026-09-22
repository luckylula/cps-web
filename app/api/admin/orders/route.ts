import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unauthorizedAdminResponse, validateAdminAuth } from '@/app/lib/adminAuth';

export async function GET(request: Request) {
  if (!validateAdminAuth(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q')?.trim() || '';
    const take = Math.min(Number(searchParams.get('take') || 50), 200);
    const skip = Math.max(Number(searchParams.get('skip') || 0), 0);

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { nombre: { contains: q, mode: 'insensitive' } },
        { apellidos: { contains: q, mode: 'insensitive' } },
        { nombreCompleto: { contains: q, mode: 'insensitive' } },
        { telefono: { contains: q, mode: 'insensitive' } },
        { nombreCentro: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentMethod: true,
          email: true,
          nombre: true,
          apellidos: true,
          nombreCompleto: true,
          nombreCentro: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      total,
      orders: orders.map((o) => ({
        ...o,
        total: Number(o.total),
        itemCount: o._count.items,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error('[Admin Orders] GET list error:', error);
    return NextResponse.json({ error: 'Error al listar pedidos' }, { status: 500 });
  }
}
