import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Inicializar Stripe dentro de la función para evitar errores durante el build
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
  });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('Datos recibidos:', body);
    
    const { amount, currency = 'eur' } = body;

    // Validar que amount existe y es un número válido
    if (amount === undefined || amount === null) {
      console.error('Amount no proporcionado');
      return NextResponse.json(
        { error: 'El monto es requerido' },
        { status: 400 }
      );
    }

    // Convertir amount a número si viene como string
    const amountNumber = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    
    if (isNaN(amountNumber) || amountNumber <= 0) {
      console.error('Amount inválido:', amount, 'convertido a:', amountNumber);
      return NextResponse.json(
        { error: 'El monto debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    // Convertir amount a centavos (Stripe usa centavos)
    const amountInCents = Math.round(amountNumber * 100);
    
    console.log('Amount original:', amountNumber, 'Amount en centavos:', amountInCents);
    
    if (amountInCents <= 0) {
      console.error('Amount en centavos es 0 o negativo:', amountInCents);
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

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
