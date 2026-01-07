import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Inicializar Stripe dentro de la función para evitar errores durante el build
  // No especificamos apiVersion para usar la versión por defecto del SDK
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('[Checkout API] Datos recibidos:', body);

    const { amount, currency = 'eur', email } = body;

    // Validar que amount existe y es un número válido
    if (amount === undefined || amount === null) {
      console.error('[Checkout API] Amount no proporcionado');
      return NextResponse.json(
        { error: 'El monto es requerido' },
        { status: 400 }
      );
    }

    // Convertir amount a número si viene como string
    const amountNumber = typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      console.error('[Checkout API] Amount inválido:', amount, 'convertido a:', amountNumber);
      return NextResponse.json(
        { error: 'El monto debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    // Convertir amount a centavos (Stripe usa centavos)
    const amountInCents = Math.round(amountNumber * 100);

    console.log('[Checkout API] Amount original:', amountNumber, 'Amount en centavos:', amountInCents);

    if (amountInCents <= 0) {
      console.error('[Checkout API] Amount en centavos es 0 o negativo:', amountInCents);
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Crear PaymentIntent
    console.log('[Checkout API] Creando PaymentIntent...');
    const paymentIntentData: any = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Puedes añadir metadata adicional aquí si lo necesitas
      },
    };

    // Agregar email si está disponible
    if (email && typeof email === 'string' && email.trim()) {
      paymentIntentData.receipt_email = email.trim();
      console.log('[Checkout API] Email del cliente:', email);
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    console.log('[Checkout API] PaymentIntent creado exitosamente:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('[Checkout API] Error creating PaymentIntent:', error);
    console.error('[Checkout API] Error type:', error.type);
    console.error('[Checkout API] Error message:', error.message);
    console.error('[Checkout API] Error code:', error.code);

    // Manejar errores específicos de Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Error en la solicitud de pago: ' + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el intent de pago. Por favor, intenta de nuevo.' },
      { status: 500 }
    );
  }
}
