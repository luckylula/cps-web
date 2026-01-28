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
  image?: string | null;
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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


  // Calcular número de columnas según cantidad de grupos (siempre 2 columnas para el diseño limpio)
  const getColumnCount = (grupoCount: number) => {
    return 2; // Siempre 2 columnas como en la imagen
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
      setExpandedGroups(new Set()); // Al cerrar el menú, colapsar todos los grupos para empezar limpio
    }, 300); // Delay para permitir movimiento entre botón y panel
    setHoverTimeout(timeout);
  };

  const toggleGroup = (grupoNombre: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(grupoNombre)) {
        next.delete(grupoNombre);
      } else {
        next.add(grupoNombre);
      }
      return next;
    });
  };

  // Cerrar el menú al hacer click en cualquier enlace (grupo o subcategoría) para que se vea la nueva página
  const closeMenu = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
    setExpandedGroups(new Set());
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/categoria/${categorySlug}`}
        className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap bg-transparent border-none outline-none focus:outline-none cursor-pointer text-base md:text-lg lg:text-xl font-medium"
      >
        {categoryName}
      </Link>

      {isHovered && structure && structure.grupos.length > 0 && (
        <div 
          className="fixed bg-white shadow-xl border border-gray-200 rounded-lg z-[9999] overflow-hidden mega-menu-panel"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            top: '81px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(calc(100vw - 2rem), 1200px)',
            maxWidth: '1200px',
          }}
        >
          <div 
            className="grid grid-cols-2 gap-0 p-6"
          >
            {allGroups.map((grupo) => {
              const isExpanded = expandedGroups.has(grupo.nombre);
              const hasSubcategories = grupo.deportes.length > 0;
              
              return (
                <div
                  key={grupo.nombre}
                  className="px-4 py-2"
                >
                  {/* Item del grupo principal */}
                  <div className="flex items-center gap-4 py-3">
                    {/* Nombre del grupo: al hacer click va a la categoría filtrada por ese grupo y cierra el menú */}
                    <Link
                      href={`/categoria/${categorySlug}?grupo=${encodeURIComponent(grupo.nombre)}`}
                      onClick={closeMenu}
                      className="flex-1 text-lg md:text-xl font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors"
                    >
                      {grupo.nombre}
                    </Link>
                    
                    {/* Símbolo + / − solo con click: expande y mantiene abierto; no depende del hover */}
                    {hasSubcategories && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleGroup(grupo.nombre);
                        }}
                        className="text-gray-700 hover:text-gray-900 text-2xl font-normal min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none outline-none rounded hover:bg-gray-100"
                        aria-label={isExpanded ? 'Colapsar subcategorías' : 'Ver más deportes'}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                  </div>

                  {/* Lista de deportes (subcategorías) - Visible al hacer click en +, letras más grandes */}
                  {isExpanded && hasSubcategories && (
                    <div className="ml-20 mt-3">
                      <ul className="space-y-2">
                        {grupo.deportes.map((deporte) => (
                          <li key={deporte.subcategory}>
                            <Link
                              href={`/categoria/${categorySlug}?grupo=${encodeURIComponent(grupo.nombre)}&subcategory=${encodeURIComponent(deporte.subcategory)}`}
                              onClick={closeMenu}
                              className="flex items-center gap-2 px-2 py-2 rounded text-base md:text-lg font-normal text-[#666] hover:bg-gray-50 hover:text-[#1a1a1a] transition-all duration-150"
                            >
                              <span className="text-[#999] text-sm">•</span>
                              <span className="flex-1">{deporte.nombre}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
