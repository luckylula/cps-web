import type { PrismaClient } from '@/generated/client';

type CouponDb = Pick<PrismaClient, 'coupon' | 'order'>;

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export type CouponValidationResult =
  | { valid: true; code: string; discountPercent: number }
  | { valid: false; error: string };

export async function validateCoupon(
  db: CouponDb,
  rawCode: string,
  email?: string | null
): Promise<CouponValidationResult> {
  const code = normalizeCouponCode(rawCode);

  if (!code) {
    return { valid: false, error: 'El código del cupón es requerido' };
  }

  const coupon = await db.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    return { valid: false, error: 'El código de cupón no es válido' };
  }

  if (!coupon.isActive) {
    return { valid: false, error: 'Este cupón no está activo' };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'Este cupón ha expirado' };
  }

  if (coupon.singleUsePerEmail && email?.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    const previousUse = await db.order.findFirst({
      where: {
        couponCode: coupon.code,
        status: 'CONFIRMED',
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (previousUse) {
      return {
        valid: false,
        error: 'Este cupón ya se ha utilizado con este email',
      };
    }
  }

  return {
    valid: true,
    code: coupon.code,
    discountPercent: Number(coupon.discountPercent),
  };
}

export function calculateCouponDiscount(subtotal: number, discountPercent: number): number {
  return Number(((subtotal * discountPercent) / 100).toFixed(2));
}
