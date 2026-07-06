import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCoupon } from '@/app/lib/coupon';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, email } = body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        {
          valid: false,
          error: 'El código del cupón es requerido',
        },
        { status: 400 }
      );
    }

    const result = await validateCoupon(
      prisma,
      code,
      typeof email === 'string' ? email : null
    );

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        error: result.error,
      });
    }

    return NextResponse.json({
      valid: true,
      discountPercent: result.discountPercent,
      code: result.code,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Error al validar el cupón. Por favor, intenta de nuevo.',
      },
      { status: 500 }
    );
  }
}
