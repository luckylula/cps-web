"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import Navigation from "@/app/components/Navigation";
import { getGrupoName, getSubcategoryName, getCategoryName } from "@/app/lib/navigationMapping";

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
}

export default function GrupoPage() {
  const params = useParams();
  const categoriaSlug = params?.categoria as string;
  const subcategorySlug = params?.subcategory as string;
  const grupoSlug = params?.grupo as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoriaSlug || !subcategorySlug || !grupoSlug) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Convertir slugs a nombres para la API
        const grupoName = getGrupoName(categoriaSlug, subcategorySlug, grupoSlug);
        const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug);
        
        const params = new URLSearchParams({
          category: categoriaSlug,
        });
        
        if (subcategoryName) {
          params.append('subcategory', subcategoryName);
        }
        
        if (grupoName) {
          params.append('grupo', grupoName);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoriaSlug, subcategorySlug, grupoSlug]);

  const categoryName = getCategoryName(categoriaSlug) || categoriaSlug;
  const subcategoryName = getSubcategoryName(categoriaSlug, subcategorySlug) || subcategorySlug;
  const grupoName = getGrupoName(categoriaSlug, subcategorySlug, grupoSlug) || grupoSlug;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm md:text-base text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${categoriaSlug}`} className="hover:text-gray-900 transition-colors">
              {categoryName}
            </Link>
            <span>/</span>
            <Link href={`/${categoriaSlug}/${subcategorySlug}`} className="hover:text-gray-900 transition-colors">
              {subcategoryName}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{grupoName}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tight">
              {grupoName}
            </h1>
            <p className="text-gray-600">{categoryName} · {subcategoryName}</p>
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
