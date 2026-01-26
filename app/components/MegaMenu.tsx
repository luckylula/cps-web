"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFirstValidImage } from '@/app/lib/imageUtils';

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
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

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
    }, 300); // Delay para permitir movimiento entre botón y panel
    setHoverTimeout(timeout);
  };

  const handleGroupHover = (grupoNombre: string | null) => {
    setHoveredGroup(grupoNombre);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap bg-transparent border-none outline-none focus:outline-none cursor-pointer text-base md:text-lg lg:text-xl font-medium"
      >
        {categoryName}
      </button>

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
              const isHovered = hoveredGroup === grupo.nombre;
              const hasSubcategories = grupo.deportes.length > 0;
              const groupImage = grupo.image ? getFirstValidImage([grupo.image]) : null;
              
              return (
                <div
                  key={grupo.nombre}
                  className="px-4 py-2"
                >
                  {/* Item del grupo principal */}
                  <div className="flex items-center gap-3 py-2">
                    {/* Imagen circular */}
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative">
                      {groupImage ? (
                        <Image
                          src={groupImage}
                          alt={grupo.nombre}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized={groupImage.includes('jimsports.shop') || groupImage.includes('madeforsport.eu')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-500 font-medium">
                            {grupo.nombre.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Nombre del grupo */}
                    <Link
                      href={`/categoria/${categorySlug}?grupo=${encodeURIComponent(grupo.nombre)}`}
                      className="flex-1 text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors"
                    >
                      {grupo.nombre}
                    </Link>
                    
                    {/* Símbolo + si tiene subcategorías - Hover activo aquí */}
                    {hasSubcategories && (
                      <div
                        className="text-gray-700 hover:text-gray-900 text-xl font-normal w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
                        onMouseEnter={() => handleGroupHover(grupo.nombre)}
                        onMouseLeave={() => handleGroupHover(null)}
                      >
                        +
                      </div>
                    )}
                  </div>

                  {/* Lista de deportes (subcategorías) - Se expande dentro del mismo menú */}
                  {isHovered && hasSubcategories && (
                    <div 
                      className="ml-16 mt-2"
                      onMouseEnter={() => handleGroupHover(grupo.nombre)}
                      onMouseLeave={() => handleGroupHover(null)}
                    >
                      <ul className="space-y-1.5">
                        {grupo.deportes.map((deporte) => (
                          <li key={deporte.subcategory}>
                            <Link
                              href={`/categoria/${categorySlug}?grupo=${encodeURIComponent(grupo.nombre)}&subcategory=${encodeURIComponent(deporte.subcategory)}`}
                              className="flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-normal text-[#666] hover:bg-gray-50 hover:text-[#1a1a1a] transition-all duration-150"
                            >
                              <span className="text-[#999]">•</span>
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
