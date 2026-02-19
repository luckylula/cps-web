"use client";

export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import ImageCarousel from "./components/ImageCarousel";
import Navigation from "@/app/components/Navigation";
import ContactForm from "./components/ContactForm";
import { navigationStructure } from "@/app/lib/navigationStructure";

export default function Home() {
  const catEscolar = navigationStructure.find((c) => c.slug === "material-escolar");
  const catDeportes = navigationStructure.find((c) => c.slug === "deportes");
  const catInstalaciones = navigationStructure.find((c) => c.slug === "instalaciones");
  const catTextil = navigationStructure.find((c) => c.slug === "textil");

  const individualGrupos = catDeportes?.subcategorias.find((s) => s.slug === "individual")?.grupos ?? [];
  const colectivosGrupos = catDeportes?.subcategorias.find((s) => s.slug === "colectivos")?.grupos ?? [];
  const instalacionesSubcategorias = catInstalaciones?.subcategorias ?? [];

  const categories = {
    escolar: {
      title: "Material Escolar",
      description: "Equipamiento seguro y resistente para centros educativos.",
      items: catEscolar?.subcategorias ?? [],
      basePath: "/material-escolar",
    },
    individual: {
      title: "Deporte Individual",
      description: "Material técnico para el rendimiento personal.",
      items: individualGrupos,
      basePath: "/deportes/individual",
    },
    colectivo: {
      title: "Deportes Colectivos",
      description: "Soluciones completas para el juego en equipo.",
      items: colectivosGrupos,
      basePath: "/deportes/colectivos",
    },
    complementario: {
      title: "Material Complementario",
      description: "Todo lo que completa tu espacio deportivo.",
      items: instalacionesSubcategorias,
      basePath: "/instalaciones",
    },
    textil: {
      title: "Equipación Textil",
      description: "Ropa deportiva cómoda, funcional y duradera.",
      items: catTextil?.subcategorias ?? [],
      basePath: "/textil",
    },
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
      <section className="pt-10 pb-12 px-4 md:px-6 relative overflow-hidden bg-white">
        <div className="max-w-[83%] mx-auto">
          {/* Foto izquierda | Título + párrafo (en el centro) | Foto derecha */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
            {/* Imagen izquierda */}
            <div className="relative h-96 md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100 order-2 md:order-1">
              <Image
                src="/categorias/material1.png"
                alt="Material deportivo"
                fill
                className="object-cover"
              />
            </div>
            {/* Título y párrafo entre las dos fotos */}
            <div className="md:col-span-2 flex flex-col items-center justify-center order-1 md:order-2 py-6 md:py-0 px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6 tracking-tight text-center">
                Material Deportivo
                <br />
                <span className="font-normal">de Alta Calidad</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl leading-relaxed text-center">
                Distribuimos material deportivo para colegios, clubes deportivos, ayuntamientos, 
                instalaciones deportivas, piscinas y gimnasios en toda España.
              </p>
            </div>
            {/* Imagen derecha */}
            <div className="relative h-96 md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100 order-3">
              <Image
                src="/categorias/material2.jpg"
                alt="Material deportivo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Material Escolar Section - Estilo Minimalista */}
      <section id="material-escolar" className="py-12 md:py-14 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Link href="/material-escolar" className="block group">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight group-hover:text-gray-700 transition-colors">
                {categories.escolar.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                {categories.escolar.description}
              </p>
            </div>
            <div className="mb-8 overflow-hidden rounded-lg">
              <div className="relative h-[500px] bg-gray-100 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                <Image
                  src="/categorias/materialescolar1.png"
                  alt="Material escolar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Link>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.escolar.items.map((item) => (
              <Link
                key={item.slug}
                href={`${categories.escolar.basePath}/${item.slug}`}
                className="text-center hover:text-gray-600 transition-colors"
              >
                <h3 className="text-base font-medium text-gray-900">{item.nombre}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deporte Individual Section - Estilo Minimalista */}
      <section id="deporte-individual" className="py-12 md:py-14 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Link href="/deportes/individual" className="block group">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight group-hover:text-gray-700 transition-colors">
                {categories.individual.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                {categories.individual.description}
              </p>
            </div>
            <div className="mb-8 overflow-hidden rounded-lg">
              <div className="relative h-[500px] bg-gray-100 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                <video
                  src="/categorias/yoga.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
          </Link>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.individual.items.map((item) => (
              <Link
                key={item.slug}
                href={`${categories.individual.basePath}/${item.slug}`}
                className="text-center hover:text-gray-600 transition-colors"
              >
                <h3 className="text-base font-medium text-gray-900">{item.nombre}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deportes Colectivos Section - Estilo Minimalista */}
      <section id="deportes-colectivos" className="py-12 md:py-14 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Link href="/deportes/colectivos" className="block group">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight group-hover:text-gray-700 transition-colors">
                {categories.colectivo.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                {categories.colectivo.description}
              </p>
            </div>
            <div className="mb-8 overflow-hidden rounded-lg">
              <div className="relative h-[500px] bg-gray-100 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                <Image
                  src="/categorias/deportescolectivos.png"
                  alt="Deportes Colectivos"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Link>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.colectivo.items.map((item) => (
              <Link
                key={item.slug}
                href={`${categories.colectivo.basePath}/${item.slug}`}
                className="text-center hover:text-gray-600 transition-colors"
              >
                <h3 className="text-base font-medium text-gray-900">{item.nombre}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Material Complementario Section - Estilo Minimalista */}
      <section id="material-complementario" className="py-12 md:py-14 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Link href="/instalaciones" className="block group">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight group-hover:text-gray-700 transition-colors">
                {categories.complementario.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                {categories.complementario.description}
              </p>
            </div>
            <div className="mb-8 overflow-hidden rounded-lg">
              <div className="relative h-[500px] bg-gray-100 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                <Image
                  src="/categorias/materialcomplementario.png"
                  alt="Material Complementario"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Link>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.complementario.items.map((item) => (
              <Link
                key={item.slug}
                href={`${categories.complementario.basePath}/${item.slug}`}
                className="text-center hover:text-gray-600 transition-colors"
              >
                <h3 className="text-base font-medium text-gray-900">{item.nombre}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Equipación Textil Section - Estilo Minimalista */}
      <section id="equipacion-textil" className="py-12 md:py-14 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Link href="/textil" className="block group">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight group-hover:text-gray-700 transition-colors">
                {categories.textil.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                {categories.textil.description}
              </p>
            </div>
            <div className="overflow-hidden rounded-lg">
              <div className="relative h-[500px] bg-gray-100 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                <video
                  src="/categorias/equipaciontextil.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
          </Link>
          {categories.textil.items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {categories.textil.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`${categories.textil.basePath}/${item.slug}`}
                  className="text-center hover:text-gray-600 transition-colors"
                >
                  <h3 className="text-base font-medium text-gray-900">{item.nombre}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section - ¿Quiénes somos? */}
      <section className="py-12 md:py-14 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            ¿Quiénes somos?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            <div className="text-gray-600 font-light leading-relaxed space-y-4 flex flex-col justify-center min-h-0">
              <p className="text-lg">
                En Control Play somos apasionados del deporte y vivimos cada proyecto con la misma energía que se siente en la pista o en el campo.
              </p>
              <p className="text-lg">
                Nuestra experiencia y trato cercano nos permiten acompañar a cada cliente con un asesoramiento personalizado y honesto.
              </p>
              <p className="text-lg">
                Trabajamos con colegios, clubes, ayuntamientos, instalaciones deportivas, piscinas y gimnasios en toda España.
              </p>
              <p className="text-lg">
                Somos especialistas en la distribución de material deportivo para colectivos y profesionales. Contamos con una amplia red de proveedores de confianza para ofrecer soluciones completas y adaptadas a cada disciplina.
              </p>
              <p className="text-lg font-medium text-gray-900">
                Todo lo que tu proyecto necesita, con la garantía de un equipo que vive el deporte.
              </p>
            </div>
            <div className="relative min-h-[280px] md:min-h-0 md:h-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src="/somosequipo.png"
                alt="Equipo Control Play Sports"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Tres bloques: imagen | datos contacto | formulario */}
      <section id="contacto" className="py-8 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {/* Bloque 1: Imagen - misma altura que el bloque del formulario */}
            <div className="relative w-full min-h-[280px] md:min-h-0 md:h-full rounded-lg overflow-hidden bg-gray-800">
              <Image
                src="/categorias/contact.png"
                alt="Contacto CPS Material Deportivo"
                fill
                className="object-cover object-[35%_center]"
              />
            </div>
            {/* Bloque 2: Datos de contacto */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light mb-2 tracking-tight">
                Contacto
              </h2>
              <p className="text-sm text-gray-400 font-light mb-4">
                ¿Tienes preguntas? Estamos aquí para ayudarte.
              </p>
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
            {/* Bloque 3: Formulario */}
            <div className="w-full">
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
