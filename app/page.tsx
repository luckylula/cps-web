"use client";

export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import ImageCarousel from "./components/ImageCarousel";
import Navigation from "@/app/components/Navigation";
import ContactForm from "./components/ContactForm";

export default function Home() {
  const categories = {
    escolar: {
      title: "Material Escolar",
      subtitle: "Para aprender",
      description: "Equipamiento seguro y resistente para centros educativos.",
      items: [
        "Psicomotricidad",
        "Figuras espuma",
        "Balones de uso escolar",
        "Juegos alternativos",
        "Iniciación deportiva",
        "Juegos en Educación infantil",
        "Material foam",
        "Colchonetas",
        "Educación musical"
      ]
    },
    individual: {
      title: "Deporte Individual",
      subtitle: "Logra tus propios méritos",
      description: "Material técnico para el rendimiento personal.",
      items: [
        "Tenis de Mesa",
        "Tenis",
        "Padel",
        "Badminton",
        "Atletismo",
        "Gimnasia rítmica",
        "Piscina",
        "Yoga",
        "Pilates"
      ]
    },
    colectivo: {
      title: "Deportes Colectivos",
      subtitle: "Rinde en equipo",
      description: "Soluciones completas para el juego en equipo.",
      items: [
        "Fútbol / F. Sala",
        "Baloncesto",
        "Balonmano",
        "Voleibol / Voley Playa",
        "Waterpolo",
        "Rugby",
        "Hockey",
        "Béisbol"
      ]
    },
    complementario: {
      title: "Material Complementario",
      subtitle: "Entrénate",
      description: "Todo lo que completa tu espacio deportivo.",
      items: [
        "Material Entrenamiento",
        "Complemento de balones",
        "Preparación física",
        "Equipamiento gimnasio",
        "Balones medicinales"
      ]
    },
    textil: {
      title: "Equipación Textil",
      subtitle: "Viste tu equipo",
      description: "Ropa deportiva cómoda, funcional y duradera.",
      items: []
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Carousel */}
      <ImageCarousel />

      {/* Sección de Tarjetas de Categorías - Estilo Minimalista */}
      <section className="py-10 md:py-14 px-4 md:px-6 bg-white">
        <div className="max-w-[83%] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 tracking-tight">
              Nuestras Categorías
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Material deportivo de alta calidad para cada necesidad
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
            {/* Tarjeta Instalaciones */}
            <Link
              href="/instalaciones"
              className="group bg-white overflow-hidden cursor-pointer"
            >
              <div className="relative h-96 md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100">
                <video
                  src="/categorias/instalacionesvideo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              <div className="pt-3">
                <h3 className="text-gray-900 font-medium text-lg mb-1">Instalaciones</h3>
                <p className="text-gray-600 text-sm">
                  Equipamiento para instalaciones deportivas
                </p>
              </div>
            </Link>

            {/* Tarjeta Material Escolar */}
            <Link
              href="/material-escolar"
              className="group bg-white overflow-hidden cursor-pointer"
            >
              <div className="relative h-96 md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100">
                <video
                  src="/categorias/materialescolar.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              <div className="pt-3">
                <h3 className="text-gray-900 font-medium text-lg mb-1">Material Escolar</h3>
                <p className="text-gray-600 text-sm">
                  Material deportivo escolar
                </p>
              </div>
            </Link>

            {/* Tarjeta Deportes */}
            <Link
              href="/deportes"
              className="group bg-white overflow-hidden cursor-pointer"
            >
              <div className="relative h-96 md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100">
                <video
                  src="/categorias/deportes.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              <div className="pt-3">
                <h3 className="text-gray-900 font-medium text-lg mb-1">Deportes</h3>
                <p className="text-gray-600 text-sm">
                  Material y equipamiento deportivo
                </p>
              </div>
            </Link>

            {/* Tarjeta Textil */}
            <Link
              href="/textil"
              className="group bg-white overflow-hidden cursor-pointer"
            >
              <div className="relative h-96 md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100">
                <video
                  src="/categorias/textil.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              <div className="pt-3">
                <h3 className="text-gray-900 font-medium text-lg mb-1">Textil</h3>
                <p className="text-gray-600 text-sm">
                  Ropa y calzado deportivo
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section - Estilo Minimalista */}
      <section className="pt-10 pb-12 px-8 relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Título arriba de todo */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8 tracking-tight text-center">
            Material Deportivo
            <br />
            <span className="font-normal">de Alta Calidad</span>
          </h1>
          {/* Imagen izquierda | Párrafo | Imagen derecha */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {/* Imagen izquierda */}
            <div className="hidden md:block flex-shrink-0 w-64 lg:w-80 h-64 lg:h-80 overflow-hidden">
              <Image
                src="/categorias/material1.png"
                alt="Material deportivo"
                width={320}
                height={320}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Párrafo entre las dos imágenes */}
            <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl leading-relaxed text-center flex-1 order-first md:order-none">
              Distribuimos material deportivo para colegios, clubes deportivos, ayuntamientos, 
              instalaciones deportivas, piscinas y gimnasios en toda España.
            </p>
            {/* Imagen derecha */}
            <div className="hidden md:block flex-shrink-0 w-64 lg:w-80 h-64 lg:h-80 overflow-hidden">
              <Image
                src="/categorias/material2.jpg"
                alt="Material deportivo"
                width={320}
                height={320}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Imágenes en móvil (debajo del párrafo) */}
          <div className="flex md:hidden justify-center gap-6 mt-6">
            <div className="w-48 h-48 overflow-hidden">
              <Image
                src="/categorias/material1.png"
                alt="Material deportivo"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-48 h-48 overflow-hidden">
              <Image
                src="/categorias/material2.jpg"
                alt="Material deportivo"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Material Escolar Section - Estilo Minimalista */}
      <section id="material-escolar" className="py-12 md:py-14 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight">
              {categories.escolar.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.escolar.description}
            </p>
          </div>
          <div className="mb-8 overflow-hidden">
            <div className="relative h-[500px] bg-gray-100">
              <Image
                src="/categorias/materialescolar1.png"
                alt="Material escolar"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.escolar.items.map((item, index) => (
              <div
                key={index}
                className="text-center"
              >
                <h3 className="text-base font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deporte Individual Section - Estilo Minimalista */}
      <section id="deporte-individual" className="py-12 md:py-14 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight">
              {categories.individual.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.individual.description}
            </p>
          </div>
          <div className="mb-8 overflow-hidden">
            <div className="relative h-[500px] bg-gray-100">
              <Image
                src="/categorias/deporteindividual.png"
                alt="Deporte Individual"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.individual.items.map((item, index) => (
              <div
                key={index}
                className="text-center"
              >
                <h3 className="text-base font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deportes Colectivos Section - Estilo Minimalista */}
      <section id="deportes-colectivos" className="py-12 md:py-14 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight">
              {categories.colectivo.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.colectivo.description}
            </p>
          </div>
          <div className="mb-8 overflow-hidden">
            <div className="relative h-[500px] bg-gray-100">
              <Image
                src="/categorias/deportescolectivos.png"
                alt="Deportes Colectivos"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.colectivo.items.map((item, index) => (
              <div
                key={index}
                className="text-center"
              >
                <h3 className="text-base font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material Complementario Section - Estilo Minimalista */}
      <section id="material-complementario" className="py-12 md:py-14 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight">
              {categories.complementario.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.complementario.description}
            </p>
          </div>
          <div className="mb-8 overflow-hidden">
            <div className="relative h-[500px] bg-gray-100">
              <Image
                src="/categorias/materialcomplementario.png"
                alt="Material Complementario"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.complementario.items.map((item, index) => (
              <div
                key={index}
                className="text-center"
              >
                <h3 className="text-base font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipación Textil Section - Estilo Minimalista */}
      <section id="equipacion-textil" className="py-12 md:py-14 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight">
              {categories.textil.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.textil.description}
            </p>
          </div>
          <div className="overflow-hidden">
            <div className="relative h-[500px] bg-gray-100">
              <Image
                src="/categorias/equipaciontextil.png"
                alt="Equipación Textil"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section - ¿Quiénes somos? */}
      <section className="py-12 md:py-14 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            ¿Quiénes somos?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
            <div className="text-gray-600 font-light leading-relaxed space-y-4">
              <p className="text-lg">
                En Control Play somos, ante todo, amantes del deporte. Vivimos cada proyecto con la misma pasión con la que se practica en la pista o en el campo, y esa implicación se refleja en cada solución que ofrecemos.
              </p>
              <p className="text-lg">
                Nuestra experiencia profesional, unida a un trato cercano y honesto, nos permite acompañar a nuestros clientes en todo el proceso y lograr resultados excelentes. Creemos en el trabajo bien hecho, en el asesoramiento personalizado y en construir relaciones basadas en la confianza.
              </p>
              <p className="text-lg">
                Somos especialistas en la distribución de material deportivo para colectivos y profesionales en toda España: colegios, clubes deportivos, ayuntamientos, instalaciones deportivas, piscinas y gimnasios.
              </p>
              <p className="text-lg">
                Además, trabajamos con una amplia red de proveedores de confianza, lo que nos permite ofrecer soluciones completas y material adaptado a cualquier disciplina o necesidad deportiva.
              </p>
              <p className="text-lg font-medium text-gray-900">
                Todo lo que tu proyecto necesita, con la garantía de un equipo que vive el deporte.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg">
              <Image
                src="/somosequipo.png"
                alt="Equipo Control Play Sports"
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Estilo Minimalista */}
      <section id="contacto" className="py-8 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-3xl font-light mb-2 tracking-tight">
              Contacto
            </h2>
            <p className="text-sm text-gray-400 font-light">
              ¿Tienes preguntas? Estamos aquí para ayudarte.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">
            {/* Bloque izquierdo: Contacto - foto (no muy grande) y debajo el texto */}
            <div className="space-y-4">
              <div className="relative w-full max-w-[360px] aspect-[16/10] rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src="/categorias/contact.png"
                  alt="Contacto CPS Material Deportivo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 text-gray-300 text-sm">
                <p className="font-light">
                  <strong className="text-white">Control Play - Material Deportivo</strong>
                </p>
                <p className="font-light">
                  C/ Sant Miquel, 63<br />
                  Sant Vicenç dels Horts 08620<br />
                  Barcelona, Spain
                </p>
                <p className="font-light">
                  <strong className="text-white">Tel:</strong> 622 61 33 93
                </p>
                <p className="font-light">
                  <strong className="text-white">Email:</strong><br />
                  pedidos@cpmaterialdeportivo.com
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium mb-2">Horarios de oficina</h3>
                <div className="space-y-1 text-gray-300 text-sm font-light">
                  <p>Lunes - Jueves: 9:00 a 13:00 y 15:00 a 19:00</p>
                  <p>Viernes: 9:00 a 13:00 y 15:00 a 18:00</p>
                </div>
              </div>
            </div>
            {/* Bloque derecho: Envíanos tu mensaje */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Services S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
