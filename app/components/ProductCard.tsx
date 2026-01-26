"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useFavorites } from '@/app/context/FavoritesContext';
import { useState } from 'react';
import SafeImage from './SafeImage';
import { getFirstValidImage } from '@/app/lib/imageUtils';

interface ProductCardProps {
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
  marca,
  sku_interno,
  stock,
  categoryId
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  
  const favorite = isFavorite(String(id));
  
  // Sanitizar nombre
  const safeName = sanitizeText(name);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Si no hay precio, no permitir añadir al carrito directamente
    if (price === null || price === undefined) {
      // Podrías mostrar un modal o redirigir a contacto
      return;
    }
    
    setIsAdding(true);
    addItem({
      id: `product-${id}`,
      productId: id,
      name,
      slug,
      price: Number(price),
      images,
    });
    
    setTimeout(() => setIsAdding(false), 300);
  };

  const hasPrice = price !== null && price !== undefined && price > 0;
  const isOutOfStock = stock === 0;

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-100">
      <Link 
        href={`/articulos/${slug}`}
        className="flex-1 flex flex-col"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <SafeImage
            src={getFirstValidImage(images) || ''}
            alt={name}
            fill
            className="group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            objectFit="cover"
          />
          {featured && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              DESTACADO
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 text-xs font-bold rounded">
              AGOTADO
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite({
                id: String(id),
                name,
                slug,
                price: hasPrice ? Number(price) : 0,
                images,
              });
            }}
            className="absolute top-2 left-2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors shadow-sm z-10"
            aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <svg
              className={`w-4 h-4 transition-colors ${favorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
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
        
        <div className="p-4 flex-1 flex flex-col">
          {sku_interno && (
            <p className="text-xs text-gray-400 mb-1 font-mono">
              {sku_interno}
            </p>
          )}
          {marca && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {marca}
            </p>
          )}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight" title={safeName}>
            {safeName}
          </h3>
          <div className="mt-auto">
            {hasPrice ? (
              <p className="text-lg font-bold text-gray-900">
                {Number(price).toFixed(2)}€
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-600">
                Consultar precio
              </p>
            )}
          </div>
        </div>
      </Link>
      
      <div className="p-4 pt-0">
        {hasPrice && !isOutOfStock ? (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-[#003366] hover:bg-[#004080] text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
        ) : (
          <Link
            href={`/articulos/${slug}`}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Ver detalles
          </Link>
        )}
      </div>
    </div>
  );
}
