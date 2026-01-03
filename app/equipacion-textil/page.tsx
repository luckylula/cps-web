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
}

export default function EquipacionTextilPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products?category=equipacion-textil');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Error fetching products:', response.status);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

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
                <Link href="/material-escolar" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
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
                <Link href="/equipacion-textil" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 border-b-2 border-orange-300 hidden md:inline">
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
            Equipación Textil
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Equipación completa para todas tus necesidades deportivas.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">
            Productos
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
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

      {/* CTA Section */}
      <section className="py-16 px-8 bg-[#003366]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-light text-white mb-6 tracking-tight">
            ¿Necesitas más información?
          </h2>
          <p className="text-xl text-white/90 mb-8 font-light">
            Contacta con nosotros para recibir asesoramiento personalizado.
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

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
