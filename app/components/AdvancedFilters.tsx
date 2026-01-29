"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TipoProducto {
  tipo_producto: string;
  _count: {
    tipo_producto: number;
  };
}

interface AdvancedFiltersProps {
  marcas: string[];
  minPrice: number | null;
  maxPrice: number | null;
  totalProducts: number;
  availableTipos?: TipoProducto[];
  categoryId?: string;
}

type SortOption = 'name-asc' | 'price-asc' | 'price-desc' | 'newest';

const sortOptions = [
  { value: 'name-asc', label: 'Nombre A-Z' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Más recientes' },
] as const;

export default function AdvancedFilters({ marcas, minPrice, maxPrice, totalProducts, availableTipos = [], categoryId }: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Calcular valores por defecto para el precio
  const defaultMinPrice = minPrice ?? 0;
  const defaultMaxPrice = maxPrice ?? 1000;
  
  // Estado de filtros
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [currentPriceRange, setCurrentPriceRange] = useState({
    min: defaultMinPrice,
    max: defaultMaxPrice,
  });
  const [availability, setAvailability] = useState<'all' | 'in-stock'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Cargar estado desde URL params
  useEffect(() => {
    const marcaParams = searchParams?.getAll('marca') || [];
    const tipoParams = searchParams?.getAll('tipo') || [];
    const minPriceParam = searchParams?.get('precio_min');
    const maxPriceParam = searchParams?.get('precio_max');
    const stockParam = searchParams?.get('disponibilidad');
    const sortParam = searchParams?.get('ordenar') as SortOption;

    setSelectedMarcas(marcaParams);
    setSelectedTipos(tipoParams);
    
    if (minPriceParam) {
      const min = parseFloat(minPriceParam);
      if (!isNaN(min)) {
        setCurrentPriceRange(prev => ({ ...prev, min }));
      }
    } else {
      setCurrentPriceRange(prev => ({ ...prev, min: defaultMinPrice }));
    }

    if (maxPriceParam) {
      const max = parseFloat(maxPriceParam);
      if (!isNaN(max)) {
        setCurrentPriceRange(prev => ({ ...prev, max }));
      }
    } else {
      setCurrentPriceRange(prev => ({ ...prev, max: defaultMaxPrice }));
    }

    setAvailability(stockParam === 'en-stock' ? 'in-stock' : 'all');
    setSortBy(sortParam || 'name-asc');
  }, [searchParams, minPrice, maxPrice]);

  const handleMarcaToggle = (marca: string) => {
    setSelectedMarcas(prev =>
      prev.includes(marca)
        ? prev.filter(m => m !== marca)
        : [...prev, marca]
    );
  };

  const handleTipoToggle = (tipo: string) => {
    setSelectedTipos(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const min = type === 'min' ? Math.max(defaultMinPrice, Math.min(defaultMaxPrice, value)) : currentPriceRange.min;
    const max = type === 'max' ? Math.max(defaultMinPrice, Math.min(defaultMaxPrice, value)) : currentPriceRange.max;
    
    // Asegurar que min <= max
    if (type === 'min' && value > currentPriceRange.max) {
      setCurrentPriceRange({ min: currentPriceRange.max, max: currentPriceRange.max });
    } else if (type === 'max' && value < currentPriceRange.min) {
      setCurrentPriceRange({ min: currentPriceRange.min, max: currentPriceRange.min });
    } else {
      setCurrentPriceRange({ min, max });
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    selectedMarcas.forEach(marca => {
      params.append('marca', marca);
    });

    selectedTipos.forEach(tipo => {
      params.append('tipo', tipo);
    });

    if (currentPriceRange.min > defaultMinPrice) {
      params.set('precio_min', Math.round(currentPriceRange.min).toString());
    }

    if (currentPriceRange.max < defaultMaxPrice) {
      params.set('precio_max', Math.round(currentPriceRange.max).toString());
    }

    if (availability === 'in-stock') {
      params.set('disponibilidad', 'en-stock');
    }

    if (sortBy !== 'name-asc') {
      params.set('ordenar', sortBy);
    }

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
    setIsMobileOpen(false);
  };

  const clearFilters = () => {
    setSelectedMarcas([]);
    setSelectedTipos([]);
    setCurrentPriceRange({
      min: defaultMinPrice,
      max: defaultMaxPrice,
    });
    setAvailability('all');
    setSortBy('name-asc');
    router.push(window.location.pathname);
    setIsMobileOpen(false);
  };

  const hasActiveFilters = 
    selectedMarcas.length > 0 ||
    selectedTipos.length > 0 ||
    currentPriceRange.min > defaultMinPrice ||
    currentPriceRange.max < defaultMaxPrice ||
    availability === 'in-stock' ||
    sortBy !== 'name-asc';

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Contador de productos */}
      <div className="pb-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalProducts}</span> productos encontrados
        </p>
      </div>

      {/* Filtro por tipo de material (balones, guantes portero, material táctico, etc.) - arriba para mayor visibilidad */}
      {availableTipos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Tipo de material</h3>
          <p className="text-xs text-gray-500 mb-3">Balones, guantes, material táctico...</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableTipos.map((tipo) => (
              <label key={tipo.tipo_producto} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTipos.includes(tipo.tipo_producto)}
                  onChange={() => handleTipoToggle(tipo.tipo_producto)}
                  className="w-4 h-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366] focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                  {tipo.tipo_producto} <span className="text-gray-500">({tipo._count.tipo_producto})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Ordenar por */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Ordenar por</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por precio - Slider */}
      {(defaultMinPrice !== null && defaultMaxPrice !== null && defaultMaxPrice > defaultMinPrice) && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Precio: €{Math.round(currentPriceRange.min)} - €{Math.round(currentPriceRange.max)}
          </h3>
          <div className="space-y-4">
            {/* Slider de rango dual */}
            <div className="relative">
              <input
                type="range"
                min={defaultMinPrice}
                max={defaultMaxPrice}
                step={Math.max(1, Math.round((defaultMaxPrice - defaultMinPrice) / 100))}
                value={currentPriceRange.min}
                onChange={(e) => handlePriceChange('min', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #003366 0%, #003366 ${((currentPriceRange.min - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice)) * 100}%, #e5e7eb ${((currentPriceRange.min - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <input
                type="range"
                min={defaultMinPrice}
                max={defaultMaxPrice}
                step={Math.max(1, Math.round((defaultMaxPrice - defaultMinPrice) / 100))}
                value={currentPriceRange.max}
                onChange={(e) => handlePriceChange('max', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb mt-2"
                style={{
                  background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((currentPriceRange.max - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice)) * 100}%, #003366 ${((currentPriceRange.max - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice)) * 100}%, #003366 100%)`
                }}
              />
            </div>
            {/* Inputs numéricos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="minPrice" className="block text-xs text-gray-600 mb-1">
                  Mínimo (€)
                </label>
                <input
                  type="number"
                  id="minPrice"
                  min={defaultMinPrice}
                  max={currentPriceRange.max}
                  step="1"
                  value={Math.round(currentPriceRange.min)}
                  onChange={(e) => handlePriceChange('min', parseFloat(e.target.value) || defaultMinPrice)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-xs text-gray-600 mb-1">
                  Máximo (€)
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  min={currentPriceRange.min}
                  max={defaultMaxPrice}
                  step="1"
                  value={Math.round(currentPriceRange.max)}
                  onChange={(e) => handlePriceChange('max', parseFloat(e.target.value) || defaultMaxPrice)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtro por marca - Checkboxes */}
      {marcas.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Marca</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {marcas.map((marca) => (
              <label key={marca} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedMarcas.includes(marca)}
                  onChange={() => handleMarcaToggle(marca)}
                  className="w-4 h-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366] focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                  {marca}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por disponibilidad */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Disponibilidad</h3>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="availability"
              value="all"
              checked={availability === 'all'}
              onChange={() => setAvailability('all')}
              className="w-4 h-4 text-[#003366] border-gray-300 focus:ring-[#003366] focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
              Todos los productos
            </span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="availability"
              value="in-stock"
              checked={availability === 'in-stock'}
              onChange={() => setAvailability('in-stock')}
              className="w-4 h-4 text-[#003366] border-gray-300 focus:ring-[#003366] focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
              Solo en stock
            </span>
          </label>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <button
          onClick={applyFilters}
          className="w-full bg-[#003366] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#004488] transition-colors"
        >
          Aplicar filtros
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
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
          <FiltersContent />
        </div>
      </aside>

      {/* Mobile: Botón para abrir drawer */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <span>Filtros y ordenar</span>
          <span className="text-gray-500">
            {hasActiveFilters && `(${selectedMarcas.length + selectedTipos.length + (availability === 'in-stock' ? 1 : 0) + (currentPriceRange.min > (minPrice || 0) || currentPriceRange.max < (maxPrice || 1000) ? 1 : 0)} activos)`}
            <svg className="ml-2 w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <FiltersContent />
            </div>
          </div>
        </>
      )}

      {/* Estilos para el slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #003366;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #003366;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
}
