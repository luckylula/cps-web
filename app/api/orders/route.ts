import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';

interface OrderItemInput {
  id: string;
  productId?: number;
  variantId?: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  color?: string | null;
  talla?: string | null;
}

interface CreateOrderRequest {
  customer: {
    // Nombre separado
    nombre: string;
    apellidos: string;
    nifCif?: string;
    requestInvoice?: boolean;

    // Dirección detallada
    direccion: string;        // Calle y número
    piso?: string;
    codigoPostal: string;
    ciudad: string;
    provincia: string;

    // Información de contacto
    nombreCentro?: string;
    email: string;
    telefono: string;

    // Opciones
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

    // Validar campos obligatorios del cliente
    if (!customer.nombre || !customer.apellidos || !customer.email ||
        !customer.telefono || !customer.direccion || !customer.codigoPostal ||
        !customer.ciudad || !customer.provincia) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios del cliente' },
        { status: 400 }
      );
    }

    // Validar nombre: solo letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(customer.nombre.trim())) {
      return NextResponse.json(
        { error: 'El nombre solo debe contener letras' },
        { status: 400 }
      );
    }

    // Validar apellidos: solo letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(customer.apellidos.trim())) {
      return NextResponse.json(
        { error: 'Los apellidos solo deben contener letras' },
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

    // Validar código postal: exactamente 5 dígitos
    if (!/^[0-9]{5}$/.test(customer.codigoPostal)) {
      return NextResponse.json(
        { error: 'El código postal debe tener exactamente 5 dígitos' },
        { status: 400 }
      );
    }

    // Validar NIF/CIF si se proporciona
    if (customer.nifCif && customer.nifCif.trim()) {
      const nifPattern = /^[0-9XYZ][0-9]{7}[A-Z]$/i;
      const cifPattern = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;
      if (!nifPattern.test(customer.nifCif) && !cifPattern.test(customer.nifCif)) {
        return NextResponse.json(
          { error: 'Formato de NIF/CIF inválido' },
          { status: 400 }
        );
      }
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
    // Extraer productIds y variantIds
    const productIds = cart.items
      .map((item) => item.productId || parseInt(item.id.replace('product-', '').replace('variant-', '')))
      .filter((id): id is number => !isNaN(id));
    
    const variantIds = cart.items
      .map((item) => item.variantId)
      .filter((id): id is number => id !== undefined && !isNaN(id));

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: { variants: true },
    });

    const variants = variantIds.length > 0
      ? await prisma.productVariant.findMany({
          where: {
            id: { in: variantIds },
          },
        })
      : [];

    if (products.length !== new Set(productIds).size) {
      return NextResponse.json(
        { error: 'Uno o más productos no existen' },
        { status: 400 }
      );
    }

    /** Stock disponible: variantes → suma; si no, product.stock. Nunca negativo. */
    function getProductAvailableStock(product: { stock: number; variants?: { stock: number }[] }): number {
      const raw = product.variants?.length
        ? product.variants.reduce((sum, v) => sum + v.stock, 0)
        : product.stock;
      return Math.max(0, raw);
    }

    const stockIssues: string[] = [];
    for (const item of cart.items) {
      if (item.variantId) {
        const variant = variants.find((v) => v.id === item.variantId);
        const variantStock = variant ? Math.max(0, variant.stock) : 0;
        if (variant && variantStock < item.quantity) {
          stockIssues.push(
            `${item.name}: Stock disponible ${variantStock}, solicitado ${item.quantity}`
          );
        }
      } else {
        const product = products.find((p) => p.id === (item.productId || parseInt(item.id.replace('product-', ''))));
        const available = product ? getProductAvailableStock(product) : 0;
        if (product && available < item.quantity) {
          stockIssues.push(
            `${item.name}: Stock disponible ${available}, solicitado ${item.quantity}`
          );
        }
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

    // Calcular coste de envío en servidor a partir del total (precios ya incluyen IVA)
    const itemsSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const couponDiscount = body.coupon?.discountAmount ?? 0;
    const rawShippingCost = cart.totalPrice - itemsSubtotal + couponDiscount;
    const shippingCostNumber = Math.max(0, Number(rawShippingCost.toFixed(2)));

    // Crear el pedido y sus items en una transacción
    const order = await prisma.$transaction(async (tx) => {
      // Construir direccionCompleta para compatibilidad legacy
      const direccionCompleta = [
        customer.direccion,
        customer.piso ? `Piso: ${customer.piso}` : null,
        customer.codigoPostal,
        customer.ciudad,
        customer.provincia,
      ].filter(Boolean).join(', ');

      // Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          // Nuevos campos separados
          nombre: customer.nombre.trim(),
          apellidos: customer.apellidos.trim(),
          nifCif: customer.nifCif?.trim() || null,
          direccion: customer.direccion.trim(),
          piso: customer.piso?.trim() || null,
          codigoPostal: customer.codigoPostal.trim(),
          ciudad: customer.ciudad.trim(),
          provincia: customer.provincia.trim(),
          // Campos legacy para compatibilidad
          nombreCompleto: `${customer.nombre.trim()} ${customer.apellidos.trim()}`,
          direccionCompleta,
          // Información de contacto
          nombreCentro: customer.nombreCentro?.trim() || null,
          email: customer.email.trim(),
          telefono: customer.telefono.trim(),
          // Información del pedido
          total: new Prisma.Decimal(cart.totalPrice),
          shippingCost: shippingCostNumber ? new Prisma.Decimal(shippingCostNumber) : null,
          couponCode: body.coupon?.code || null,
          discountAmount: body.coupon?.discountAmount
            ? new Prisma.Decimal(body.coupon.discountAmount)
            : null,
          paymentMethod: body.customer.paymentMethod || null,
          status: 'PENDING',
          items: {
            create: cart.items.map((item) => {
              const productId = item.productId || parseInt(item.id.replace('product-', '').replace('variant-', ''));
              const product = products.find((p) => p.id === productId)!;
              const price = new Prisma.Decimal(item.price);
              const subtotal = price.mul(item.quantity);

              return {
                productId: productId,
                variantId: item.variantId || null,
                productName: item.name,
                productSlug: item.slug,
                quantity: item.quantity,
                price,
                subtotal,
                proveedor: product.proveedor ?? null,
              };
            }),
          },
        },
        include: {
          items: {
            select: {
              id: true,
              productId: true,
              variantId: true,
              productName: true,
              productSlug: true,
              quantity: true,
              price: true,
              subtotal: true,
              proveedor: true,
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

      // Restar stock de los productos/variantes (opcional)
      for (const item of cart.items) {
        if (item.variantId) {
          // Restar stock de la variante
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          // Restar stock del producto
          const productId = item.productId || parseInt(item.id.replace('product-', '').replace('variant-', ''));
          await tx.product.update({
            where: { id: productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newOrder;
    });

    // Enviar notificación a n8n webhook (con await para capturar errores en Vercel)
    const webhookUrl = 'https://n8n.lulamartinezperez.com/webhook/pedido-confirmado';
    
    // Preparar datos para el webhook (estructura nueva + legacy para compatibilidad)
    const webhookPayload = {
      orderNumber: order.orderNumber,
      customer: {
        // Estructura nueva (separada)
        nombre: customer.nombre,
        apellidos: customer.apellidos,
        nifCif: customer.nifCif || null,
        direccion: {
          calle: customer.direccion,
          piso: customer.piso || null,
          codigoPostal: customer.codigoPostal,
          ciudad: customer.ciudad,
          provincia: customer.provincia,
          completa: order.direccionCompleta, // legacy
        },
        // Campos legacy (para compatibilidad)
        nombreCompleto: `${customer.nombre} ${customer.apellidos}`,
        direccionLegacy: order.direccionCompleta,
        // Información de contacto
        nombreCentro: customer.nombreCentro || null,
        email: customer.email,
        telefono: customer.telefono,
        paymentMethod: customer.paymentMethod || null,
        requestInvoice: Boolean(customer.requestInvoice),
      },
      items: order.items.map((item, index) => {
        const cartItem = cart.items[index];
        return {
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.subtotal),
          variantId: item.variantId || null,
          proveedor: item.proveedor ?? null,
          color: cartItem?.color || null,
          talla: cartItem?.talla || null,
        };
      }),
      coupon: order.couponCode ? {
        code: order.couponCode,
        discountAmount: order.discountAmount ? Number(order.discountAmount) : 0,
      } : null,
      total: Number(order.total),
      requestInvoice: Boolean(customer.requestInvoice),
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
