"use client";

import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import SafeImage from "@/app/components/SafeImage";
import { useFavorites } from "@/app/context/FavoritesContext";
import { getFirstValidImage } from "@/app/lib/imageUtils";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";

export default function FavoritosPage() {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddToCart = (item: { id: string; name: string; slug: string; price: number; images: string[] }) => {
    setAddingId(item.id);
    addItem({
      id: `product-${item.id}`,
      productId: Number(item.id),
      name: item.name,
      slug: item.slug,
      price: item.price,
      images: item.images,
    });
    setTimeout(() => setAddingId(null), 300);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
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
            </div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">No tienes favoritos</h2>
            <p className="text-gray-600 mb-6">
              Los productos que marques con el corazón aparecerán aquí.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#003366] hover:bg-[#004080] text-white font-medium rounded-lg transition-colors"
            >
              Explorar productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-8 tracking-tight">
          Mis Favoritos ({favorites.length})
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <Link href={`/articulos/${item.slug}`} className="flex flex-col flex-1">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <SafeImage
                    src={getFirstValidImage(item.images) || ""}
                    alt={item.name}
                    fill
                    className="group-hover:scale-105 transition-transform duration-300 object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(item.id);
                    }}
                    className="absolute top-2 left-2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors shadow-sm z-10"
                    aria-label="Quitar de favoritos"
                  >
                    <svg
                      className="w-4 h-4 text-red-500 fill-red-500"
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
                  <h2 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h2>
                  <div className="mt-auto">
                    {item.price > 0 ? (
                      <p className="text-lg font-semibold text-gray-900">
                        {item.price.toFixed(2)} €
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Consultar precio</p>
                    )}
                  </div>
                </div>
              </Link>
              <div className="p-4 pt-0">
                {item.price > 0 ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!!addingId}
                    className="w-full bg-[#003366] hover:bg-[#004080] text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {addingId === item.id ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Añadiendo...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Añadir a la cesta
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/articulos/${item.slug}`}
                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg text-center text-sm transition-colors"
                  >
                    Ver detalles
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
