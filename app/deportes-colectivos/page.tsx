"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const categories = {
  futbol: {
    title: "Fútbol / Fútbol Sala",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    items: [
      "Portería multiusos plegable metálica",
      "Portería desmontable",
      "Balón de fútbol TPU",
      "Balón Softee Strike Fut. 11",
      "Balón Softee Seal",
      "Balón Softee React",
      "Balón Softee Position",
      "Balón Softee Maximum",
      "Balón Softee Iconic Fut 11",
      "Balón Softee Denim",
      "Balón Inter Fut.11",
      "Balón Molten T7",
      "Balón Molten T6",
      "Balón Molten T5",
      "Balón Softee Park",
      "Red de fútbol",
      "Conos de entrenamiento",
      "Petos deportivos"
    ]
  },
  baloncesto: {
    title: "Baloncesto",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    items: [
      "Balón Cuero Rox Dunk",
      "Basket Naranja Caucho Celular del 5-7",
      "Nylon del 3-7",
      "Balón MIKASA B-6",
      "Balón Minibasket N-7",
      "Balón Minibasket",
      "Juego de canastas trasladables",
      "Aro macizo galvanizado",
      "Aro tubo Deluxe",
      "Red de baloncesto",
      "Canasta baloncesto portátil",
      "Bomba de inflado"
    ]
  },
  balonmano: {
    title: "Balonmano",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
    items: [
      "Portería desmontable",
      "Balón balonmano Softee Heros",
      "Balón balonmano Flash Elite",
      "Balón balonmano Softee Flash",
      "Balón balonmano Softee Microcelular",
      "Balón balonmano Soft TPE",
      "Carro de portería",
      "Red de balonmano",
      "Resina para balonmano"
    ]
  },
  voleibol: {
    title: "Voleibol / Voley Playa",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
    items: [
      "Voleibol Playa Cuero Sintético",
      "Balón Volley Playa Cuero Cosido",
      "Balón Voleybeach",
      "Volley Cuero",
      "Balón Voley MIKASA 200",
      "Balón Voley MIKASA",
      "Balón Molten Voley",
      "Balón Voleibol SILVA",
      "Balón Voleibol Softee Soft",
      "Balón Voleibol Softee Iniciación PVC",
      "Red de voleibol",
      "Postes de voleibol",
      "Antenas de voleibol"
    ]
  },
  waterpolo: {
    title: "Waterpolo",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    items: [
      "Portería Waterpolo",
      "Waterpolo Caucho Celular",
      "Mini Waterpolo Caucho Celular",
      "Balón waterpolo talla 5",
      "Balón waterpolo talla 4",
      "Balón waterpolo talla 3",
      "Gorro waterpolo",
      "Red waterpolo"
    ]
  },
  rugby: {
    title: "Rugby",
    image: "https://images.unsplash.com/photo-1512224540965-556597a1bff?w=800&q=80",
    items: [
      "Plot Rugby",
      "Minirugbi Caucho Celular T3",
      "Rugbi Caucho Celular T5",
      "Balón Rugby DERBY",
      "Pelota Rugby con Relieve",
      "Pelota Rugby Torbellino",
      "Balón rugby talla 4",
      "Balón rugby talla 3",
      "Conos de entrenamiento"
    ]
  },
  hockey: {
    title: "Hockey",
    image: "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&q=80",
    items: [
      "Portería Hockey Acero",
      "Set Hockey Foam 12 Mazas + Pelota",
      "Stick De Hockey Deluxe",
      "Stick Hockey Hierba",
      "Stick Hockey 0,95mt",
      "Stick Hockey 0,85mt",
      "Set mini Hockey",
      "Pelota Hockey",
      "Pelota Hockey 100mm",
      "Pelota Hockey 70mm",
      "Pastilla Hockey"
    ]
  },
  beisbol: {
    title: "Béisbol",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80",
    items: [
      "Bases de Caucho",
      "Soporte Prebéisbol",
      "Pelota Piel Baseball",
      "Pelota Béisbol Soft",
      "Pelota béisbol FOAM",
      "Guante Béisbol Adulto",
      "Bate de Béisbol Regulable",
      "Bate de Béisbol Aluminio",
      "Bate de Béisbol Madera 69cm",
      "Bate de Béisbol de madera 90cm",
      "Guante de Béisbol Junior",
      "Bate de béisbol FOAM"
    ]
  }
};

type CategoryKey = keyof typeof categories;

export default function DeportesColectivosPage() {
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
                <Link href="/deportes-colectivos" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 border-b-2 border-orange-300">
                  Deportes Colectivos
                </Link>
              </li>
              <li>
                <Link href="/#material-complementario" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 hidden md:inline">
                  Material Complementario
                </Link>
              </li>
              <li>
                <Link href="/#equipacion-textil" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 hidden md:inline">
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
            Deportes Colectivos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            El éxito del equipo es tu éxito. Encuentra todo el material necesario
            para entrenar y competir con tu equipo al más alto nivel.
          </p>
        </div>
      </section>

      {/* Image Section */}
      <section className="px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[500px] bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80"
                alt="Deportes colectivos"
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
              ¿Necesitas equipar a tu equipo?
            </h2>
            <p className="text-xl text-white/90 mb-8 font-light">
              Contacta con nosotros para recibir asesoramiento personalizado y ofertas especiales para equipos.
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
