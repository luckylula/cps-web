"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Grupo {
  nombre: string;
  slug: string;
}

interface Subcategoria {
  nombre: string;
  slug: string;
  grupos: Grupo[];
}

interface Categoria {
  nombre: string;
  slug: string;
  subcategorias: Subcategoria[];
}

// Estructura de navegación multinivel según especificaciones
const navigationStructure: Categoria[] = [
  {
    nombre: "Deportes",
    slug: "deportes",
    subcategorias: [
      {
        nombre: "Colectivos",
        slug: "colectivos",
        grupos: [
          { nombre: "Fútbol", slug: "futbol" },
          { nombre: "Baloncesto", slug: "baloncesto" },
          { nombre: "Voleibol", slug: "voleibol" },
          { nombre: "Balonmano", slug: "balonmano" },
          { nombre: "Rugby", slug: "rugby" },
          { nombre: "Hockey", slug: "hockey" },
          { nombre: "Béisbol", slug: "beisbol" },
          { nombre: "Árbitro", slug: "arbitro" },
          { nombre: "Varios", slug: "varios" },
        ],
      },
      {
        nombre: "Individual",
        slug: "individual",
        grupos: [
          { nombre: "Fitness", slug: "fitness" },
          { nombre: "Natación", slug: "natacion" },
          { nombre: "Atletismo", slug: "atletismo" },
          { nombre: "Gimnasia", slug: "gimnasia" },
          { nombre: "Deportes de contacto", slug: "deportes-de-contacto" },
          { nombre: "Outdoor", slug: "outdoor" },
          { nombre: "Running", slug: "running" },
          { nombre: "Deportes de playa", slug: "deportes-de-playa" },
        ],
      },
      {
        nombre: "Raqueta",
        slug: "raqueta",
        grupos: [
          { nombre: "Pádel", slug: "padel" },
          { nombre: "Tenis", slug: "tenis" },
          { nombre: "Bádminton", slug: "badminton" },
          { nombre: "Tenis de mesa", slug: "tenis-de-mesa" },
          { nombre: "Pickleball", slug: "pickleball" },
        ],
      },
    ],
  },
  {
    nombre: "Textil",
    slug: "textil",
    subcategorias: [
      {
        nombre: "Ropa Casual",
        slug: "ropa-casual",
        grupos: [],
      },
      {
        nombre: "Ropa Deportiva",
        slug: "ropa-deportiva",
        grupos: [
          { nombre: "Equipaciones", slug: "equipaciones" },
          { nombre: "Por deporte - Pádel", slug: "por-deporte-padel" },
        ],
      },
      {
        nombre: "Calzado",
        slug: "calzado",
        grupos: [
          { nombre: "Casual", slug: "casual" },
        ],
      },
    ],
  },
  {
    nombre: "Instalaciones",
    slug: "instalaciones",
    subcategorias: [
      {
        nombre: "Estructuras deportivas",
        slug: "estructuras-deportivas",
        grupos: [
          { nombre: "Baloncesto", slug: "baloncesto" },
          { nombre: "Fútbol", slug: "futbol" },
          { nombre: "Fútbol Sala", slug: "futbol-sala" },
          { nombre: "Voleibol", slug: "voleibol" },
          { nombre: "Tenis", slug: "tenis" },
          { nombre: "Pádel", slug: "padel" },
          { nombre: "Varios", slug: "varios" },
        ],
      },
      {
        nombre: "Redes y Protecciones",
        slug: "redes-y-protecciones",
        grupos: [],
      },
      {
        nombre: "Gimnasio",
        slug: "gimnasio",
        grupos: [],
      },
      {
        nombre: "Vestuarios",
        slug: "vestuarios",
        grupos: [],
      },
      {
        nombre: "Piscina",
        slug: "piscina",
        grupos: [],
      },
      {
        nombre: "Mobiliario",
        slug: "mobiliario",
        grupos: [],
      },
    ],
  },
  {
    nombre: "Material Escolar",
    slug: "material-escolar",
    subcategorias: [
      {
        nombre: "Psicomotricidad",
        slug: "psicomotricidad",
        grupos: [],
      },
      {
        nombre: "Iniciación Deportiva",
        slug: "iniciacion-deportiva",
        grupos: [],
      },
      {
        nombre: "Juegos",
        slug: "juegos",
        grupos: [
          { nombre: "Juegos exterior", slug: "juegos-exterior" },
          { nombre: "Juegos acuáticos", slug: "juegos-acuaticos" },
          { nombre: "Juegos mesa", slug: "juegos-mesa" },
        ],
      },
    ],
  },
];

interface MultiLevelNavProps {
  categoria: Categoria;
}

export default function MultiLevelNav({ categoria }: MultiLevelNavProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleCategoryMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(true);
  };

  const handleCategoryMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsHovered(false);
      setHoveredSubcategory(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleSubcategoryMouseEnter = (subcategorySlug: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredSubcategory(subcategorySlug);
  };

  const buildUrl = (subcategorySlug: string, grupoSlug?: string) => {
    if (grupoSlug) {
      return `/${categoria.slug}/${subcategorySlug}/${grupoSlug}`;
    }
    return `/${categoria.slug}/${subcategorySlug}`;
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleCategoryMouseEnter}
      onMouseLeave={handleCategoryMouseLeave}
    >
      <Link
        href={`/${categoria.slug}`}
        className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap bg-transparent border-none outline-none focus:outline-none cursor-pointer text-base md:text-lg lg:text-xl font-medium"
      >
        {categoria.nombre}
      </Link>

      {/* Panel del mega-menú */}
      {isHovered && (
        <div
          className="fixed bg-white shadow-xl border border-gray-200 rounded-lg z-[9999] overflow-hidden mega-menu-panel"
          onMouseEnter={handleCategoryMouseEnter}
          onMouseLeave={handleCategoryMouseLeave}
          style={{
            top: '81px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(calc(100vw - 2rem), 1200px)',
            maxWidth: '1200px',
          }}
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Columna de subcategorías */}
              <div className="border-r border-gray-200 pr-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  {categoria.nombre}
                </h3>
                <ul className="space-y-1">
                  {categoria.subcategorias.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={buildUrl(sub.slug)}
                        onMouseEnter={() => handleSubcategoryMouseEnter(sub.slug)}
                        className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                          sub.slug === hoveredSubcategory
                            ? 'bg-[#003366] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {sub.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Columna de grupos de la subcategoría seleccionada o primera por defecto */}
              {(() => {
                const activeSubcategory = categoria.subcategorias.find(
                  (sub) => sub.slug === hoveredSubcategory
                ) || categoria.subcategorias[0];

                if (activeSubcategory.grupos.length > 0) {
                  return (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                        {activeSubcategory.nombre}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {activeSubcategory.grupos.map((grupo) => (
                          <Link
                            key={grupo.slug}
                            href={buildUrl(activeSubcategory.slug, grupo.slug)}
                            className="block px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-50 hover:text-[#003366] transition-colors border border-transparent hover:border-gray-200"
                          >
                            {grupo.nombre}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="md:col-span-2">
                    <Link
                      href={buildUrl(activeSubcategory.slug)}
                      className="block px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors"
                    >
                      Ver todos los productos de {activeSubcategory.nombre}
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exportar la estructura para uso en otros componentes
export { navigationStructure };
export type { Categoria, Subcategoria, Grupo };
