"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useFavorites } from '@/app/context/FavoritesContext';
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

// Función para sanitizar texto (eliminar caracteres problemáticos)
function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  // Convertir a string y limpiar
  let cleaned = String(text)
    // Eliminar caracteres de control
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Eliminar tags HTML si los hay
    .replace(/<[^>]+>/g, '')
    // Limitar longitud
    .trim();
  
  // Si después de limpiar está vacío, usar valor por defecto
  if (cleaned.length === 0) return 'Producto';
  
  // Limitar a 100 caracteres para nombres
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + '...';
  }
  
  return cleaned;
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
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  
  const favorite = isFavorite(id);
  
  // Sanitizar nombre y categoría
  const safeName = sanitizeText(name);
  const safeCategoryName = sanitizeText(category?.name);

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
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-100">
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
            <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 text-sm font-bold rounded">
              DESTACADO
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite({
                id,
                name,
                slug,
                price: Number(price),
                images,
              });
            }}
            className="absolute top-3 left-3 bg-white/90 hover:bg-white p-2.5 rounded-full transition-colors shadow-md"
            aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <svg
              className={`w-6 h-6 transition-colors ${favorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
              fill={favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <p className="text-sm md:text-base text-gray-500 uppercase tracking-wide mb-2 font-medium">
            {safeCategoryName}
          </p>
          <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-3 line-clamp-2 leading-tight" title={safeName}>
            {safeName}
          </h3>
          <p className="text-xl md:text-2xl font-bold text-gray-600 mt-auto">
            {Number(price || 0).toFixed(2)}€
          </p>
        </div>
      </Link>
      
      <div className="p-5 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base md:text-lg"
        >
          {isAdding ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Añadiendo...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
