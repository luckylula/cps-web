"use client";

export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import CartButton from "@/app/components/CartButton";
import SearchBar from "@/app/components/SearchBar";
import FavoritesButton from "@/app/components/FavoritesButton";
import SubcategoryAccordion from "@/app/components/SubcategoryAccordion";

interface SubcategoryGroup {
  groupName: string;
  items: Array<{
    name: string;
    fullName: string;
    count: number;
  }>;
  totalCount: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  images: string[];
  featured: boolean;
  marca?: string | null;
  sku_interno?: string | null;
  stock: number;
  categoryId: string;
  subcategory?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

const categoryMap: Record<string, { name: string; description: string }> = {
  deportes: {
    name: 'Deportes',
    description: 'Material y equipamiento deportivo',
  },
  textil: {
    name: 'Textil',
    description: 'Ropa y calzado deportivo',
  },
  instalaciones: {
    name: 'Instalaciones',
    description: 'Equipamiento para instalaciones deportivas',
  },
  'material-escolar': {
    name: 'Material Escolar',
    description: 'Material deportivo escolar',
  },
};

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params?.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategoryGroups, setSubcategoryGroups] = useState<SubcategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const category = categoryMap[categorySlug] || {
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    description: '',
  };

  useEffect(() => {
    if (!categorySlug) return;

    // Fetch products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          category: categorySlug,
        });

        if (selectedSubcategory) {
          params.append('subcategory', encodeURIComponent(selectedSubcategory));
        }

        if (selectedMarca) {
          params.append('marca', selectedMarca);
        }

        if (minPrice) {
          params.append('minPrice', minPrice);
        }

        if (maxPrice) {
          params.append('maxPrice', maxPrice);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);

          // Extract unique marcas
          const uniqueMarcas = Array.from(
            new Set(data.map((p: Product) => p.marca).filter(Boolean))
          ) as string[];
          setMarcas(uniqueMarcas.sort());
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch subcategories grouped
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(`/api/categories/${categorySlug}/subcategories-grouped`);
        if (response.ok) {
          const data = await response.json();
          setSubcategoryGroups(data);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };

    fetchProducts();
    fetchSubcategories();
  }, [categorySlug, selectedSubcategory, selectedMarca, minPrice, maxPrice]);

  const handleSubcategoryClick = (subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
  };

  const handleMarcaClick = (marca: string | null) => {
    setSelectedMarca(marca);
  };

  const clearFilters = () => {
    setSelectedSubcategory(null);
    setSelectedMarca(null);
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Estilo Minimalista */}
      <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4 md:gap-6 w-full">
            {/* Logo y Nombre - Izquierda */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
              <Image
                src="/logo.png"
                alt="CPS Material Deportivo Logo"
                width={100}
                height={100}
                className="object-contain"
              />
              <div className="text-gray-900 text-lg md:text-xl lg:text-2xl font-semibold tracking-tight whitespace-nowrap">
                CPS Material Deportivo
              </div>
            </Link>
            
            {/* Menú de Navegación - Centro */}
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-1 justify-center text-base md:text-lg lg:text-xl font-medium">
              <li>
                <Link href="/" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categoria/deportes" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Deportes
                </Link>
              </li>
              <li>
                <Link href="/categoria/textil" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Textil
                </Link>
              </li>
              <li>
                <Link href="/categoria/instalaciones" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Instalaciones
                </Link>
              </li>
              <li>
                <Link href="/categoria/material-escolar" className="text-gray-900 hover:text-gray-600 transition-colors py-2 whitespace-nowrap">
                  Material Escolar
                </Link>
              </li>
            </ul>
            
            {/* Búsqueda, Favoritos y Carrito - Derecha */}
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <div className="hidden md:block">
                <SearchBar />
              </div>
              <FavoritesButton />
              <CartButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm md:text-base text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Filtros */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
                  
                  {/* Subcategorías con acordeón */}
                  {subcategoryGroups.length > 0 && (
                    <SubcategoryAccordion
                      groups={subcategoryGroups}
                      selectedSubcategory={selectedSubcategory}
                      onSubcategorySelect={handleSubcategoryClick}
                    />
                  )}

                  {/* Marcas */}
                  {marcas.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Marcas</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleMarcaClick(null)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedMarca === null
                              ? 'bg-[#003366] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          Todas
                        </button>
                        {marcas.map((marca) => (
                          <button
                            key={marca}
                            onClick={() => handleMarcaClick(marca)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedMarca === marca
                                ? 'bg-[#003366] text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {marca}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Precio */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Precio</h3>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Mínimo"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Máximo"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  {/* Limpiar filtros */}
                  {(selectedSubcategory || selectedMarca || minPrice || maxPrice) && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Productos */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {loading ? 'Cargando...' : `${products.length} productos encontrados`}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No se encontraron productos</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#004080] transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      images={product.images}
                      featured={product.featured}
                      marca={product.marca}
                      sku_interno={product.sku_interno}
                      stock={product.stock}
                      categoryId={product.categoryId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
