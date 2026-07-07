import { Prisma } from '@/generated/client';
import { normalizeImages } from './imageUtils';

export interface ProductVariantSummary {
  stock: number;
  price: number | null;
}

export interface VariantRow {
  productId: number;
  stock: number;
  price: number | null;
}

interface PrismaProduct {
  id: number;
  name: string;
  slug: string;
  price: Prisma.Decimal | null;
  images: string[];
  featured: boolean;
  marca?: string | null;
  sku_interno?: string | null;
  stock: number;
  categoryId: string;
  variants?: ProductVariantSummary[];
  hasStock?: boolean;
}

export interface ClientProduct {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  /** true cuando hay variantes con precios distintos (mostrar "Desde" y "Seleccionar opciones") */
  priceFrom?: boolean;
  images: string[];
  featured: boolean;
  marca?: string | null;
  sku_interno?: string | null;
  stock: number;
  categoryId: string;
  hasStock?: boolean;
}

export function isValidPrice(price: number | null | undefined): price is number {
  return price !== null && price !== undefined && Number(price) > 0;
}

export function getEffectivePrice(
  product: { price: number | null; variants?: { price: number | null }[] },
  selectedVariant?: { price: number | null } | null
): number | null {
  if (selectedVariant) {
    if (isValidPrice(selectedVariant.price)) {
      return Number(selectedVariant.price);
    }
    if (isValidPrice(product.price)) {
      return Number(product.price);
    }
  }
  if (product.variants && product.variants.length > 0) {
    const variantPrices = product.variants
      .map((v) => {
        if (isValidPrice(v.price)) return Number(v.price);
        if (isValidPrice(product.price)) return Number(product.price);
        return null;
      })
      .filter((p): p is number => p !== null);
    if (variantPrices.length > 0) {
      return Math.min(...variantPrices);
    }
  }
  if (isValidPrice(product.price)) {
    return Number(product.price);
  }
  return null;
}

export function variantPricesDiffer(
  variants: { price: number | null }[],
  productPrice: number | null = null
): boolean {
  const prices = new Set(
    variants
      .map((v) => {
        if (isValidPrice(v.price)) return Number(v.price);
        if (isValidPrice(productPrice)) return Number(productPrice);
        return null;
      })
      .filter((p): p is number => p !== null)
  );
  return prices.size > 1;
}

export function getDisplayPriceInfo(
  product: { price: number | null; variants?: { price: number | null }[] },
  selectedVariant?: { price: number | null } | null
): { price: number | null; priceFrom: boolean; hasVariants: boolean } {
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const price = getEffectivePrice(product, selectedVariant);
  const priceFrom =
    hasVariants &&
    !selectedVariant &&
    variantPricesDiffer(product.variants ?? [], product.price) &&
    price !== null;
  return { price, priceFrom, hasVariants };
}

export function normalizeVariantPrices<T extends { price: unknown }>(
  variants: T[],
  productPrice: number | null
): T[] {
  const fallback = isValidPrice(productPrice) ? Number(productPrice) : null;
  return variants.map((variant) => ({
    ...variant,
    price:
      isValidPrice(variant.price as number | null)
        ? Number(variant.price)
        : fallback,
  }));
}

export function getUniqueVariantValues(
  variants: { color: string | null; talla: string | null }[],
  field: 'color' | 'talla'
): (string | null)[] {
  const values = new Set<string | null>();
  variants.forEach((variant) => {
    const value = variant[field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  });
  return Array.from(values);
}

export function findMatchingVariant<
  T extends { color: string | null; talla: string | null },
>(variants: T[], color: string | null, talla: string | null): T | null {
  if (!variants.length) return null;

  const colors = getUniqueVariantValues(variants, 'color');
  const tallas = getUniqueVariantValues(variants, 'talla');
  const effectiveColor = color ?? (colors.length === 1 ? colors[0] : null);
  const effectiveTalla = talla ?? (tallas.length === 1 ? tallas[0] : null);

  if (effectiveColor !== null && effectiveTalla !== null) {
    const exact = variants.find(
      (variant) =>
        variant.color === effectiveColor && variant.talla === effectiveTalla
    );
    if (exact) return exact;
  }

  if (effectiveTalla !== null && colors.length <= 1) {
    return variants.find((variant) => variant.talla === effectiveTalla) ?? null;
  }

  if (effectiveColor !== null && tallas.length <= 1) {
    return variants.find((variant) => variant.color === effectiveColor) ?? null;
  }

  return null;
}

/** Imágenes de galería según color/talla seleccionados (preview parcial si falta una opción). */
export function getGalleryImages<
  T extends { images?: string[]; color: string | null; talla: string | null },
>(
  product: { images: string[]; variants?: T[] },
  selectedColor: string | null,
  selectedTalla: string | null,
  selectedVariant?: T | null
): string[] {
  if (selectedVariant?.images && selectedVariant.images.length > 0) {
    return selectedVariant.images;
  }

  const variants = product.variants ?? [];
  if (variants.length === 0) return product.images;

  if (selectedColor !== null && selectedTalla !== null) {
    const exact = variants.find(
      (v) => v.color === selectedColor && v.talla === selectedTalla
    );
    if (exact?.images && exact.images.length > 0) return exact.images;
  }

  if (selectedColor !== null) {
    const byColor = variants.find(
      (v) => v.color === selectedColor && v.images && v.images.length > 0
    );
    if (byColor?.images) return byColor.images;
  }

  if (selectedTalla !== null) {
    const byTalla = variants.find(
      (v) => v.talla === selectedTalla && v.images && v.images.length > 0
    );
    if (byTalla?.images) return byTalla.images;
  }

  return product.images;
}

/**
 * Precio y flags para tarjetas de listado (solo "Desde" si los precios de variantes difieren).
 */
export function getListingProductInfo(product: {
  price: number | null;
  variants?: { price: number | null }[];
}): { price: number | null; priceFrom: boolean } {
  const basePrice = product.price;
  const variants = product.variants ?? [];
  const price = getEffectivePrice({ price: basePrice, variants }, null);
  const priceFrom =
    variants.length > 0 &&
    variantPricesDiffer(variants, basePrice) &&
    price !== null;
  return { price, priceFrom };
}

export function formatProductPrice(
  price: number | null | undefined,
  options?: { priceFrom?: boolean; consultarLabel?: string }
): string {
  if (!isValidPrice(price)) {
    return options?.consultarLabel ?? 'Consultar precio';
  }
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price));
  return options?.priceFrom ? `Desde ${formatted}` : formatted;
}

export function groupVariantsByProductId(
  rows: VariantRow[]
): Map<number, ProductVariantSummary[]> {
  const map = new Map<number, ProductVariantSummary[]>();
  for (const row of rows) {
    const list = map.get(row.productId) ?? [];
    list.push({
      stock: row.stock,
      price: row.price != null ? Number(row.price) : null,
    });
    map.set(row.productId, list);
  }
  return map;
}

export function attachVariantInfoToProducts<T extends { id: number; stock: number }>(
  products: T[],
  variantRows: VariantRow[]
): Array<T & { variants?: ProductVariantSummary[]; hasStock: boolean }> {
  const byProduct = groupVariantsByProductId(variantRows);
  return products.map((p) => {
    const variants = byProduct.get(p.id);
    if (!variants?.length) {
      return { ...p, hasStock: p.stock > 0 };
    }
    return {
      ...p,
      variants,
      hasStock: variants.some((v) => v.stock > 0),
    };
  });
}

/**
 * Indica si un producto tiene stock disponible.
 * Si tiene variantes: al menos una variante con stock > 0.
 * Si no tiene variantes: product.stock > 0.
 */
export function productHasStock(
  product: { stock: number; variants?: { stock: number }[] }
): boolean {
  const variants = product.variants;
  if (variants && variants.length > 0) {
    return variants.some((v) => v.stock > 0);
  }
  return product.stock > 0;
}

/**
 * Convierte productos de Prisma al formato esperado por componentes cliente.
 * Usa el precio mínimo de variantes cuando existen.
 */
export function convertProductsToClient(products: PrismaProduct[]): ClientProduct[] {
  return products.map((product) => {
    const images = normalizeImages(product.images ?? []);
    const hasStock =
      typeof product.hasStock === 'boolean'
        ? product.hasStock
        : productHasStock(product);
    const basePrice = product.price != null ? Number(product.price) : null;
    const { price, priceFrom } = getListingProductInfo({
      price: basePrice,
      variants: product.variants?.map((v) => ({ price: v.price ?? null })),
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price,
      priceFrom,
      images,
      featured: Boolean(product.featured),
      marca: product.marca ?? null,
      sku_interno: product.sku_interno ?? null,
      stock: Number(product.stock),
      categoryId: product.categoryId,
      hasStock,
    };
  });
}
