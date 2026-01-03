"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
}

// Category slug mapping for Material Escolar
const categorySlugMap: Record<string, string> = {
  psicomotricidad: 'psicomotricidad',
  figurasEspuma: 'figuras-espuma',
  balonesEscolares: 'balones-escolares',
  juegosAlternativos: 'juegos-alternativos',
  educacionInfantil: 'educacion-infantil',
  malabares: 'malabares',
  materialFoam: 'material-foam',
  colchonetas: 'colchonetas',
  educacionMusical: 'educacion-musical',
};

// Fallback images for categories
const categoryImages: Record<string, string> = {
  psicomotricidad: "/categorias/material-escolar/psicomotricidad.png",
  'figuras-espuma': "/categorias/material-escolar/figuras-espuma.jpg",
  'balones-escolares': "/categorias/material-escolar/balones-escolares.jpg",
  'juegos-alternativos': "/categorias/material-escolar/juegos-alternativos.jpg",
  'educacion-infantil': "/categorias/material-escolar/educacion-infantil.jpg",
  malabares: "/categorias/material-escolar/malabares.jpg",
  'material-foam': "/categorias/material-escolar/material-foam.jpg",
  colchonetas: "/categorias/material-escolar/colchonetas.jpg",
  'educacion-musical': "/categorias/material-escolar/educacion-musical.jpg",
};

type CategoryKey = keyof typeof categorySlugMap;

export default function MaterialEscolarPage() {
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        
        // Fetch all Material Escolar categories in one request
        console.log('Fetching Material Escolar categories...');
        const response = await fetch('/api/material-escolar/categories');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch categories:', response.status, errorData);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Categories response:', data);
        
        if (data.success && data.categories) {
          setCategories(data.categories);
          console.log('Loaded categories:', Object.keys(data.categories).length);
        } else {
          console.warn('No categories in response:', data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryKey: CategoryKey) => {
    setSelectedCategory(categoryKey);
    setTimeout(() => {
      document.getElementById('productos-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

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
                <Link href="/#cesta" className="text-white hover:text-orange-300 transition-colors font-medium bg-orange-500 px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-orange-600 whitespace-nowrap">
                  Mi Cesta
                </Link>
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

      {/* Categories Grid */}
      {!selectedCategory ? (
        <section className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">
              Categorías
            </h2>
            {Object.keys(categories).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No hay categorías disponibles</p>
                <p className="text-sm text-gray-400 mb-4">
                  Asegúrate de que la base de datos ha sido poblada ejecutando:
                </p>
                <code className="bg-gray-100 px-4 py-2 rounded text-sm">
                  npm run seed:complete
                </code>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(categories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryClick(key as CategoryKey)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-left"
                  >
                    <div className="relative h-64 bg-gray-200 overflow-hidden">
                      <Image
                        src={category.image || categoryImages[category.slug] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white text-xl font-semibold">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 text-sm">
                        {category.products?.length || 0} productos disponibles
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section id="productos-section" className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a categorías
            </button>

            {/* Selected Category */}
            {categories[selectedCategory] && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
                <div className="mb-8">
                  <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-6">
                    <Image
                      src={categories[selectedCategory].image || categoryImages[categories[selectedCategory].slug] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"}
                      alt={categories[selectedCategory].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-4xl font-light text-gray-900 mb-4">
                    {categories[selectedCategory].name}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {categories[selectedCategory].products?.length || 0} productos disponibles
                  </p>
                </div>

                {/* Products List */}
                {categories[selectedCategory].products && categories[selectedCategory].products!.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories[selectedCategory].products!.map((product) => {
                      const hasPage = [
                        'ladrillo-con-soporte',
                        'trampolin',
                        'balon-voleibol-silva',
                        'colchoneta-escolar',
                        'set-percusion-mediano',
                        'pelota-foam-delux90'
                      ].includes(product.slug);

                      return (
                        <div
                          key={product.id}
                          className={`p-4 rounded-xl border transition-all duration-300 ${
                            hasPage
                              ? 'border-gray-200 hover:border-orange-500 hover:shadow-lg cursor-pointer bg-white'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          {hasPage ? (
                            <Link
                              href={`/articulos/${product.slug}`}
                              className="block"
                            >
                              <h3 className="text-gray-900 font-medium hover:text-orange-500 transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="text-gray-700 font-medium">
                              {product.name}
                            </h3>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!selectedCategory && (
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
