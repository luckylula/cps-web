import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';

interface OrderItemInput {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
}

interface CreateOrderRequest {
  customer: {
    nombreCompleto: string;
    nombreCentro?: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  cart: {
    items: OrderItemInput[];
    totalPrice: number;
  };
}

// Generar número de pedido único
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validar datos requeridos
    if (!body.customer || !body.cart || !body.cart.items || body.cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Datos del pedido incompletos' },
        { status: 400 }
      );
    }

    const { customer, cart } = body;

    // Validar campos del cliente
    if (!customer.nombreCompleto || !customer.email || !customer.telefono || !customer.direccion) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios del cliente' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return NextResponse.json(
        { error: 'Email no válido' },
        { status: 400 }
      );
    }

    // Generar número de pedido único
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    const maxAttempts = 10;

    // Verificar que el número de pedido sea único
    while (attempts < maxAttempts) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber },
      });

      if (!existingOrder) {
        break;
      }

      orderNumber = generateOrderNumber();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Error al generar número de pedido. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // Verificar que todos los productos existan y tengan stock suficiente
    const productIds = cart.items.map((item) => item.id);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Uno o más productos no existen' },
        { status: 400 }
      );
    }

    // Verificar stock (opcional - solo si quieres restar stock)
    const stockIssues: string[] = [];
    for (const item of cart.items) {
      const product = products.find((p) => p.id === item.id);
      if (product && product.stock < item.quantity) {
        stockIssues.push(
          `${product.name}: Stock disponible ${product.stock}, solicitado ${item.quantity}`
        );
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json(
        {
          error: 'Stock insuficiente para algunos productos',
          details: stockIssues,
        },
        { status: 400 }
      );
    }

    // Crear el pedido y sus items en una transacción
    const order = await prisma.$transaction(async (tx) => {
      // Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          nombreCompleto: customer.nombreCompleto,
          nombreCentro: customer.nombreCentro || null,
          email: customer.email,
          telefono: customer.telefono,
          direccion: customer.direccion,
          total: new Prisma.Decimal(cart.totalPrice),
          status: 'PENDING',
          items: {
            create: cart.items.map((item) => {
              const product = products.find((p) => p.id === item.id)!;
              const price = new Prisma.Decimal(item.price);
              const subtotal = price.mul(item.quantity);

              return {
                productId: item.id,
                productName: item.name,
                productSlug: item.slug,
                quantity: item.quantity,
                price,
                subtotal,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // Restar stock de los productos (opcional)
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total.toString(),
          itemsCount: order.items.length,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear el pedido:', error);

    // Manejar errores de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'El número de pedido ya existe. Intenta de nuevo.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el pedido' },
      { status: 500 }
    );
  }
}
