"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SafeImage from "./SafeImage";
import { getFirstValidImage } from "@/app/lib/imageUtils";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  images: string[];
  categoryId: string;
}

interface SearchBarProps {
  compact?: boolean;
}

export default function SearchBar({ compact = false }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search products when query changes
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(data.length > 0);
        } else {
          setResults([]);
          setShowResults(false);
        }
      } catch (error) {
        console.error("Error searching products:", error);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setShowResults(false);
    setResults([]);
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) {
      return "Consultar";
    }
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getCategoryName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      deportes: 'Deportes',
      textil: 'Textil',
      instalaciones: 'Instalaciones',
      'material-escolar': 'Material Escolar',
    };
    return categoryMap[categoryId] || categoryId;
  };

  return (
    <div ref={searchRef} className={`relative w-full ${compact ? 'max-w-[160px] md:max-w-[180px]' : 'max-w-md'}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder="Buscar artículos..."
          className={`w-full bg-gray-50 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all ${compact ? 'px-3 py-1.5 pl-8 pr-3 text-sm' : 'px-4 py-2 pl-10 pr-4'}`}
        />
        <div className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${compact ? 'left-2.5' : 'left-3'}`}>
          <svg
            className={compact ? 'w-4 h-4' : 'w-5 h-5'}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {isLoading ? "Buscando..." : "No se encontraron productos"}
            </div>
          ) : (
            <>
              <div className="p-2 text-xs text-gray-500 border-b border-gray-200">
                {results.length} {results.length === 1 ? "resultado" : "resultados"}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/articulos/${encodeURIComponent(product.slug)}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <SafeImage
                        src={getFirstValidImage(product.images) || ''}
                        alt={product.name}
                        fill
                        className=""
                        sizes="64px"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {getCategoryName(product.categoryId)}
                      </p>
                      <p className="text-sm font-semibold text-[#003366] mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
