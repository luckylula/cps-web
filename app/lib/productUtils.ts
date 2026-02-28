import { Prisma } from '@/generated/client';
import { normalizeImages } from './imageUtils';

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
  variants?: { stock: number }[];
  /** Si ya viene calculado (p. ej. desde servidor sin include variants), se usa este valor. */
  hasStock?: boolean;
}

interface ClientProduct {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  images: string[];
  featured: boolean;
  marca?: string | null;
  sku_interno?: string | null;
  stock: number;
  categoryId: string;
  hasStock?: boolean;
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
 * Construye objetos planos (sin spread) para que images sea siempre un array serializable.
 */
export function convertProductsToClient(products: PrismaProduct[]): ClientProduct[] {
  return products.map((product) => {
    const images = normalizeImages(product.images ?? []);
    const hasStock =
      typeof product.hasStock === 'boolean'
        ? product.hasStock
        : productHasStock(product);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price != null ? Number(product.price) : null,
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
