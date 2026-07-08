"use client";

import { useEffect, useState } from "react";
import ProductsPageClient from "@/app/components/ProductsPageClient";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  priceFrom?: boolean;
  images: string[];
  featured: boolean;
  marca?: string | null;
  sku_interno?: string | null;
  stock: number;
  categoryId: string;
  hasStock?: boolean;
}

interface SubcategoryProductsLoaderProps {
  category: string;
  subcategory: string;
  grupo?: string;
}

export default function SubcategoryProductsLoader({
  category,
  subcategory,
  grupo,
}: SubcategoryProductsLoaderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          category,
          subcategory,
        });
        if (grupo) {
          params.set("grupo", grupo);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos");
        }

        const data = (await response.json()) as Product[];
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los productos"
          );
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [category, subcategory, grupo]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">{error}</p>
        <p className="text-gray-500 text-sm mt-2">
          Inténtalo de nuevo en unos segundos.
        </p>
      </div>
    );
  }

  return <ProductsPageClient products={products} />;
}
