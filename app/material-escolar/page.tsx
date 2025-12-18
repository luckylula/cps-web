import Image from "next/image";
import Link from "next/link";

const categories = {
  psicomotricidad: {
    title: "Psicomotricidad",
    items: [
      "Ladrillo con soporte para pica y aro",
      "Cono con soporte",
      "Trampolín",
      "Cuerda rítmica",
      "Cuerda Salto",
      "Cuerda salto colectivo 5mts",
      "Cuerda salto colectivo 10mts",
      "Cinta métrica",
      "Cono flexible",
      "Conos economic",
      "Equipo de audio portátil",
      "Set islas de equilibrio",
      "Islas equilibrio",
      "Circuito de equilibrio",
      "Túnel basic",
      "Túnel Psicomotricidad",
      "Pack pelotas llenado",
      "Pelotas llenado 75 mm",
      "Pelotas llenado 85 mm",
      "Parque Nylon",
      "Semi-cilindro",
      "Arco",
      "Semicilindro",
      "Triangulo",
      "Rampa grande",
      "Rampa pequeña",
      "Círculo",
      "Cilindro",
      "Figura M",
      "Cuadrado 60cm",
      "Cuadrado 25cm",
      "Escalera MD",
      "Escalera grande",
      "Mini cilindro",
      "Figura Asiento"
    ]
  },
  figurasEspuma: {
    title: "Figuras espuma",
    items: [
      "Balón Voleibol SILVA",
      "Minirugbi Caucho (Celular) T3",
      "Nylon del 3-7",
      "BALÓN VOLEIBOL SOFTEE SOFT",
      "BALÓN VOLEIBOL SOFTEE INICIACIÓN PVC",
      "Polivalente lisa pequeña",
      "kanguro 55",
      "kanguro 45",
      "Tapón P. Gigante",
      "Extrator tapón",
      "Pelota gigante",
      "Pelota gigante flexible",
      "Pelota canguro",
      "Pelota Caucho",
      "Pelota multiuso PVC",
      "Polivalente lisa grande",
      "Polivalente lisa amarilla",
      "Polivalente lisa media",
      "Polivalente animal",
      "Pelota Delux"
    ]
  },
  balonesEscolares: {
    title: "Balones de uso escolar",
    items: [
      "Cuerda salto colectivo 5mts",
      "Juego de Bolos",
      "Conos abecedario",
      "Indiaka Max",
      "Indiaka deluxe",
      "Indiaka",
      "Comba",
      "Escalera de agilidad",
      "Sogatira 10 mts",
      "Cuerda salto colectivo 10mts",
      "Cuerda Salto",
      "Torpedo",
      "Misíl",
      "Lanzamiento",
      "Canasta Juegos",
      "Set pala de Licra",
      "Zancos Bajos Deluxe",
      "Zancos antideslizantes de 12cm",
      "Trampolín plus",
      "Trampolín Reforzado"
    ]
  },
  juegosAlternativos: {
    title: "Juegos alternativos",
    items: [
      "Marcador campos",
      "Set arena Junior",
      "Cubo especial",
      "Cubo pequeño",
      "Set arena bebe",
      "Harineras bebe",
      "Rastrillo bebe",
      "Palas bebe",
      "Cedazo especial",
      "Rastrillos",
      "Palas especiales",
      "Llanas",
      "Paletas",
      "Pala Harinera",
      "Cubos especiales",
      "Cubos pequeños",
      "Minimobil JOBS",
      "Mini contenedor",
      "Minimobil Bote",
      "Mini Display"
    ]
  },
  educacionInfantil: {
    title: "Juegos en Educación infantil",
    items: [
      "Plato chino",
      "Palos del Diablo",
      "Malabares",
      "Juego de 3 aros",
      "Diábolo Escolar",
      "Diábolo Deluxe"
    ]
  },
  malabares: {
    title: "Malabares",
    items: [
      "Testigo relevo FOAM",
      "Anti-stress",
      "Sable FOAM",
      "Sables esgrima",
      "Javalina FOAM",
      "Cuerda salto",
      "Juego de bolos",
      "Indiaka Max",
      "Indiaka deluxe",
      "FOAM Balonmano",
      "Foam Volley",
      "FOAM basket",
      "Futbol FOAM",
      "Pelota Béisbol FOAM",
      "Kit béisbol FOAM",
      "Bate Béisbol FOAM regulable",
      "Bate Béisbol FOAM",
      "Rugby FOAM",
      "Pelota FOAM delux90",
      "Mini Pelota Tenis FOAM"
    ]
  },
  materialFoam: {
    title: "Material foam",
    items: [
      "Soporte pack",
      "Soporte",
      "Colchoneta aerobic",
      "Adhesivo antideslizante",
      "Set Velcro",
      "Carro",
      "Funda quitamiedos",
      "Colchoneta plegable",
      "Quitamiedos"
    ]
  },
  colchonetas: {
    title: "Colchonetas",
    items: [
      "Colchoneta caída max.",
      "Colchoneta caída grande",
      "Colchoneta caída media",
      "Colchoneta caída escolar",
      "Colchoneta infantil",
      "Colchoneta escolar",
      "Económica"
    ]
  },
  educacionMusical: {
    title: "Educación musical",
    items: [
      "Set percussión mediano",
      "Equipo de audio portátil",
      "Set iniciación a la música",
      "Tambor de Mano",
      "Set percussión grande",
      "Set 3 tambores",
      "Carrillón",
      "Carrillón Curvo",
      "Carrillón con notas separadas",
      "Pandereta media",
      "Pandereta mini",
      "Platos 20cm.",
      "Agogo bell",
      "Crótalos",
      "Claves de madera",
      "Triangulo",
      "Tambor olas",
      "Palo lluvia",
      "Raspa",
      "Caja china"
    ]
  }
};

export default function MaterialEscolarPage() {
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
                <Link href="/#deporte-individual" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
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
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Psicomotricidad */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.psicomotricidad.title}
              </h2>
              <ul className="space-y-3">
                {categories.psicomotricidad.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Figuras espuma */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.figurasEspuma.title}
              </h2>
              <ul className="space-y-3">
                {categories.figurasEspuma.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Balones de uso escolar */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.balonesEscolares.title}
              </h2>
              <ul className="space-y-3">
                {categories.balonesEscolares.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Juegos alternativos */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.juegosAlternativos.title}
              </h2>
              <ul className="space-y-3">
                {categories.juegosAlternativos.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Educación infantil */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.educacionInfantil.title}
              </h2>
              <ul className="space-y-3">
                {categories.educacionInfantil.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Malabares */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.malabares.title}
              </h2>
              <ul className="space-y-3">
                {categories.malabares.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Material foam */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.materialFoam.title}
              </h2>
              <ul className="space-y-3">
                {categories.materialFoam.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Colchonetas */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.colchonetas.title}
              </h2>
              <ul className="space-y-3">
                {categories.colchonetas.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Educación musical */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {categories.educacionMusical.title}
              </h2>
              <ul className="space-y-3">
                {categories.educacionMusical.items.map((item, index) => (
                  <li key={index} className="text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

