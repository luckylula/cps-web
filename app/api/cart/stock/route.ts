import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cartItemStockKey, getCartLineAvailableStock } from '@/app/lib/stockUtils';

export const dynamic = 'force-dynamic';

interface StockRequestItem {
  productId: number;
  variantId?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: StockRequestItem[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ stocks: {} });
    }

    const productIds = [...new Set(items.map((i) => i.productId).filter((id) => Number.isInteger(id)))];
    const variantIds = [
      ...new Set(
        items
          .map((i) => i.variantId)
          .filter((id): id is number => id !== undefined && Number.isInteger(id))
      ),
    ];

    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { variants: true },
      }),
      variantIds.length > 0
        ? prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
        : Promise.resolve([]),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const stocks: Record<string, number> = {};

    for (const item of items) {
      const key = cartItemStockKey(item.productId, item.variantId);
      if (stocks[key] !== undefined) continue;

      const product = productMap.get(item.productId);
      if (!product) {
        stocks[key] = 0;
        continue;
      }

      const variant = item.variantId ? variantMap.get(item.variantId) ?? null : null;
      stocks[key] = getCartLineAvailableStock(product, variant);
    }

    return NextResponse.json({ stocks });
  } catch (error) {
    console.error('[API Cart Stock] Error:', error);
    return NextResponse.json({ error: 'Error al consultar stock' }, { status: 500 });
  }
}
