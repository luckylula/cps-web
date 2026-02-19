"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import ProductCard from "@/app/components/ProductCard";
import SearchBar from "@/app/components/SearchBar";

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

function BusquedaContent() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q")?.trim() ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q || q.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(q)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm md:text-base text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Búsqueda</span>
            {q && (
              <>
                <span>/</span>
                <span className="text-gray-700">&quot;{q}&quot;</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <section className="py-8 md:py-12 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tight">
              Resultados de búsqueda
            </h1>
            {q && (
              <p className="text-gray-600">
                Productos que coinciden con &quot;{q}&quot;
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {loading
                ? "Cargando..."
                : `${products.length} ${products.length === 1 ? "producto encontrado" : "productos encontrados"}`}
            </p>
          </div>

          {!q || q.length < 2 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Escribe al menos 2 caracteres en la barra de búsqueda para ver resultados.
              </p>
              <Link
                href="/"
                className="inline-block mt-4 px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#004080] transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se encontraron productos para &quot;{q}&quot;</p>
              <Link
                href="/"
                className="inline-block mt-4 px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#004080] transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  images={product.images ?? []}
                  featured={product.featured ?? false}
                  marca={product.marca}
                  sku_interno={product.sku_interno}
                  stock={product.stock ?? 0}
                  categoryId={product.categoryId}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="py-8 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Services S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function BusquedaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]" />
      </div>
    }>
      <BusquedaContent />
    </Suspense>
  );
}
