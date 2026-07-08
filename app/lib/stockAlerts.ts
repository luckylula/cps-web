import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/app/lib/mailer';

export async function notifyStockAlertsIfBackInStock(productId: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true, stock: true, price: true },
  });

  if (!product || product.stock <= 0) {
    return { notified: 0, skipped: true };
  }

  const pendingAlerts = await prisma.stockAlert.findMany({
    where: {
      productId,
      active: true,
      notifiedAt: null,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (pendingAlerts.length === 0) {
    return { notified: 0, skipped: false };
  }

  let notified = 0;
  for (const alert of pendingAlerts) {
    try {
      const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || 'https://www.cpmaterialdeportivo.com'}/articulos/${product.slug}`;
      await sendEmail({
        to: alert.email,
        subject: `Ya está disponible: ${product.name}`,
        text: `El producto "${product.name}" vuelve a estar disponible.\n\nVer producto: ${productUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2 style="margin-bottom: 8px;">Producto disponible de nuevo</h2>
            <p>Hola,</p>
            <p>El producto <strong>${product.name}</strong> vuelve a estar en stock.</p>
            <p>
              <a href="${productUrl}" style="display:inline-block;padding:10px 14px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;">
                Ver producto
              </a>
            </p>
            <p style="font-size:12px;color:#6b7280;">Recibes este email porque solicitaste aviso de disponibilidad.</p>
          </div>
        `,
      });

      await prisma.stockAlert.update({
        where: { id: alert.id },
        data: {
          active: false,
          notifiedAt: new Date(),
        },
      });
      notified += 1;
    } catch (error) {
      console.error('[STOCK ALERT] Error enviando alerta:', error);
    }
  }

  return { notified, skipped: false };
}
