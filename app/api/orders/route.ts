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
    nifCif?: string;
    metodoEntrega?: string;
    paymentMethod?: string;
  };
  cart: {
    items: OrderItemInput[];
    totalPrice: number;
  };
  coupon?: {
    code: string;
    discountAmount: number;
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
          couponCode: body.coupon?.code || null,
          discountAmount: body.coupon?.discountAmount 
            ? new Prisma.Decimal(body.coupon.discountAmount) 
            : null,
          paymentMethod: body.customer.paymentMethod || null,
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

    // Enviar notificación a n8n webhook (con await para capturar errores en Vercel)
    const webhookUrl = 'https://n8n.lulamartinezperez.com/webhook/ee1cb178-8a08-4aaf-a19f-281fbb640d58';
    
    // Preparar datos para el webhook
    const webhookPayload = {
      orderNumber: order.orderNumber,
      customer: {
        nombreCompleto: customer.nombreCompleto,
        nombreCentro: customer.nombreCentro || null,
        email: customer.email,
        telefono: customer.telefono,
        direccion: customer.direccion,
        paymentMethod: customer.paymentMethod || null,
      },
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })),
      coupon: order.couponCode ? {
        code: order.couponCode,
        discountAmount: order.discountAmount ? Number(order.discountAmount) : 0,
      } : null,
      total: Number(order.total),
    };

    console.log('==========================================');
    console.log('[API Orders] 🚀 Enviando petición a n8n');
    console.log('[API Orders] URL:', webhookUrl);
    console.log('[API Orders] Método: POST');
    console.log('[API Orders] Payload completo:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    console.log('==========================================');

    try {
      // Llamada al webhook CON await para capturar errores
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      console.log('[API Orders] ✅ Respuesta recibida de n8n');
      console.log('[API Orders] Status:', webhookResponse.status, webhookResponse.statusText);
      
      if (webhookResponse.ok) {
        console.log('[API Orders] ✅ Webhook procesado exitosamente por n8n');
      } else {
        // Leer el cuerpo de la respuesta para más detalles
        const responseText = await webhookResponse.text();
        console.error('==========================================');
        console.error('[API Orders] ❌ Webhook respondió con error:');
        console.error('[API Orders] Status:', webhookResponse.status);
        console.error('[API Orders] Status Text:', webhookResponse.statusText);
        console.error('[API Orders] Response Headers:', Object.fromEntries(webhookResponse.headers.entries()));
        console.error('[API Orders] Response Body:', responseText);
        console.error('[API Orders] URL:', webhookUrl);
        console.error('[API Orders] Payload enviado:', JSON.stringify(webhookPayload, null, 2));
        console.error('==========================================');
        console.error('[API Orders] El pedido se ha creado correctamente en la base de datos, pero n8n respondió con error.');
      }
    } catch (webhookError: any) {
      // Debug total del error
      console.error('==========================================');
      console.error('[API Orders] ❌ ERROR COMPLETO al enviar webhook a n8n:');
      console.error('[API Orders] Tipo de error:', webhookError.constructor.name);
      console.error('[API Orders] Mensaje:', webhookError.message);
      console.error('[API Orders] Stack:', webhookError.stack);
      console.error('[API Orders] URL intentada:', webhookUrl);
      console.error('[API Orders] Payload enviado:', JSON.stringify(webhookPayload, null, 2));
      
      // Detalles adicionales si es un error de red
      if (webhookError.cause) {
        console.error('[API Orders] Error cause:', webhookError.cause);
      }
      if (webhookError.code) {
        console.error('[API Orders] Error code:', webhookError.code);
      }
      if (webhookError.errno) {
        console.error('[API Orders] Error errno:', webhookError.errno);
      }
      console.error('==========================================');
      console.error('[API Orders] El pedido se ha creado correctamente en la base de datos, pero n8n no fue notificado.');
    }

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
