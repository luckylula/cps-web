'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/app/context/CartContext';
import { cartItemStockKey } from '@/app/lib/stockUtils';

export function useCartStock(items: CartItem[]) {
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const itemsKey = items
    .map((i) => `${i.productId}:${i.variantId ?? ''}`)
    .sort()
    .join('|');

  const refreshStocks = useCallback(async () => {
    if (items.length === 0) {
      setStocks({});
      return {};
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cart/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
          })),
        }),
      });

      if (!res.ok) throw new Error('stock fetch failed');

      const data = await res.json();
      const nextStocks: Record<string, number> = data.stocks ?? {};
      setStocks(nextStocks);
      return nextStocks;
    } catch (error) {
      console.error('[useCartStock] Error fetching stock:', error);
      return {};
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    refreshStocks();
  }, [itemsKey, refreshStocks]);

  const getMaxStock = useCallback(
    (item: CartItem): number | undefined => {
      const key = cartItemStockKey(item.productId, item.variantId);
      const value = stocks[key];
      return value !== undefined ? value : undefined;
    },
    [stocks]
  );

  return { stocks, loading, getMaxStock, refreshStocks };
}
