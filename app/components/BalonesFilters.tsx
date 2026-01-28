"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BalonesFiltersProps {
  grupos: string[];
  marcas: string[];
  minPrice: number | null;
  maxPrice: number | null;
  totalProducts: number;
}

export default function BalonesFilters({ grupos, marcas, minPrice, maxPrice, totalProducts }: BalonesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: '',
  });
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const grupoParam = searchParams?.get('grupo');
    const marcaParam = searchParams?.get('marca');
    const minPriceParam = searchParams?.get('minPrice');
    const maxPriceParam = searchParams?.get('maxPrice');
    const stockParam = searchParams?.get('stock');

    setSelectedGrupo(grupoParam || null);
    setSelectedMarca(marcaParam || null);
    setPriceRange({
      min: minPriceParam || '',
      max: maxPriceParam || '',
    });
    setInStockOnly(stockParam === 'true');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedGrupo) {
      params.set('grupo', selectedGrupo);
    }

    if (selectedMarca) {
      params.set('marca', selectedMarca);
    }

    if (priceRange.min) {
      params.set('minPrice', priceRange.min);
    }

    if (priceRange.max) {
      params.set('maxPrice', priceRange.max);
    }

    if (inStockOnly) {
      params.set('stock', 'true');
    }

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
  };

  const clearFilters = () => {
    setSelectedGrupo(null);
    setSelectedMarca(null);
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
    router.push(window.location.pathname);
  };

  const hasActiveFilters = selectedGrupo || selectedMarca || priceRange.min || priceRange.max || inStockOnly;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#003366] hover:text-[#004488] transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Contador de productos */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalProducts}</span> balones encontrados
        </p>
      </div>

      {/* Filtro por deporte */}
      {grupos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Deporte</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {grupos.map((grupo) => (
              <label key={grupo} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="grupo"
                  value={grupo}
                  checked={selectedGrupo === grupo}
                  onChange={(e) => setSelectedGrupo(e.target.value)}
                  className="w-4 h-4 text-[#003366] border-gray-300 focus:ring-[#003366] focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                  {grupo}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por marca */}
      {marcas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Marca</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {marcas.map((marca) => (
              <label key={marca} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="marca"
                  value={marca}
                  checked={selectedMarca === marca}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                  className="w-4 h-4 text-[#003366] border-gray-300 focus:ring-[#003366] focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                  {marca}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por precio */}
      {(minPrice !== null || maxPrice !== null) && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Precio</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="minPrice" className="block text-xs text-gray-600 mb-1">
                Precio mínimo (€)
              </label>
              <input
                type="number"
                id="minPrice"
                min="0"
                step="0.01"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                placeholder={minPrice?.toString() || '0'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-xs text-gray-600 mb-1">
                Precio máximo (€)
              </label>
              <input
                type="number"
                id="maxPrice"
                min="0"
                step="0.01"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                placeholder={maxPrice?.toString() || '∞'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtro por disponibilidad */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Disponibilidad</h3>
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366] focus:ring-2"
          />
          <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
            Solo balones en stock
          </span>
        </label>
      </div>

      {/* Botón aplicar filtros */}
      <button
        onClick={applyFilters}
        className="w-full bg-[#003366] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#004488] transition-colors"
      >
        Aplicar filtros
      </button>
    </div>
  );
}
