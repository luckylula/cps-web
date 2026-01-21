"use client";

export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/app/components/ProductCard";
import CartButton from "@/app/components/CartButton";
import SearchBar from "@/app/components/SearchBar";
import FavoritesButton from "@/app/components/FavoritesButton";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  images: string[];
  featured: boolean;
  category: {
    name: string;
  };
  subcategory?: string | null;
}

interface Subcategory {
  name: string;
  slug: string;
  image: string;
}

const subcategories: Subcategory[] = [
  {
    name: 'Fútbol / F. Sala',
    slug: 'Fútbol / F. Sala',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
  },
  {
    name: 'Baloncesto',
    slug: 'Baloncesto',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  },
  {
    name: 'Balonmano',
    slug: 'Balonmano',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  },
  {
    name: 'Voleibol / Voley Playa',
    slug: 'Voleibol / Voley Playa',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  },
  {
    name: 'Waterpolo',
    slug: 'Waterpolo',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
  },
  {
    name: 'Rugby',
    slug: 'Rugby',
    image: 'https://images.unsplash.com/photo-1512224540965-556597a1bff?w=800&q=80',
  },
  {
    name: 'Hockey',
    slug: 'Hockey',
    image: 'https://images.unsplash.com/photo-1512224540965-556597a1bff?w=800&q=80',
  },
  {
    name: 'Béisbol',
    slug: 'Béisbol',
    image: 'https://images.unsplash.com/photo-1512224540965-556597a1bff?w=800&q=80',
  },
];

export default function DeportesColectivosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const fetchProducts = async (subcategory: string | null = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: 'deportes-colectivos',
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
      {/* Navigation - Estilo Minimalista */}
      <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4 md:gap-6 w-full">
            {/* Logo y Nombre - Izquierda */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
              <Image
                src="/logo.png"
                alt="CPS Material Deportivo Logo"
                width={100}
                height={100}
                className="object-contain"
              />
              <div className="text-gray-900 text-lg md:text-xl lg:text-2xl font-semibold tracking-tight whitespace-nowrap">
                CPS Material Deportivo
              </div>
            </Link>
            
            {/* Menú de Navegación - Centro */}
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-1 justify-center text-base md:text-lg lg:text-xl font-medium">
              <li>
                <Link href="/" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/material-escolar" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Material Escolar
                </Link>
              </li>
              <li>
                <Link href="/deporte-individual" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Deporte Individual
                </Link>
              </li>
              <li>
                <Link href="/deportes-colectivos" className="text-gray-900 hover:text-gray-600 transition-colors py-2 border-b-2 border-gray-900 whitespace-nowrap">
                  Deportes Colectivos
                </Link>
              </li>
              <li>
                <Link href="/material-complementario" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap hidden lg:inline">
                  Material Complementario
                </Link>
              </li>
              <li>
                <Link href="/equipacion-textil" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap hidden lg:inline">
                  Equipación Textil
                </Link>
              </li>
            </ul>
            
            {/* Búsqueda, Favoritos y Carrito - Derecha */}
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

      {/* Hero Section - Estilo Minimalista */}
      <section className="pt-16 pb-12 px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            Deportes Colectivos
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Cada deporte cuenta con su equipación. Encuentra material para entrenar y practicar deportes en equipo.
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
                    category={product.category}
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
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
