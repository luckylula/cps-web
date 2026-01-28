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

    // Aquí puedes:
    // 1. Guardar en base de datos (si tienes tabla de mensajes)
    // 2. Enviar email (usando un servicio como Resend, SendGrid, etc.)
    // 3. Enviar a un webhook (Zapier, Make, etc.)
    
    // Por ahora, solo logueamos el mensaje (en producción deberías guardarlo o enviarlo)
    console.log('Nuevo mensaje de contacto:', {
      nombre,
      telefono: telefono || 'No proporcionado',
      email,
      asunto,
      mensaje,
      fecha: new Date().toISOString(),
    });

    // TODO: Implementar envío de email o guardado en BD
    // Ejemplo con Resend:
    // await resend.emails.send({
    //   from: 'contacto@cpsmaterialdeportivo.com',
    //   to: 'pedidos@cpsmaterialdeportivo.com',
    //   subject: `Nuevo mensaje: ${asunto}`,
    //   html: `<p>De: ${nombre} (${email})</p><p>Teléfono: ${telefono || 'No proporcionado'}</p><p>Mensaje: ${mensaje}</p>`,
    // });

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
