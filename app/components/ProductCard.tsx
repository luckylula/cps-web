"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  images: string[];
  featured: boolean;
  category: {
    name: string;
  };
}

export default function ProductCard({ 
  id,
  name, 
  slug, 
  price, 
  images, 
  featured, 
  category 
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    addItem({
      id,
      name,
      slug,
      price: Number(price),
      images,
    });
    
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
      <Link 
        href={`/articulos/${slug}`}
        className="flex-1 flex flex-col"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={images[0] || '/placeholder.png'}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {featured && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              DESTACADO
            </span>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {category.name}
          </p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {name}
          </h3>
          <p className="text-xl font-bold text-blue-600 mt-auto">
            {Number(price).toFixed(2)}€
          </p>
        </div>
      </Link>
      
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAdding ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Añadiendo...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Añadir a la cesta
            </>
          )}
        </button>
      </div>
    </div>
  );
}
