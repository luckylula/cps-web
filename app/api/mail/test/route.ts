import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/mailer';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const to = String(body?.to || '').trim();

    if (!to || !isValidEmail(to)) {
      return NextResponse.json({ error: 'Email de destino inválido' }, { status: 400 });
    }

    await sendEmail({
      to,
      subject: 'Prueba email CPS Material Deportivo',
      text: 'Este es un email de prueba enviado directamente desde la web (sin n8n).',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Prueba de email correcta</h2>
          <p>Este email se ha enviado directamente desde la web, sin automatizaciones externas.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, message: 'Email de prueba enviado correctamente' });
  } catch (error: any) {
    console.error('[MAIL TEST] Error enviando email:', error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo enviar el email de prueba' },
      { status: 500 }
    );
  }
}
