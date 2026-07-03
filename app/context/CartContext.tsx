"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string; // Será variantId si existe, sino productId
  productId: number;
  variantId?: number; // Opcional para productos sin variantes
  name: string;
  slug: string;
  price: number;
  images: string[];
  quantity: number;
  color?: string | null;
  talla?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  addItemQuantity: (product: Omit<CartItem, 'quantity'>, quantity: number, maxStock?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number, maxStock?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cps_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isLoaded]);

  const findExistingItem = (
    prevItems: CartItem[],
    product: Omit<CartItem, 'quantity'>
  ) =>
    prevItems.find((item) => {
      if (product.variantId) {
        return item.variantId === product.variantId && item.productId === product.productId;
      }
      return item.productId === product.productId && !item.variantId;
    });

  const addItem = (product: Omit<CartItem, 'quantity'>) => {
    addItemQuantity(product, 1);
  };

  const addItemQuantity = (
    product: Omit<CartItem, 'quantity'>,
    quantity: number,
    maxStock?: number
  ) => {
    if (quantity <= 0) return;

    setItems((prevItems) => {
      const existingItem = findExistingItem(prevItems, product);
      const currentQty = existingItem?.quantity ?? 0;
      const cap = maxStock !== undefined ? maxStock : Number.POSITIVE_INFINITY;
      const newQty = Math.min(currentQty + quantity, cap);

      if (newQty <= 0) {
        return prevItems.filter((item) => item.id !== product.id);
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: newQty } : item
        );
      }

      return [...prevItems, { ...product, quantity: Math.min(quantity, cap) }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number, maxStock?: number) => {
    const capped =
      maxStock !== undefined ? Math.min(quantity, maxStock) : quantity;

    if (capped <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: capped } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addItemQuantity,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
