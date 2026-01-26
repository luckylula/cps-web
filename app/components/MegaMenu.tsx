"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Deporte {
  nombre: string;
  subcategory: string;
  count: number;
}

interface Grupo {
  nombre: string;
  count: number;
  deportes: Deporte[];
}

interface CategoryStructure {
  categoryId: string;
  grupos: Grupo[];
}

interface MegaMenuProps {
  categorySlug: string;
  categoryName: string;
}

export default function MegaMenu({ categorySlug, categoryName }: MegaMenuProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredGrupo, setHoveredGrupo] = useState<string | null>(null);
  const [structure, setStructure] = useState<CategoryStructure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const response = await fetch(`/api/categories/${categorySlug}/structure`);
        if (response.ok) {
          const data = await response.json();
          setStructure(data);
        }
      } catch (error) {
        console.error('Error fetching category structure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [categorySlug]);

  if (loading || !structure || structure.grupos.length === 0) {
    return (
      <Link
        href={`/categoria/${categorySlug}`}
        className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap"
      >
        {categoryName}
      </Link>
    );
  }

  // Si solo hay 1 grupo, mostrar directamente las subcategorías
  if (structure.grupos.length === 1) {
    const grupo = structure.grupos[0];
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/categoria/${categorySlug}`}
          className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap flex items-center gap-1"
        >
          {categoryName}
          <span className="text-xs">▼</span>
        </Link>

        {isHovered && (
          <div className="absolute top-full left-0 mt-0 w-64 bg-white shadow-lg border border-gray-200 rounded-md z-50 py-2">
            {grupo.deportes.map((deporte) => (
              <Link
                key={deporte.subcategory}
                href={`/categoria/${categorySlug}?grupo=${encodeURIComponent(grupo.nombre)}&subcategory=${encodeURIComponent(deporte.subcategory)}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {deporte.nombre} ({deporte.count})
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Estructura completa de 3 niveles
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredGrupo(null);
      }}
    >
      <Link
        href={`/categoria/${categorySlug}`}
        className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap flex items-center gap-1"
      >
        {categoryName}
        <span className="text-xs">▼</span>
      </Link>

      {isHovered && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-0 w-full max-w-6xl bg-white shadow-lg border border-gray-200 rounded-md z-50">
          <div className="grid grid-cols-4 gap-0">
            {/* Columna de grupos (nivel 2) */}
            <div className="border-r border-gray-200">
              {structure.grupos.map((grupo) => (
                <div
                  key={grupo.nombre}
                  className="relative"
                  onMouseEnter={() => setHoveredGrupo(grupo.nombre)}
                >
                  <div
                    className={`px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                      hoveredGrupo === grupo.nombre
                        ? 'bg-gray-50 text-[#003366]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{grupo.nombre}</span>
                    <span className="text-xs text-gray-500">({grupo.count})</span>
                    {grupo.deportes.length > 0 && (
                      <span className="text-xs ml-2">►</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Columna de deportes (nivel 3) */}
            {hoveredGrupo && (
              <div className="col-span-3 p-4">
                {structure.grupos
                  .find((g) => g.nombre === hoveredGrupo)
                  ?.deportes.map((deporte) => (
                    <Link
                      key={deporte.subcategory}
                      href={`/categoria/${categorySlug}?grupo=${encodeURIComponent(hoveredGrupo)}&subcategory=${encodeURIComponent(deporte.subcategory)}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors mb-1"
                    >
                      {deporte.nombre} <span className="text-gray-500">({deporte.count})</span>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
