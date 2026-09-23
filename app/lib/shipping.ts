import { calculateCouponDiscount } from '@/app/lib/coupon';

/** Umbral de envío gratis por importe (IVA incluido). */
export const FREE_SHIPPING_THRESHOLD = 120;
export const STANDARD_SHIPPING = 10;
export const EXPRESS_SHIPPING = 15;

export function calculateShippingCost(options: {
  subtotal: number;
  metodoEntrega?: string | null;
  freeShippingCoupon?: boolean;
}): number {
  if (options.freeShippingCoupon) {
    return 0;
  }

  const isExpress = options.metodoEntrega === 'express';
  if (options.subtotal >= FREE_SHIPPING_THRESHOLD) {
    return isExpress ? EXPRESS_SHIPPING : 0;
  }
  return isExpress ? EXPRESS_SHIPPING : STANDARD_SHIPPING;
}

export function resolveOrderTotals(options: {
  itemsSubtotal: number;
  metodoEntrega?: string | null;
  discountPercent?: number;
  freeShippingCoupon?: boolean;
  clientTotalPrice?: number;
}): {
  couponDiscount: number;
  shippingCost: number;
  total: number;
} {
  const couponDiscount = calculateCouponDiscount(
    options.itemsSubtotal,
    options.discountPercent ?? 0
  );

  if (options.freeShippingCoupon) {
    return {
      couponDiscount,
      shippingCost: 0,
      total: Number((options.itemsSubtotal - couponDiscount).toFixed(2)),
    };
  }

  if (typeof options.clientTotalPrice === 'number' && Number.isFinite(options.clientTotalPrice)) {
    const inferredShipping = Math.max(
      0,
      Number(
        (options.clientTotalPrice - options.itemsSubtotal + couponDiscount).toFixed(2)
      )
    );
    return {
      couponDiscount,
      shippingCost: inferredShipping,
      total: Number(options.clientTotalPrice.toFixed(2)),
    };
  }

  const shippingCost = calculateShippingCost({
    subtotal: options.itemsSubtotal,
    metodoEntrega: options.metodoEntrega,
    freeShippingCoupon: false,
  });

  return {
    couponDiscount,
    shippingCost,
    total: Number((options.itemsSubtotal - couponDiscount + shippingCost).toFixed(2)),
  };
}
