import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'El código del cupón es requerido' 
        },
        { status: 400 }
      );
    }

    const couponCode = code.trim().toUpperCase();

    // Buscar el cupón en la base de datos
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    // Verificar si el cupón existe
    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'El código de cupón no es válido',
      });
    }

    // Verificar si el cupón está activo
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupón no está activo',
      });
    }

    // Verificar si el cupón ha expirado
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupón ha expirado',
      });
    }

    // Cupón válido
    return NextResponse.json({
      valid: true,
      discountPercent: Number(coupon.discountPercent),
      code: coupon.code,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Error al validar el cupón. Por favor, intenta de nuevo.' 
      },
      { status: 500 }
    );
  }
}
