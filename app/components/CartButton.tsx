"use client";

import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

export default function CartButton() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Link 
      href="/carrito" 
      className="text-white hover:text-orange-300 transition-colors font-medium bg-orange-500 px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-orange-600 whitespace-nowrap relative"
    >
      Mi Cesta
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
