"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const categories = {
  camisetas: {
    title: "Camisetas",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    items: [
      "Camiseta deportiva manga corta",
      "Camiseta deportiva manga larga",
      "Camiseta técnica transpirable",
      "Camiseta algodón 100%",
      "Camiseta poliéster",
      "Camiseta personalizada",
      "Camiseta entrenamiento",
      "Camiseta competición",
      "Camiseta infantil",
      "Camiseta adulto",
      "Camiseta unisex",
      "Camiseta polo deportiva"
    ]
  },
  pantalones: {
    title: "Pantalones",
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80",
    items: [
      "Pantalón deportivo largo",
      "Pantalón deportivo corto",
      "Pantalón chándal",
      "Pantalón técnico transpirable",
      "Pantalón algodón",
      "Pantalón poliéster",
      "Pantalón con cremalleras",
      "Pantalón ajustable",
      "Pantalón infantil",
      "Pantalón adulto",
      "Pantalón unisex",
      "Pantalón compresión"
    ]
  },
  shorts: {
    title: "Shorts",
    image: "https://images.unsplash.com/photo-1594736797933-d0c0c0e0c0e0?w=800&q=80",
    items: [
      "Short deportivo básico",
      "Short running",
      "Short fútbol",
      "Short baloncesto",
      "Short compresión",
      "Short con bolsillos",
      "Short técnico",
      "Short algodón",
      "Short poliéster",
      "Short infantil",
      "Short adulto",
      "Short unisex"
    ]
  },
  chandales: {
    title: "Chándales",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    items: [
      "Chándal completo",
      "Chándal con capucha",
      "Chándal sin capucha",
      "Chándal técnico",
      "Chándal algodón",
      "Chándal poliéster",
      "Chándal personalizado",
      "Chándal entrenamiento",
      "Chándal competición",
      "Chándal infantil",
      "Chándal adulto",
      "Chándal unisex"
    ]
  },
  sudaderas: {
    title: "Sudaderas",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    items: [
      "Sudadera con capucha",
      "Sudadera sin capucha",
      "Sudadera con cremallera",
      "Sudadera básica",
      "Sudadera técnica",
      "Sudadera algodón",
      "Sudadera poliéster",
      "Sudadera personalizada",
      "Sudadera infantil",
      "Sudadera adulto",
      "Sudadera unisex",
      "Sudadera entrenamiento"
    ]
  },
  uniformes: {
    title: "Uniformes",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    items: [
      "Uniforme fútbol completo",
      "Uniforme baloncesto completo",
      "Uniforme voleibol completo",
      "Uniforme balonmano completo",
      "Uniforme personalizado",
      "Uniforme primera equipación",
      "Uniforme segunda equipación",
      "Uniforme entrenamiento",
      "Uniforme competición",
      "Uniforme infantil",
      "Uniforme adulto",
      "Uniforme con personalización"
    ]
  },
  calcetines: {
    title: "Calcetines",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80",
    items: [
      "Calcetines deportivos",
      "Calcetines running",
      "Calcetines fútbol",
      "Calcetines baloncesto",
      "Calcetines compresión",
      "Calcetines técnicos",
      "Calcetines algodón",
      "Calcetines poliéster",
      "Calcetines personalizados",
      "Calcetines infantiles",
      "Calcetines adultos",
      "Pack calcetines"
    ]
  },
  gorras: {
    title: "Gorras y Accesorios",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
    items: [
      "Gorra deportiva",
      "Gorra ajustable",
      "Gorra personalizada",
      "Gorra técnica",
      "Visera deportiva",
      "Pañuelo deportivo",
      "Braga cuello",
      "Muñequeras",
      "Cintas para el pelo",
      "Gafas deportivas",
      "Guantes deportivos",
      "Accesorios personalizados"
    ]
  }
};

type CategoryKey = keyof typeof categories;

export default function EquipacionTextilPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

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
                <Link href="/#deportes-colectivos" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Deportes Colectivos
                </Link>
              </li>
              <li>
                <Link href="/#material-complementario" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 hidden md:inline">
                  Material Complementario
                </Link>
              </li>
              <li>
                <Link href="/equipacion-textil" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 border-b-2 border-orange-300">
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
            Equipación Textil
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Viste tu equipo. Equipación completa para todas tus necesidades deportivas.
            Desde camisetas y pantalones hasta uniformes personalizados.
          </p>
        </div>
      </section>

      {/* Image Section */}
      <section className="px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[500px] bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80"
                alt="Equipación textil deportiva"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(categories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key as CategoryKey)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-left"
                >
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-semibold">
                        {category.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm">
                      {category.items.length} productos disponibles
                    </p>
                  </div>
                </button>
              ))}
            </div>
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
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
              <div className="mb-8">
                <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={categories[selectedCategory].image}
                    alt={categories[selectedCategory].title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="text-4xl font-light text-gray-900 mb-4">
                  {categories[selectedCategory].title}
                </h2>
                <p className="text-lg text-gray-600">
                  {categories[selectedCategory].items.length} productos disponibles
                </p>
              </div>

              {/* Products List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories[selectedCategory].items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 transition-all duration-300"
                  >
                    <h3 className="text-gray-700 font-medium">
                      {item}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
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
              Contacta con nosotros para recibir asesoramiento personalizado sobre nuestra equipación textil.
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
