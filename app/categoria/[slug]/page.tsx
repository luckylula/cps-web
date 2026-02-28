"use client";

export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import Navigation from "@/app/components/Navigation";
import GroupAccordion from "@/app/components/GroupAccordion";

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
  hasStock?: boolean;
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = params?.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const category = categoryMap[categorySlug] || {
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    description: '',
  };

  // Leer parámetros de URL al cargar o cuando cambia la URL
  useEffect(() => {
    if (!categorySlug) return;

    const grupoParam = searchParams?.get('grupo');
    const subcategoryParam = searchParams?.get('subcategory');

    setSelectedGrupo(grupoParam ? decodeURIComponent(grupoParam) : null);
    setSelectedSubcategories(subcategoryParam ? [decodeURIComponent(subcategoryParam)] : []);
  }, [categorySlug, searchParams]);

  useEffect(() => {
    if (!categorySlug) return;

    // Fetch products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          category: categorySlug,
        });

        if (selectedGrupo) {
          params.append('grupo', encodeURIComponent(selectedGrupo));
        }

        // Si hay subcategorías seleccionadas, usar la primera (por ahora solo una)
        // TODO: Actualizar API para aceptar múltiples subcategorías
        if (selectedSubcategories.length > 0) {
          params.append('subcategory', encodeURIComponent(selectedSubcategories[0]));
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

    // Fetch grupos structure
    const fetchGrupos = async () => {
      try {
        const response = await fetch(`/api/categories/${categorySlug}/structure`);
        if (response.ok) {
          const data = await response.json();
          setGrupos(data.grupos || []);
        }
      } catch (error) {
        console.error('Error fetching grupos:', error);
      }
    };

    fetchProducts();
    fetchGrupos();
  }, [categorySlug, selectedGrupo, selectedSubcategories, selectedMarca, minPrice, maxPrice]);

  const handleGrupoToggle = (grupo: string) => {
    if (selectedGrupo === grupo) {
      setSelectedGrupo(null);
    } else {
      setSelectedGrupo(grupo);
    }
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setSelectedSubcategories((prev) => {
      if (prev.includes(subcategory)) {
        return prev.filter((s) => s !== subcategory);
      } else {
        return [...prev, subcategory];
      }
    });
  };

  const handleMarcaClick = (marca: string | null) => {
    setSelectedMarca(marca);
  };

  const clearFilters = () => {
    setSelectedGrupo(null);
    setSelectedSubcategories([]);
    setSelectedMarca(null);
    setMinPrice('');
    setMaxPrice('');
    router.replace(`/categoria/${categorySlug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm md:text-base text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href={`/categoria/${categorySlug}`} className="hover:text-gray-900 transition-colors">
              {category.name}
            </Link>
            {selectedGrupo && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">{selectedGrupo}</span>
              </>
            )}
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
                  
                  {/* Grupos: si hay ?grupo= en URL, mostrar solo ese grupo; si no, todos */}
                  {grupos.length > 0 && (
                    <GroupAccordion
                      grupos={selectedGrupo ? grupos.filter((g) => g.nombre === selectedGrupo) : grupos}
                      selectedGrupo={selectedGrupo}
                      selectedSubcategories={selectedSubcategories}
                      onGrupoToggle={handleGrupoToggle}
                      onSubcategoryToggle={handleSubcategoryToggle}
                      onClearAll={clearFilters}
                      singleGroupMode={!!selectedGrupo}
                      categorySlug={categorySlug}
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
                  {(selectedGrupo || selectedSubcategories.length > 0 || selectedMarca || minPrice || maxPrice) && (
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
                  {selectedGrupo ?? category.name}
                </h1>
                {!selectedGrupo && category.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
                {selectedGrupo && (
                  <p className="text-gray-600">{category.name}</p>
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
                      hasStock={product.hasStock}
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
          <p>© 2024 Control Play Services S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
