/**
 * Snapshot de color / talla / ref para líneas de pedido (n8n interno).
 * Prioriza variante sobre producto y, si falta, el valor del carrito.
 */

export type OrderItemCatalogProduct = {
  proveedor?: string | null;
  ref_proveedor?: string | null;
  color?: string | null;
  talla?: string | null;
};

export type OrderItemCatalogVariant = {
  id: number;
  ref_proveedor?: string | null;
  ref_variante?: string | null;
  color?: string | null;
  talla?: string | null;
};

export type OrderItemCartHints = {
  variantId?: number | null;
  color?: string | null;
  talla?: string | null;
};

export type OrderItemSnapshot = {
  proveedor: string | null;
  refProveedor: string | null;
  color: string | null;
  talla: string | null;
};

function pick(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed) return trimmed;
  }
  return null;
}

export function resolveOrderItemSnapshot(
  product: OrderItemCatalogProduct,
  variants: OrderItemCatalogVariant[],
  cartItem: OrderItemCartHints
): OrderItemSnapshot {
  const variant =
    cartItem.variantId != null
      ? variants.find((v) => v.id === cartItem.variantId)
      : undefined;

  return {
    proveedor: pick(product.proveedor),
    refProveedor: pick(
      variant?.ref_variante,
      variant?.ref_proveedor,
      product.ref_proveedor
    ),
    color: pick(variant?.color, product.color, cartItem.color),
    talla: pick(variant?.talla, product.talla, cartItem.talla),
  };
}
