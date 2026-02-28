"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/app/components/ProductCard";
import CartButton from "@/app/components/CartButton";
import SearchBar from "@/app/components/SearchBar";
import FavoritesButton from "@/app/components/FavoritesButton";
import Navigation from "@/app/components/Navigation";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  images: string[];
  featured: boolean;
  categoryId: string;
  subcategory?: string | null;
  marca?: string | null;
  sku_interno?: string | null;
  stock: number;
  hasStock?: boolean;
}

interface Subcategory {
  name: string;
  slug: string;
  image: string;
}

const subcategories: Subcategory[] = [
  {
    name: 'Camisetas',
    slug: 'Camisetas',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    name: 'Pantalones',
    slug: 'Pantalones',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
  },
  {
    name: 'Shorts',
    slug: 'Shorts',
    image: 'https://images.unsplash.com/photo-1594736797933-d0c0c0e0c0e0?w=800&q=80',
  },
  {
    name: 'Chándales',
    slug: 'Chándales',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
  },
  {
    name: 'Sudaderas',
    slug: 'Sudaderas',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
  },
  {
    name: 'Uniformes',
    slug: 'Uniformes',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  },
  {
    name: 'Calcetines',
    slug: 'Calcetines',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  },
  {
    name: 'Gorras y Accesorios',
    slug: 'Gorras y Accesorios',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
];

export default function EquipacionTextilPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const fetchProducts = async (subcategory: string | null = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: 'equipacion-textil',
        ...(subcategory && { subcategory }),
      });
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Error fetching products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
    fetchProducts(subcategoryName);
    // Scroll suave a la sección de productos
    setTimeout(() => {
      document.getElementById('productos-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
    setProducts([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section - Estilo Minimalista */}
      <section className="pt-16 pb-12 px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            Equipación Textil
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Equipación completa para todas tus necesidades deportivas.
          </p>
        </div>
      </section>

      {/* Subcategories or Products Section - Estilo Minimalista */}
      {!selectedSubcategory ? (
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-12 text-center">
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.slug}
                  onClick={() => handleSubcategoryClick(subcategory.name)}
                  className="group bg-white overflow-hidden cursor-pointer text-left"
                >
                  <div className="relative h-80 bg-gray-100 overflow-hidden">
                    <Image
                      src={subcategory.image}
                      alt={subcategory.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="text-gray-900 font-medium text-lg mb-1">
                      {subcategory.name}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section id="productos-section" className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Botón Volver */}
            <button
              onClick={handleBackToSubcategories}
              className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-lg md:text-xl font-medium"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            {/* Título de la Subcategoría */}
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
                {selectedSubcategory}
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
            </div>

            {/* Productos */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-lg md:text-xl text-gray-600">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-lg md:text-xl text-gray-500">No hay productos disponibles en esta subcategoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    images={product.images}
                    featured={product.featured}
                    categoryId={product.categoryId}
                    marca={product.marca}
                    sku_interno={product.sku_interno}
                    stock={product.stock}
                    hasStock={product.hasStock}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section - Estilo Minimalista */}
      {!selectedSubcategory && (
        <section className="py-16 px-8 bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-tight">
              ¿Necesitas más información?
            </h2>
            <p className="text-lg text-gray-400 mb-8 font-light">
              Contacta con nosotros para recibir asesoramiento personalizado.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/#contacto"
                className="px-8 py-3 bg-white text-black font-semibold transition-colors hover:bg-gray-100 uppercase tracking-wide text-sm"
              >
                Contactar
              </Link>
              <Link
                href="/catalogo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-black text-white border border-white font-semibold hover:bg-gray-900 transition-colors uppercase tracking-wide text-sm"
              >
                Ver Catálogo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Services S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
