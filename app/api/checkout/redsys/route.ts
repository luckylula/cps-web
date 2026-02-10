import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedsysAPI, getRedsysConfig, generateRedsysOrderId, isRedsysConfigured } from '@/lib/redsys';
import { TRANSACTION_TYPES } from 'redsys-easy';

export const dynamic = 'force-dynamic';

// Same validation and order creation logic as /api/orders - we create order first, then redirect to Redsys
interface OrderItemInput {
  id: string;
  productId?: number;
  variantId?: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
}

interface CreateRedsysOrderRequest {
  customer: {
    nombre: string;
    apellidos: string;
    nifCif?: string;
    direccion: string;
    piso?: string;
    codigoPostal: string;
    ciudad: string;
    provincia: string;
    nombreCentro?: string;
    email: string;
    telefono: string;
    metodoEntrega?: string;
  };
  cart: { items: OrderItemInput[]; totalPrice: number };
  coupon?: { code: string; discountAmount: number };
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  if (!isRedsysConfigured()) {
    return NextResponse.json(
      { error: 'Redsys no está configurado. Configura REDSYS_MERCHANT_CODE, REDSYS_TERMINAL y REDSYS_SECRET_KEY.' },
      { status: 503 }
    );
  }

  try {
    const body: CreateRedsysOrderRequest = await request.json();
    const { customer, cart, coupon } = body;

    if (!customer || !cart?.items?.length) {
      return NextResponse.json({ error: 'Datos del pedido incompletos' }, { status: 400 });
    }

    if (!customer.nombre || !customer.apellidos || !customer.email || !customer.telefono ||
        !customer.direccion || !customer.codigoPostal || !customer.ciudad || !customer.provincia) {
      return NextResponse.json({ error: 'Faltan datos obligatorios del cliente' }, { status: 400 });
    }

    const finalTotal = cart.totalPrice;
    if (finalTotal <= 0) {
      return NextResponse.json({ error: 'El total debe ser mayor a 0' }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const redsysOrderId = generateRedsysOrderId();

    // Create order with PENDING status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        redsysOrderId,
        nombreCompleto: `${customer.nombre} ${customer.apellidos}`.trim(),
        nombre: customer.nombre,
        apellidos: customer.apellidos,
        nombreCentro: customer.nombreCentro || null,
        email: customer.email,
        telefono: customer.telefono,
        direccion: customer.direccion,
        piso: customer.piso || null,
        codigoPostal: customer.codigoPostal,
        ciudad: customer.ciudad,
        provincia: customer.provincia,
        direccionCompleta: [customer.direccion, customer.piso, customer.codigoPostal, customer.ciudad, customer.provincia]
          .filter(Boolean)
          .join(', '),
        nifCif: customer.nifCif || null,
        total: finalTotal,
        status: 'PENDING',
        paymentMethod: 'redsys',
        couponCode: coupon?.code || null,
        discountAmount: coupon?.discountAmount ? coupon.discountAmount : null,
        items: {
          create: cart.items.map((item) => {
            const productId = item.productId ?? parseInt(String(item.id).replace(/^product-/, '').replace(/^variant-/, ''), 10);
            return {
              productName: item.name,
              productSlug: item.slug,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
              productId: isNaN(productId) ? 0 : productId,
              variantId: item.variantId ?? null,
            };
          }),
        },
      },
      include: { items: true },
    });

    const { merchantCode, terminal } = getRedsysConfig();
    const baseUrl = process.env.NEXT_PUBLIC_URL || request.nextUrl.origin;

    const redsys = getRedsysAPI();
    const form = redsys.createRedirectForm({
      DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPES.AUTHORIZATION,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_TERMINAL: terminal,
      DS_MERCHANT_ORDER: redsysOrderId,
      DS_MERCHANT_AMOUNT: String(Math.round(finalTotal * 100)), // cents
      DS_MERCHANT_CURRENCY: '978', // EUR
      DS_MERCHANT_MERCHANTNAME: 'Control Play',
      DS_MERCHANT_PRODUCTDESCRIPTION: `Pedido ${orderNumber}`,
      DS_MERCHANT_TITULAR: `${customer.nombre} ${customer.apellidos}`.trim(),
      DS_MERCHANT_MERCHANTURL: `${baseUrl}/api/checkout/redsys/notification`,
      DS_MERCHANT_URLOK: `${baseUrl}/carrito/checkout/redsys/success?order=${redsysOrderId}`,
      DS_MERCHANT_URLKO: `${baseUrl}/carrito/checkout/redsys/cancel?order=${redsysOrderId}`,
    });

    return NextResponse.json({
      orderNumber,
      orderId: order.id,
      redsysOrderId,
      form: {
        formAction: form.url,
        formParams: form.body,
      },
    });
  } catch (error) {
    console.error('[Redsys] Error creating payment:', error);
    return NextResponse.json(
      { error: 'Error al crear el pago. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
