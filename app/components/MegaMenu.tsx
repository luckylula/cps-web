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
  const [structure, setStructure] = useState<CategoryStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Calcular número de columnas según cantidad de grupos
  const getColumnCount = (grupoCount: number) => {
    if (grupoCount <= 2) return 2;
    if (grupoCount <= 4) return 3;
    if (grupoCount <= 6) return 4;
    return 4; // Máximo 4 columnas
  };

  // Separar grupos normales de "Sin clasificar"
  const separateGroups = (grupos: Grupo[]) => {
    const normal = grupos.filter((g) => g.nombre !== 'Sin clasificar');
    const sinClasificar = grupos.find((g) => g.nombre === 'Sin clasificar');
    return { normal, sinClasificar };
  };

  if (loading || !structure || structure.grupos.length === 0) {
    return (
      <Link
        href={`/categoria/${categorySlug}`}
        className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap text-base md:text-lg lg:text-xl font-medium"
      >
        {categoryName}
      </Link>
    );
  }

  const { normal, sinClasificar } = separateGroups(structure.grupos);
  const columnCount = getColumnCount(normal.length + (sinClasificar ? 1 : 0));
  const allGroups = sinClasificar ? [...normal, sinClasificar] : normal;

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 100); // Pequeño delay para permitir movimiento entre botón y panel
    setHoverTimeout(timeout);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap flex items-center gap-1 bg-transparent border-none cursor-pointer text-base md:text-lg lg:text-xl font-medium"
      >
        {categoryName}
        <span className="text-xs">▼</span>
      </button>

      {isHovered && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[calc(100vw-2rem)] max-w-[1200px] bg-white shadow-xl border border-gray-200 rounded-lg z-[100] overflow-hidden mega-menu-panel"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="grid gap-0 p-6"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            }}
          >
            {allGroups.map((grupo) => (
              <div
                key={grupo.nombre}
                className="px-4 py-2 border-r border-gray-100 last:border-r-0"
              >
                {/* Título del grupo */}
                <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b border-gray-100">
                  {grupo.nombre}
                  <span className="ml-2 text-xs font-normal text-[#999]">
                    ({grupo.count})
                  </span>
                </h3>

                {/* Lista de deportes */}
                <ul className="space-y-1.5">
                  {grupo.deportes.length > 0 ? (
                    grupo.deportes.map((deporte) => (
                      <li key={deporte.subcategory}>
                        <Link
                          href={`/categoria/${categorySlug}?grupo=${encodeURIComponent(grupo.nombre)}&subcategory=${encodeURIComponent(deporte.subcategory)}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-normal text-[#666] hover:bg-gray-50 hover:text-[#1a1a1a] transition-all duration-150 group"
                        >
                          <span className="text-[#999] group-hover:text-[#666]">•</span>
                          <span className="flex-1">{deporte.nombre}</span>
                          <span className="text-[11px] text-[#999] group-hover:text-[#666]">
                            ({deporte.count})
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-1.5 text-[13px] text-[#999] italic">
                      Sin subcategorías
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
