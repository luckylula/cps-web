export function cartItemStockKey(productId: number, variantId?: number): string {
  return variantId ? `v-${variantId}` : `p-${productId}`;
}

/** Stock disponible de un producto sin variante concreta (suma variantes o product.stock). */
export function getProductAvailableStock(product: {
  stock: number;
  variants?: { stock: number }[];
}): number {
  const raw = product.variants?.length
    ? product.variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0)
    : product.stock;
  return Math.max(0, raw);
}

/** Stock disponible para una línea de carrito (variante o producto). */
export function getCartLineAvailableStock(
  product: { stock: number; variants?: { stock: number }[] },
  variant?: { stock: number } | null
): number {
  if (variant) return Math.max(0, variant.stock);
  return getProductAvailableStock(product);
}
