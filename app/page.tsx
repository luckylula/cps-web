import Image from "next/image";
import ImageCarousel from "./components/ImageCarousel";

export default function Home() {
  const categories = {
    escolar: {
      title: "Material Escolar",
      subtitle: "Para aprender",
      description: "Artículos que te permiten enseñar y crear un entorno de aprendizaje deportivo.",
      items: [
        "Psicomotricidad",
        "Figuras espuma",
        "Balones de uso escolar",
        "Juegos alternativos",
        "Malabares",
        "Juegos en Educación infantil",
        "Material foam",
        "Colchonetas",
        "Educación musical"
      ]
    },
    individual: {
      title: "Deporte Individual",
      subtitle: "Logra tus propios méritos",
      description: "Accede a una variedad de material para tu deporte y supérate a ti mismo.",
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
      description: "Cada deporte cuenta con su equipación. Encuentra material para entrenar y practicar deportes en equipo.",
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
      title: "Material Deportivo Complementario",
      subtitle: "Entrénate",
      description: "Imprescindibles para tus instalaciones deportivas y ejercitar tu cuerpo.",
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
      description: "Equipación completa para todas tus necesidades deportivas.",
      items: []
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Banner Azul Fijo */}
      <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
            <div className="text-white text-lg md:text-xl font-semibold tracking-tight">
              CPS Material Deportivo
            </div>
            <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
              <li>
                <a href="#" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Home
                </a>
              </li>
              <li>
                <a href="/material-escolar" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Material Escolar
                </a>
              </li>
              <li>
                <a href="#deporte-individual" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Deporte Individual
                </a>
              </li>
              <li>
                <a href="#deportes-colectivos" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Deportes Colectivos
                </a>
              </li>
              <li>
                <a href="#material-complementario" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 hidden md:inline">
                  Material Complementario
                </a>
              </li>
              <li>
                <a href="#equipacion-textil" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1 hidden md:inline">
                  Equipación Textil
                </a>
              </li>
              <li>
                <a href="#cesta" className="text-white hover:text-orange-300 transition-colors font-medium bg-orange-500 px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-orange-600 whitespace-nowrap">
                  Mi Cesta
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <ImageCarousel />

      {/* Sección de Tarjetas de Categorías */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta Material Escolar */}
            <a
              href="/material-escolar"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <Image
                  src="/material_escolar_cps.png"
                  alt="Material escolar"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="bg-[#003366] px-4 py-3">
                <h3 className="text-white font-semibold text-lg">Material escolar</h3>
              </div>
              <div className="p-5">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-medium">Para aprender</span>
                  <br />
                  Artículos que te permiten enseñar y crear un entorno de aprendizaje. Entre ellos, deportivo.
                </p>
              </div>
            </a>

            {/* Tarjeta Material Deportivo Individual */}
            <a
              href="#deporte-individual"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Jugador de pádel"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="bg-[#003366] px-4 py-3">
                <h3 className="text-white font-semibold text-lg">Material deportivo individual</h3>
              </div>
              <div className="p-5">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-medium">Logra tus propios méritos</span>
                  <br />
                  Accede a una variedad de material para tu deporte y supérate a ti mismo.
                </p>
              </div>
            </a>

            {/* Tarjeta Material Deportivo Colectivo */}
            <a
              href="#deportes-colectivos"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80"
                  alt="Material deportivo colectivo"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="bg-[#003366] px-4 py-3">
                <h3 className="text-white font-semibold text-lg">Material deportivo colectivo</h3>
              </div>
              <div className="p-5">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-medium">Rinde en equipo</span>
                  <br />
                  Cada deporte cuenta con su equipación. Encuentra material para entrenar y practicar deportes en equipo.
                </p>
              </div>
            </a>

            {/* Tarjeta Material Deportivo Complementario */}
            <a
              href="#material-complementario"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"
                  alt="Material deportivo complementario"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="bg-[#003366] px-4 py-3">
                <h3 className="text-white font-semibold text-lg">Material deportivo complementario</h3>
              </div>
              <div className="p-5">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-medium">Entrénate</span>
                  <br />
                  Imprescindibles para tus instalaciones deportivas y ejercitar tu cuerpo.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-6 tracking-tight">
              Material Deportivo
              <br />
              <span className="font-normal">de Alta Calidad</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
              Distribuimos material deportivo para colegios, clubes deportivos, ayuntamientos, 
              instalaciones deportivas, piscinas y gimnasios en toda España.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/catalogo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Descargar Catálogo
              </a>
              <a
                href="#contacto"
                className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Material Escolar Section */}
      <section id="material-escolar" className="py-24 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              {categories.escolar.subtitle}
            </p>
            <h2 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">
              {categories.escolar.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.escolar.description}
            </p>
          </div>
          <div className="mb-12 rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[400px] bg-gray-200">
              <Image
                src="/material_escolar_cps.png"
                alt="Material escolar"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.escolar.items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deporte Individual Section */}
      <section id="deporte-individual" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              {categories.individual.subtitle}
            </p>
            <h2 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">
              {categories.individual.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.individual.description}
            </p>
          </div>
          <div className="mb-12 rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[400px] bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80"
                alt="Jugador de pádel"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.individual.items.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deportes Colectivos Section */}
      <section id="deportes-colectivos" className="py-24 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              {categories.colectivo.subtitle}
            </p>
            <h2 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">
              {categories.colectivo.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.colectivo.description}
            </p>
          </div>
          <div className="mb-12 rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80"
                alt="Niños durante una práctica deportiva en equipo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.colectivo.items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material Complementario Section */}
      <section id="material-complementario" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              {categories.complementario.subtitle}
            </p>
            <h2 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">
              {categories.complementario.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.complementario.description}
            </p>
          </div>
          <div className="mb-12 rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
                alt="Gimnasio moderno con equipamiento deportivo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.complementario.items.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-medium text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipación Textil Section */}
      <section id="equipacion-textil" className="py-24 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              {categories.textil.subtitle}
            </p>
            <h2 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">
              {categories.textil.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {categories.textil.description}
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-[400px]">
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

      {/* About Section */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <div className="relative h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80"
                  alt="Equipamiento deportivo profesional"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-5xl font-light text-gray-900 mb-8 tracking-tight">
                ¿Quiénes somos?
              </h2>
              <div className="prose prose-lg text-gray-600 font-light leading-relaxed">
                <p className="text-xl mb-6">
                  Control Play Sports tiene la finalidad de distribuir en toda España material deportivo 
                  para colectivos (Colegios, clubs deportivos, ayuntamientos, instalaciones deportivas, 
                  piscinas, gimnasios...).
                </p>
                <p className="text-xl mb-6">
                  Podemos comercializar cualquier material deportivo relacionado con el deporte, 
                  disponemos de los mejores proveedores.
                </p>
                <p className="text-xl font-medium text-gray-900">
                  Todo lo que necesitas, aquí lo encontrarás!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light mb-4 tracking-tight">
              Contacto
            </h2>
            <p className="text-lg text-gray-400 font-light">
              ¿Tienes preguntas? Estamos aquí para ayudarte.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-medium mb-6">Información de contacto</h3>
              <div className="space-y-4 text-gray-300">
                <p className="font-light">
                  <strong className="text-white">Control Play Sports S.L.</strong>
                </p>
                <p className="font-light">
                  C/ Sant Miquel, 63<br />
                  Sant Vicenç dels Horts 08620<br />
                  Barcelona, Spain
                </p>
                <p className="font-light">
                  <strong className="text-white">Tel:</strong> 639.36.22.53
                </p>
                <p className="font-light">
                  <strong className="text-white">Email:</strong><br />
                  pedidos@cpsmaterialdeportivo.com
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-6">Horarios de oficina</h3>
              <div className="space-y-2 text-gray-300 font-light">
                <p>Lunes - Jueves: 9:00 a 13:00 y 15:00 a 19:00</p>
                <p>Viernes: 9:00 a 13:00 y 15:00 a 18:00</p>
              </div>
            </div>
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

