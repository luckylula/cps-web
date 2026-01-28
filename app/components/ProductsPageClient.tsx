"use client";

import ProductCard from '@/app/components/ProductCard';

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

interface ProductsPageClientProps {
  products: Product[];
}

export default function ProductsPageClient({ products }: ProductsPageClientProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No se encontraron productos</p>
        <p className="text-gray-500 text-sm mt-2">
          Intenta ajustar los filtros para ver más resultados
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Mostrando <span className="font-semibold text-gray-900">{products.length}</span> productos
        </p>
      </div>
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
    </>
  );
}
