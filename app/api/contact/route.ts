import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, telefono, email, asunto, mensaje } = body;

    // Validación básica
    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar completos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Preparar datos para enviar al webhook
    const messageData = {
      nombre,
      telefono: telefono || null,
      email,
      asunto,
      mensaje,
      fecha: new Date().toISOString(),
      origen: 'formulario-web',
    };

    // Enviar a webhook de N8N si está configurado
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      try {
        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.N8N_WEBHOOK_TOKEN && {
              'Authorization': `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`,
            }),
          },
          body: JSON.stringify(messageData),
        });

        if (!webhookResponse.ok) {
          console.error('Error enviando a N8N webhook:', await webhookResponse.text());
          // Continuamos aunque falle el webhook para no bloquear la respuesta al usuario
        } else {
          console.log('Mensaje enviado correctamente a N8N webhook');
        }
      } catch (webhookError) {
        console.error('Error conectando con N8N webhook:', webhookError);
        // Continuamos aunque falle el webhook
      }
    } else {
      // Si no hay webhook configurado, solo logueamos (modo desarrollo)
      console.log('Nuevo mensaje de contacto (sin webhook configurado):', messageData);
    }

    return NextResponse.json(
      { message: 'Mensaje enviado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error procesando formulario de contacto:', error);
    return NextResponse.json(
      { error: 'Error al procesar el mensaje' },
      { status: 500 }
    );
  }
}
