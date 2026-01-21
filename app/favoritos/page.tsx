"use client";

import { useFavorites } from '@/app/context/FavoritesContext';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useState } from 'react';
import CartButton from '@/app/components/CartButton';
import SearchBar from '@/app/components/SearchBar';
import FavoritesButton from '@/app/components/FavoritesButton';

export default function FavoritosPage() {
  const { favorites, removeFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveFavorite = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFavorite(id);
      setRemovingId(null);
    }, 300);
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Banner Azul Fijo */}
      <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="w-full px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4 md:gap-6 w-full">
            {/* Logo y Nombre - Izquierda */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0">
              <Image
                src="/logo.png"
                alt="CPS Material Deportivo Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <div className="text-white text-xl md:text-2xl lg:text-3xl font-bold tracking-tight whitespace-nowrap">
                CPS Material Deportivo
              </div>
            </Link>
            
            {/* Menú de Navegación - Centro */}
            <ul className="flex items-center gap-2 md:gap-4 lg:gap-6 flex-1 justify-center text-sm md:text-base lg:text-lg">
              <li>
                <Link href="/" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-2 whitespace-nowrap">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/material-escolar" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-2 whitespace-nowrap">
                  Material Escolar
                </Link>
              </li>
              <li>
                <Link href="/deporte-individual" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-2 whitespace-nowrap">
                  Deporte Individual
                </Link>
              </li>
              <li>
                <Link href="/deportes-colectivos" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-2 whitespace-nowrap">
                  Deportes Colectivos
                </Link>
              </li>
              <li>
                <Link href="/material-complementario" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-2 whitespace-nowrap">
                  Material Complementario
                </Link>
              </li>
              <li>
                <Link href="/equipacion-textil" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-2 whitespace-nowrap">
                  Equipación Textil
                </Link>
              </li>
            </ul>
            
            {/* Búsqueda y Carrito - Derecha */}
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <div className="hidden md:block">
                <SearchBar />
              </div>
              <FavoritesButton />
              <CartButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
            Mis Favoritos
          </h1>
          <p className="text-gray-600">
            {favorites.length === 0 
              ? "No tienes productos favoritos aún" 
              : `${favorites.length} ${favorites.length === 1 ? 'producto favorito' : 'productos favoritos'}`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Tu lista de favoritos está vacía
            </h2>
            <p className="text-gray-600 mb-6">
              Explora nuestros productos y añade tus favoritos haciendo clic en el corazón
            </p>
            <Link
              href="/"
              className="inline-block bg-[#003366] hover:bg-[#004488] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col ${
                  removingId === product.id ? 'opacity-50' : ''
                }`}
              >
                <Link href={`/articulos/${product.slug}`} className="flex-1 flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-[#003366] mt-auto">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
                
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Añadir a la cesta
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Quitar de favoritos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
