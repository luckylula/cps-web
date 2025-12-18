import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock data - En producción esto vendría de una base de datos o API
const articulos: Record<string, {
  id: string;
  title: string;
  description: string;
  technicalDescription: string;
  price?: number;
  image: string;
  category: string;
  specifications?: Record<string, string>;
}> = {
  "ladrillo-con-soporte": {
    id: "ladrillo-con-soporte",
    title: "Ladrillo con soporte para pica y aro",
    description: "Ladrillo de psicomotricidad con soporte integrado para pica y aro. Ideal para ejercicios de equilibrio y coordinación.",
    technicalDescription: "Ladrillo de alta calidad fabricado en espuma EVA de alta densidad. Incluye soporte ajustable para pica y aro. Superficie antideslizante para mayor seguridad. Diseñado para uso intensivo en centros educativos.",
    price: 45.90,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
    category: "Psicomotricidad",
    specifications: {
      material: "Espuma EVA de alta densidad",
      dimensiones: "30 x 20 x 15 cm",
      peso: "1.2 kg",
      color: "Azul, Rojo, Amarillo",
      edadRecomendada: "3-12 años"
    }
  },
  "trampolin": {
    id: "trampolin",
    title: "Trampolín",
    description: "Trampolín de psicomotricidad seguro y resistente para uso escolar.",
    technicalDescription: "Trampolín profesional con estructura de acero reforzado y malla de seguridad. Superficie de salto de alta calidad con sistema de muelles de acero. Incluye protección de muelles y patas antideslizantes.",
    price: 189.00,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    category: "Psicomotricidad",
    specifications: {
      material: "Acero y malla de alta resistencia",
      dimensiones: "Ø 100 cm",
      peso: "12 kg",
      capacidadMaxima: "100 kg",
      edadRecomendada: "5+ años"
    }
  },
  "balon-voleibol-silva": {
    id: "balon-voleibol-silva",
    title: "Balón Voleibol SILVA",
    description: "Balón de voleibol profesional SILVA para uso escolar y entrenamiento.",
    technicalDescription: "Balón de voleibol de alta calidad con superficie de cuero sintético. Cámara de butilo para mejor retención de aire. Diseñado según estándares internacionales. Ideal para competición y entrenamiento.",
    price: 32.50,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    category: "Figuras espuma",
    specifications: {
      material: "Cuero sintético",
      dimensiones: "Ø 65-67 cm",
      peso: "260-280 g",
      presion: "0.30-0.325 kg/cm²"
    }
  },
  "colchoneta-escolar": {
    id: "colchoneta-escolar",
    title: "Colchoneta escolar",
    description: "Colchoneta de gimnasia escolar resistente y cómoda para múltiples actividades.",
    technicalDescription: "Colchoneta de alta densidad con revestimiento de vinilo resistente al agua. Fácil limpieza y mantenimiento. Bordes reforzados para mayor durabilidad. Certificada para uso escolar.",
    price: 85.00,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    category: "Colchonetas",
    specifications: {
      material: "Espuma de alta densidad + Vinilo",
      dimensiones: "200 x 100 x 5 cm",
      peso: "8 kg",
      color: "Azul, Rojo, Verde",
      certificacion: "EN 12503"
    }
  },
  "set-percusion-mediano": {
    id: "set-percusion-mediano",
    title: "Set percussión mediano",
    description: "Set completo de instrumentos de percusión para educación musical.",
    technicalDescription: "Set completo de instrumentos de percusión diseñado para educación musical en centros escolares. Incluye tambores, panderetas, triángulos, crótalos y más. Fabricado con materiales de calidad para uso intensivo.",
    price: 125.00,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
    category: "Educación musical",
    specifications: {
      material: "Madera y metal",
      piezas: "12 instrumentos",
      edadRecomendada: "4+ años",
      incluye: "Maleta de transporte"
    }
  },
  "pelota-foam-delux90": {
    id: "pelota-foam-delux90",
    title: "Pelota FOAM delux90",
    description: "Pelota de espuma FOAM de alta calidad para juegos seguros.",
    technicalDescription: "Pelota de espuma FOAM de alta densidad. Superficie suave y segura para uso en espacios cerrados. Resistente al desgaste y fácil de limpiar. Ideal para educación física y juegos en interior.",
    price: 18.50,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    category: "Malabares",
    specifications: {
      material: "Espuma FOAM de alta densidad",
      dimensiones: "Ø 90 cm",
      peso: "0.5 kg",
      color: "Multicolor"
    }
  }
};

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  // En producción, esto vendría de una base de datos
  return Object.keys(articulos).map((slug) => ({
    slug: slug,
  }));
}

export default function ArticuloPage({ params }: PageProps) {
  const articulo = articulos[params.slug];

  if (!articulo) {
    notFound();
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
                <Link href="/material-escolar" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
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
                <Link href="/#cesta" className="text-white hover:text-orange-300 transition-colors font-medium bg-orange-500 px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-orange-600 whitespace-nowrap">
                  Mi Cesta
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/material-escolar" className="hover:text-gray-900 transition-colors">Material Escolar</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{articulo.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Image Section */}
            <div className="sticky top-24">
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
                <div className="relative aspect-square">
                  <Image
                    src={articulo.image}
                    alt={articulo.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div>
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-4 py-1.5 bg-[#003366] text-white text-sm font-medium rounded-full">
                  {articulo.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
                {articulo.title}
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-8 font-light leading-relaxed">
                {articulo.description}
              </p>

              {/* Price */}
              {articulo.price && (
                <div className="mb-8">
                  <span className="text-3xl font-semibold text-gray-900">
                    {articulo.price.toFixed(2)} €
                  </span>
                  <span className="text-gray-500 ml-2">IVA incluido</span>
                </div>
              )}

              {/* CTA Button */}
              <div className="mb-12">
                <Link
                  href={`/#contacto?articulo=${articulo.id}`}
                  className="inline-block w-full md:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                >
                  Solicitar Presupuesto
                </Link>
              </div>

              {/* Technical Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Descripción Técnica
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {articulo.technicalDescription}
                </p>
              </div>

              {/* Specifications */}
              {articulo.specifications && (
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Especificaciones
                  </h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(articulo.specifications).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="text-lg text-gray-900 font-medium">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Productos Relacionados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(articulos)
              .filter(item => item.id !== articulo.id && item.category === articulo.category)
              .slice(0, 3)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/articulos/${item.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    {item.price && (
                      <p className="text-xl font-semibold text-gray-900">
                        {item.price.toFixed(2)} €
                      </p>
                    )}
                  </div>
                </Link>
              ))}
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

