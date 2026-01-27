"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SubcategoryItem {
  nombre: string;
  subcategory: string;
  count: number;
  items?: Array<{ name: string; fullName: string; count: number }>;
}

interface GroupAccordionProps {
  grupos: Array<{
    nombre: string;
    count: number;
    deportes: SubcategoryItem[];
  }>;
  selectedGrupo: string | null;
  selectedSubcategories: string[];
  onGrupoToggle: (grupo: string) => void;
  onSubcategoryToggle: (subcategory: string) => void;
  onClearAll?: () => void;
  /** Cuando estamos en vista de un solo grupo (?grupo= en URL), mostrar "Ver todos los grupos" */
  singleGroupMode?: boolean;
  categorySlug?: string;
}

export default function GroupAccordion({
  grupos,
  selectedGrupo,
  selectedSubcategories,
  onGrupoToggle,
  onSubcategoryToggle,
  onClearAll,
  singleGroupMode = false,
  categorySlug,
}: GroupAccordionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // En modo un solo grupo, tenerlo expandido por defecto
  useEffect(() => {
    if (singleGroupMode && grupos.length === 1) {
      setExpandedGroups(new Set([grupos[0].nombre]));
    }
  }, [singleGroupMode, grupos]);

  const toggleGroup = (grupoName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(grupoName)) {
        newSet.delete(grupoName);
      } else {
        newSet.add(grupoName);
      }
      return newSet;
    });
  };

  const handleSubcategoryClick = (subcategory: string) => {
    onSubcategoryToggle(subcategory);
  };

  if (grupos.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Grupos</h3>
      <div className="space-y-1">
        {/* "Ver todos los grupos" cuando estamos en un solo grupo; "Todos" cuando vemos todos */}
        {singleGroupMode && categorySlug ? (
          <Link
            href={`/categoria/${categorySlug}`}
            className="w-full block text-left px-3 py-2 rounded text-sm transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            ← Ver todos los grupos
          </Link>
        ) : (
          <button
            onClick={() => {
              if (onClearAll) {
                onClearAll();
              } else {
                selectedSubcategories.forEach((sub) => {
                  onSubcategoryToggle(sub);
                });
                if (selectedGrupo) {
                  onGrupoToggle(selectedGrupo);
                }
              }
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
              selectedGrupo === null && selectedSubcategories.length === 0
                ? 'bg-[#003366] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>Todos</span>
          </button>
        )}

        {/* Grupos con acordeón */}
        {grupos.map((grupo) => {
          const isExpanded = expandedGroups.has(grupo.nombre);
          const hasSelected = grupo.deportes.some((deporte) =>
            selectedSubcategories.includes(deporte.subcategory)
          );

          return (
            <div key={grupo.nombre} className="border-b border-gray-200 last:border-b-0">
              {/* Botón del grupo (expandir/colapsar) */}
              <button
                onClick={() => toggleGroup(grupo.nombre)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
                  hasSelected
                    ? 'bg-blue-50 text-[#003366] font-medium'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span>{grupo.nombre}</span>
                </div>
                <span className="text-xs text-gray-500">({grupo.count})</span>
              </button>

              {/* Deportes del grupo (mostrar si está expandido) */}
              {isExpanded && (
                <div className="pl-6 space-y-1 py-2">
                  {grupo.deportes.map((deporte) => {
                    const isSelected = selectedSubcategories.includes(deporte.subcategory);
                    return (
                      <label
                        key={deporte.subcategory}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#003366] text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSubcategoryClick(deporte.subcategory)}
                          className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366] cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="flex-1">{deporte.nombre}</span>
                        <span className="text-xs opacity-75">({deporte.count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
