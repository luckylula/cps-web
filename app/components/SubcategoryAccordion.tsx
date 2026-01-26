"use client";

import { useState } from 'react';

interface SubcategoryItem {
  name: string;
  fullName: string;
  count: number;
}

interface SubcategoryGroup {
  groupName: string;
  items: SubcategoryItem[];
  totalCount: number;
}

interface SubcategoryAccordionProps {
  groups: SubcategoryGroup[];
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategory: string | null) => void;
}

export default function SubcategoryAccordion({
  groups,
  selectedSubcategory,
  onSubcategorySelect,
}: SubcategoryAccordionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const handleSubcategoryClick = (fullName: string) => {
    if (selectedSubcategory === fullName) {
      // Si ya está seleccionada, deseleccionar
      onSubcategorySelect(null);
    } else {
      onSubcategorySelect(fullName);
    }
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Subcategorías</h3>
      <div className="space-y-1">
        {/* Botón "Todas" */}
        <button
          onClick={() => onSubcategorySelect(null)}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
            selectedSubcategory === null
              ? 'bg-[#003366] text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <span>Todas</span>
        </button>

        {/* Grupos con acordeón */}
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.groupName);
          const hasSelected = group.items.some((item) => item.fullName === selectedSubcategory);

          return (
            <div key={group.groupName} className="border-b border-gray-200 last:border-b-0">
              {/* Botón del grupo (expandir/colapsar) */}
              <button
                onClick={() => toggleGroup(group.groupName)}
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
                  <span>{group.groupName}</span>
                </div>
                <span className="text-xs text-gray-500">({group.totalCount})</span>
              </button>

              {/* Subcategorías del grupo (mostrar si está expandido) */}
              {isExpanded && (
                <div className="pl-6 space-y-1 py-2">
                  {group.items.map((item) => {
                    const isSelected = selectedSubcategory === item.fullName;
                    return (
                      <label
                        key={item.fullName}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#003366] text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSubcategoryClick(item.fullName)}
                          className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366] cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="flex-1">{item.name}</span>
                        <span className="text-xs opacity-75">({item.count})</span>
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
