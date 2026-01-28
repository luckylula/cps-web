import { Prisma } from '../generated/client';

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
}

/**
 * Convierte productos de Prisma al formato esperado por componentes cliente
 */
export function convertProductsToClient(products: PrismaProduct[]): ClientProduct[] {
  return products.map(product => ({
    ...product,
    price: product.price ? Number(product.price) : null,
  }));
}
