"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProductCard from "@/app/components/ProductCard";
import CartButton from "@/app/components/CartButton";

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
    name: 'Psicomotricidad',
    slug: 'Psicomotricidad',
    image: '/categorias/material-escolar/psicomotricidad.png',
  },
  {
    name: 'Figuras espuma',
    slug: 'Figuras espuma',
    image: '/categorias/material-escolar/figuras-espuma.jpg',
  },
  {
    name: 'Balones de uso escolar',
    slug: 'Balones de uso escolar',
    image: '/categorias/material-escolar/balones-escolares.jpg',
  },
  {
    name: 'Juegos alternativos',
    slug: 'Juegos alternativos',
    image: '/categorias/material-escolar/juegos-alternativos.jpg',
  },
  {
    name: 'Malabares',
    slug: 'Malabares',
    image: '/categorias/material-escolar/malabares.jpg',
  },
  {
    name: 'Juegos en Educación infantil',
    slug: 'Juegos en Educación infantil',
    image: '/categorias/material-escolar/educacion-infantil.jpg',
  },
  {
    name: 'Material foam',
    slug: 'Material foam',
    image: '/categorias/material-escolar/material-foam.jpg',
  },
  {
    name: 'Colchonetas',
    slug: 'Colchonetas',
    image: '/categorias/material-escolar/colchonetas.jpg',
  },
  {
    name: 'Educación musical',
    slug: 'Educación musical',
    image: '/categorias/material-escolar/educacion-musical.jpg',
  },
];

export default function MaterialEscolarPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const fetchProducts = async (subcategory: string | null = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: 'material-escolar',
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
      {/* Navigation Banner Azul Fijo */}
      <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
            <Link href="/" className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors">
              CPS Material Deportivo
            </Link>
            <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
              <li>
                <Link href="/" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/material-escolar" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 border-b-2 border-orange-300">
                  Material Escolar
                </Link>
              </li>
              <li>
                <Link href="/deporte-individual" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Deporte Individual
                </Link>
              </li>
              <li>
                <Link href="/deportes-colectivos" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Deportes Colectivos
                </Link>
              </li>
              <li>
                <Link href="/material-complementario" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 hidden md:inline">
                  Material Complementario
                </Link>
              </li>
              <li>
                <Link href="/equipacion-textil" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 hidden md:inline">
                  Equipación Textil
                </Link>
              </li>
              <li>
                <CartButton />
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            Material Escolar
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Artículos que te permiten enseñar y crear un entorno de aprendizaje deportivo.
            Todo lo necesario para centros educativos, desde psicomotricidad hasta educación musical.
          </p>
        </div>
      </section>

      {/* Image Section */}
      <section className="px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[500px] bg-gray-200">
              <Image
                src="/material_escolar_cps.png"
                alt="Material escolar"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories or Products Section */}
      {!selectedSubcategory ? (
        <section className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">
              Subcategorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.slug}
                  onClick={() => handleSubcategoryClick(subcategory.name)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-left"
                >
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    <Image
                      src={subcategory.image}
                      alt={subcategory.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-semibold">
                        {subcategory.name}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section id="productos-section" className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Botón Volver */}
            <button
              onClick={handleBackToSubcategories}
              className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Subcategorías
            </button>

            {/* Título de la Subcategoría */}
            <div className="mb-8">
              <h2 className="text-4xl font-light text-gray-900 mb-2">
                {selectedSubcategory}
              </h2>
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
            </div>

            {/* Productos */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No hay productos disponibles en esta subcategoría</p>
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

      {/* CTA Section - Solo mostrar si no hay subcategoría seleccionada */}
      {!selectedSubcategory && (
        <section className="py-16 px-8 bg-[#003366]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-light text-white mb-6 tracking-tight">
              ¿Necesitas más información?
            </h2>
            <p className="text-xl text-white/90 mb-8 font-light">
              Contacta con nosotros para recibir asesoramiento personalizado sobre nuestro material escolar.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/#contacto"
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors"
              >
                Contactar
              </Link>
              <Link
                href="/catalogo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white text-[#003366] font-semibold rounded-full hover:bg-gray-100 transition-colors"
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
