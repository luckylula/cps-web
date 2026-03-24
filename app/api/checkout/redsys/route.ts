import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/client';
import { getRedsysApi, redsysMerchantCode, redsysMerchantName, redsysTerminal } from '@/app/lib/redsys';
import { randomTransactionId } from 'redsys-easy';

// Forzar runtime Node (las variables de entorno pueden no estar en Edge)
export const runtime = 'nodejs';

interface OrderItemInput {
  id: string;
  /** Puede ser numérico o cuid según el catálogo */
  productId?: number | string;
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
  cart: {
    items: OrderItemInput[];
    totalPrice: number;
  };
  coupon?: {
    code: string;
    discountAmount: number;
  };
}

function validateCustomer(customer: CreateOrderRequest['customer']) {
  if (
    !customer.nombre ||
    !customer.apellidos ||
    !customer.email ||
    !customer.telefono ||
    !customer.direccion ||
    !customer.codigoPostal ||
    !customer.ciudad ||
    !customer.provincia
  ) {
    return 'Faltan datos obligatorios del cliente';
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(customer.nombre.trim())) {
    return 'El nombre solo debe contener letras';
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(customer.apellidos.trim())) {
    return 'Los apellidos solo deben contener letras';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer.email)) {
    return 'Email no válido';
  }

  if (!/^[0-9]{5}$/.test(customer.codigoPostal)) {
    return 'El código postal debe tener exactamente 5 dígitos';
  }

  if (customer.nifCif && customer.nifCif.trim()) {
    const nifPattern = /^[0-9XYZ][0-9]{7}[A-Z]$/i;
    const cifPattern = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;
    if (!nifPattern.test(customer.nifCif) && !cifPattern.test(customer.nifCif)) {
      return 'Formato de NIF/CIF inválido';
    }
  }

  return null;
}

function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_URL no está configurado');
  }
  return url.replace(/\/+$/, '');
}

/**
 * Id de producto del carrito como string (nunca parseInt: puede ser cuid).
 * Con `variant-…` el sufijo es la variante; hace falta `productId` en el ítem.
 */
function cartProductIdKey(item: OrderItemInput): string {
  if (item.productId != null && String(item.productId).trim() !== '') {
    return String(item.productId);
  }
  const id = item.id;
  if (id.toLowerCase().startsWith('product-')) {
    return id.slice('product-'.length);
  }
  return '';
}

function findProductByCartItem<T extends { id: number }>(
  products: T[],
  item: OrderItemInput,
): T | undefined {
  const key = cartProductIdKey(item);
  if (!key) return undefined;
  return products.find((p) => p.id === parseInt(key, 10));
}

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.REDSYS_SECRET_KEY?.trim();
    const merchantCode = (process.env.REDSYS_MERCHANT_CODE ?? redsysMerchantCode)?.trim();
    if (!secretKey || !merchantCode) {
      const missing = [
        !secretKey && 'REDSYS_SECRET_KEY',
        !merchantCode && 'REDSYS_MERCHANT_CODE',
      ].filter(Boolean);
      const hint =
        process.env.NODE_ENV === 'production'
          ? 'Configura REDSYS_SECRET_KEY y REDSYS_MERCHANT_CODE en las variables de entorno de tu servidor (Vercel, Railway, etc.).'
          : 'Comprueba .env.local y reinicia el servidor (npm run dev).';
      const envStatus =
        process.env.NODE_ENV === 'production'
          ? ` En el servidor: REDSYS_SECRET_KEY=${process.env.REDSYS_SECRET_KEY != null && String(process.env.REDSYS_SECRET_KEY).trim() !== '' ? 'sí' : 'no'}, REDSYS_MERCHANT_CODE=${process.env.REDSYS_MERCHANT_CODE != null && String(process.env.REDSYS_MERCHANT_CODE).trim() !== '' ? 'sí' : 'no'}.`
          : '';
      return NextResponse.json(
        {
          error: 'El TPV no está configurado correctamente. Falta configuración de Redsys.',
          detail: `Variables no definidas o vacías: ${missing.join(', ')}. ${hint}${envStatus}`,
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as CreateOrderRequest;

    if (!body.customer || !body.cart || !body.cart.items || body.cart.items.length === 0) {
      return NextResponse.json({ error: 'Datos del pedido incompletos' }, { status: 400 });
    }

    const customerError = validateCustomer(body.customer);
    if (customerError) {
      return NextResponse.json({ error: customerError }, { status: 400 });
    }

    const { customer, cart } = body;

    const missingProductKey = cart.items.find((item) => cartProductIdKey(item) === '');
    if (missingProductKey) {
      return NextResponse.json(
        { error: 'Falta productId en un artículo del carrito (p. ej. variante sin producto)' },
        { status: 400 },
      );
    }

    const uniqueProductKeys = [...new Set(cart.items.map((item) => cartProductIdKey(item)))];
    const productWhere: Prisma.ProductWhereInput =
      uniqueProductKeys.length > 0 && uniqueProductKeys.every((k) => /^\d+$/.test(k))
        ? { id: { in: uniqueProductKeys.map((k) => parseInt(k, 10)) } }
        : ({ id: { in: uniqueProductKeys } } as unknown as Prisma.ProductWhereInput);

    const variantIds = cart.items
      .map((item) => item.variantId)
      .filter((id): id is number => id !== undefined && !isNaN(id));

    const products = await prisma.product.findMany({
      where: productWhere,
      include: { variants: true },
    });

    const variants =
      variantIds.length > 0
        ? await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
          })
        : [];

    if (products.length !== uniqueProductKeys.length) {
      return NextResponse.json({ error: 'Uno o más productos no existen' }, { status: 400 });
    }

    /** Stock disponible: si tiene variantes, suma de variantes; si no, product.stock. Nunca negativo. */
    function getProductAvailableStock(product: { stock: number; variants?: { stock: number }[] }): number {
      let raw: number;
      if (product.variants && product.variants.length > 0) {
        raw = product.variants.reduce((sum, v) => sum + v.stock, 0);
      } else {
        raw = product.stock;
      }
      return Math.max(0, raw);
    }

    const stockIssues: string[] = [];
    for (const item of cart.items) {
      if (item.variantId) {
        const variant = variants.find((v) => v.id === item.variantId);
        const variantStock = variant ? Math.max(0, variant.stock) : 0;
        if (variant && variantStock < item.quantity) {
          stockIssues.push(`${item.name}: Stock disponible ${variantStock}, solicitado ${item.quantity}`);
        }
      } else {
        const product = findProductByCartItem(products, item);
        const available = product ? getProductAvailableStock(product) : 0;
        if (product && available < item.quantity) {
          stockIssues.push(`${item.name}: Stock disponible ${available}, solicitado ${item.quantity}`);
        }
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json(
        { error: 'Stock insuficiente para algunos productos', details: stockIssues },
        { status: 400 },
      );
    }

    // Calcular coste de envío en servidor a partir del total
    const itemsSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const iva = itemsSubtotal * 0.21;
    const couponDiscount = body.coupon?.discountAmount ?? 0;
    const rawShippingCost = cart.totalPrice - (itemsSubtotal + iva) + couponDiscount;
    const shippingCostNumber = Math.max(0, Number(rawShippingCost.toFixed(2)));

    // Crear identificador de pedido para Redsys (12 dígitos máx.)
    const redsysOrderId = randomTransactionId();

    // Crear pedido en estado PENDING y restar stock
    const order = await prisma.$transaction(async (tx) => {
      const direccionCompleta = [
        customer.direccion,
        customer.piso ? `Piso: ${customer.piso}` : null,
        customer.codigoPostal,
        customer.ciudad,
        customer.provincia,
      ]
        .filter(Boolean)
        .join(', ');

      const newOrder = await tx.order.create({
        data: {
          orderNumber: `TPV-${redsysOrderId}`,
          redsysOrderId,
          nombre: customer.nombre.trim(),
          apellidos: customer.apellidos.trim(),
          nifCif: customer.nifCif?.trim() || null,
          direccion: customer.direccion.trim(),
          piso: customer.piso?.trim() || null,
          codigoPostal: customer.codigoPostal.trim(),
          ciudad: customer.ciudad.trim(),
          provincia: customer.provincia.trim(),
          nombreCompleto: `${customer.nombre.trim()} ${customer.apellidos.trim()}`,
          direccionCompleta,
          nombreCentro: customer.nombreCentro?.trim() || null,
          email: customer.email.trim(),
          telefono: customer.telefono.trim(),
          total: new Prisma.Decimal(cart.totalPrice),
          shippingCost: shippingCostNumber ? new Prisma.Decimal(shippingCostNumber) : null,
          couponCode: body.coupon?.code || null,
          discountAmount: body.coupon?.discountAmount
            ? new Prisma.Decimal(body.coupon.discountAmount)
            : null,
          paymentMethod: 'redsys',
          status: 'PENDING',
          items: {
            create: (() => {
              console.log(
                'DEBUG products ids:',
                products.map((p) => p.id),
              );
              return cart.items.map((item) => {
                const product = findProductByCartItem(products, item);
                const price = new Prisma.Decimal(item.price);
                const subtotal = price.mul(item.quantity);

                console.log(
                  'DEBUG item:',
                  item.id,
                  item.productId,
                  'productKey:',
                  cartProductIdKey(item),
                  'product encontrado:',
                  product?.id,
                  product?.proveedor,
                );

                if (!product) {
                  throw new Error(`[Redsys] Producto no encontrado para ítem del carrito: ${item.id}`);
                }

                return {
                  productId: product.id,
                  variantId: item.variantId || null,
                  productName: item.name,
                  productSlug: item.slug,
                  quantity: item.quantity,
                  price,
                  subtotal,
                  proveedor: product.proveedor ?? null,
                };
              });
            })(),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          const product = findProductByCartItem(products, item)!;
          await tx.product.update({
            where: { id: product.id },
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

    const baseUrl = getBaseUrl();
    const redsysApi = getRedsysApi();
    const amountInCents = Math.round(Number(order.total) * 100);

    const form = redsysApi.createRedirectForm({
      DS_MERCHANT_AMOUNT: String(amountInCents),
      DS_MERCHANT_CURRENCY: '978', // EUR
      DS_MERCHANT_ORDER: redsysOrderId,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_MERCHANTNAME: redsysMerchantName,
      DS_MERCHANT_TERMINAL: redsysTerminal,
      DS_MERCHANT_TRANSACTIONTYPE: '0', // Autorización
      DS_MERCHANT_MERCHANTURL: `${baseUrl}/api/checkout/redsys/notification`,
      DS_MERCHANT_URLOK: `${baseUrl}/carrito/checkout/redsys/success?order=${encodeURIComponent(
        redsysOrderId,
      )}`,
      DS_MERCHANT_URLKO: `${baseUrl}/carrito/checkout/redsys/cancel?order=${encodeURIComponent(
        redsysOrderId,
      )}`,
    });

    return NextResponse.json(
      {
        form: {
          formAction: form.url,
          formParams: form.body,
        },
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          redsysOrderId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[API Checkout Redsys] Error al iniciar pago:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        error: 'Error interno al iniciar el pago con tarjeta',
        ...(process.env.NODE_ENV === 'development' && { detail: message }),
      },
      { status: 500 },
    );
  }
}

