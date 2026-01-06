import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Inicializar Stripe dentro de la función para evitar errores durante el build
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-18' as any,
  });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { amount, currency = 'eur' } = body;

    // Validar que amount existe y es un número válido
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'El monto es requerido y debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Convertir amount a centavos (Stripe usa centavos)
    const amountInCents = Math.round(amount * 100);

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Puedes añadir metadata adicional aquí si lo necesitas
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error);
    
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
