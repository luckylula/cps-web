"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "@/app/components/ProductCard";
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
}

interface Subcategory {
  name: string;
  slug: string;
  image: string;
}

const subcategories: Subcategory[] = [
  {
    name: 'Psicomotricidad',
    slug: 'psicomotricidad',
    image: '/categorias/material-escolar/psicomotricidad.png',
  },
  {
    name: 'Figuras espuma',
    slug: 'figuras-espuma',
    image: '/categorias/material-escolar/figuras-espuma.jpg',
  },
  {
    name: 'Balones de uso escolar',
    slug: 'balones-escolares',
    image: '/categorias/material-escolar/balones-escolares.jpg',
  },
  {
    name: 'Juegos alternativos',
    slug: 'juegos-alternativos',
    image: '/categorias/material-escolar/juegos-alternativos.jpg',
  },
  {
    name: 'Malabares',
    slug: 'malabares',
    image: '/categorias/material-escolar/malabares.jpg',
  },
  {
    name: 'Juegos en Educación infantil',
    slug: 'educacion-infantil',
    image: '/categorias/material-escolar/educacion-infantil.jpg',
  },
  {
    name: 'Material foam',
    slug: 'material-foam',
    image: '/categorias/material-escolar/material-foam.jpg',
  },
  {
    name: 'Colchonetas',
    slug: 'colchonetas',
    image: '/categorias/material-escolar/colchonetas.jpg',
  },
  {
    name: 'Educación musical',
    slug: 'educacion-musical',
    image: '/categorias/material-escolar/educacion-musical.jpg',
  },
];

const SUBCATEGORY_PARAM = "subcategory";

export default function MaterialEscolarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Sync selected subcategory from URL so "Material Escolar" in nav always goes back to main view
  const subcategorySlugFromUrl = searchParams.get(SUBCATEGORY_PARAM);
  const subcategoryFromSlug = subcategorySlugFromUrl
    ? subcategories.find((s) => s.slug === subcategorySlugFromUrl)
    : null;
  const subcategoryNameFromUrl = subcategoryFromSlug?.name ?? null;

  const fetchProducts = useCallback(async (subcategoryName?: string) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        category: 'material-escolar',
      });

      if (subcategoryName) {
        params.append('subcategory', subcategoryName);
      }

      const url = `/api/products?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('[MaterialEscolar] Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedSubcategory(subcategoryNameFromUrl);
    if (subcategoryNameFromUrl) {
      fetchProducts(subcategoryNameFromUrl);
    } else {
      setProducts([]);
    }
  }, [subcategorySlugFromUrl, subcategoryNameFromUrl, fetchProducts]);

  const handleSubcategoryClick = (subcategoryName: string, subcategorySlug: string) => {
    router.push(`/material-escolar?${SUBCATEGORY_PARAM}=${encodeURIComponent(subcategorySlug)}`);
    setTimeout(() => {
      document.getElementById('productos-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBackToSubcategories = () => {
    router.push('/material-escolar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-16 pb-12 px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            Material Escolar
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Artículos que te permiten enseñar y crear un entorno de aprendizaje deportivo.
            Todo lo necesario para centros educativos, desde psicomotricidad hasta educación musical.
          </p>
        </div>
      </section>

      {!selectedSubcategory ? (
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.slug}
                  onClick={() => handleSubcategoryClick(subcategory.name, subcategory.slug)}
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
            <button
              onClick={handleBackToSubcategories}
              className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-lg md:text-xl font-medium"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
                {selectedSubcategory}
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
            </div>

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
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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

      <footer className="py-8 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
