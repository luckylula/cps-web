"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import CartButton from "@/app/components/CartButton";
import ProductCard from "@/app/components/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: string[];
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  images: string[];
  featured: boolean;
  category: {
    name: string;
  };
}

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// Función para sanitizar descripción antes de renderizar con dangerouslySetInnerHTML
function sanitizeDescription(description: string): string {
  if (!description) return '';
  
  let cleaned = description
    // Eliminar scripts y eventos peligrosos
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // Eliminar javascript: en enlaces
    .replace(/javascript:/gi, '')
    // Eliminar iframes
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Convertir saltos de línea a <br>
    .replace(/\n/g, '<br />')
    // Limitar longitud para evitar problemas de renderizado
    .substring(0, 10000);
  
  return cleaned;
}

export default function ArticuloPage({ params }: PageProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [slug, setSlug] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  // Resolver params (puede ser Promise en Next.js 15)
  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await Promise.resolve(params);
      setSlug(resolvedParams.slug);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      try {
        console.log('[Page] Fetching product with slug:', slug);
        const response = await fetch(`/api/products/${encodeURIComponent(slug)}`);
        
        console.log('[Page] Response status:', response.status);
        
        if (response.status === 404) {
          console.log('[Page] Product not found, setting notFound state');
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[Page] Error response:', errorData);
          throw new Error(errorData.error || "Error al cargar el producto");
        }
        
        const data = await response.json();
        console.log('[Page] Product loaded:', data.name);
        setProduct(data);

        // Fetch related products
        const relatedResponse = await fetch(
          `/api/products?category=${data.category.slug}&excludeId=${data.id}&limit=8`
        );
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          // Mezclar aleatoriamente y tomar 4
          const shuffled = relatedData.sort(() => Math.random() - 0.5).slice(0, 4);
          setRelatedProducts(shuffled);
        }
      } catch (error: any) {
        console.error("[Page] Error fetching product:", error);
        console.error("[Page] Error details:", {
          message: error.message,
          stack: error.stack,
        });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        images: product.images,
      });
    }
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value < 1) {
      setQuantity(1);
    } else if (value > 99) {
      setQuantity(99);
    } else {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
              <Link
                href="/"
                className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors"
              >
                CPS Material Deportivo
              </Link>
              <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <CartButton />
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* 404 Content */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Producto no encontrado
              </h2>
              <p className="text-gray-600">
                El producto que buscas no existe o no está disponible.
              </p>
              {slug && (
                <p className="text-sm text-gray-500 mt-2">
                  Slug buscado: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
                </p>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priceWithIVA = Number(product.price);
  const priceWithoutIVA = priceWithIVA / 1.21;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
            <Link
              href="/"
              className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors"
            >
              CPS Material Deportivo
            </Link>
            <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1"
                >
                  Home
                </Link>
              </li>
              <li>
                <CartButton />
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/"
              className="hover:text-[#003366] transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/${product.category.slug}`}
              className="hover:text-[#003366] transition-colors"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Image Section - Left Column */}
            <div className="sticky top-24">
              <div className="rounded-2xl overflow-hidden shadow-xl bg-white">
                <div className="relative aspect-square">
                  <Image
                    src={product.images[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Content Section - Right Column */}
            <div className="space-y-6">
              {/* Category Badge */}
              {product.subcategory && (
                <div>
                  <span className="inline-block px-4 py-1.5 bg-[#003366] text-white text-sm font-medium rounded-full">
                    {product.subcategory}
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
                {product.name}
              </h1>

              {/* Price Block */}
              <div className="bg-white rounded-lg p-6 border-2 border-orange-500">
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-[#003366]">
                    {priceWithIVA.toFixed(2)} €
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Precio sin IVA:{" "}
                  <span className="font-medium">
                    {priceWithoutIVA.toFixed(2)} €
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">IVA incluido (21%)</p>
              </div>

              {/* Quantity Selector */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-semibold"
                      aria-label="Disminuir cantidad"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max="99"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-20 px-4 py-2 text-center text-lg font-semibold text-gray-900 border-0 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-semibold"
                      aria-label="Aumentar cantidad"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {isAdding ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Añadiendo...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Agregar al carrito
                      </>
                    )}
                  </button>
                </div>
                {product.stock > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    Stock disponible: <span className="font-medium">{product.stock} unidades</span>
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-sm text-gray-500 mt-3 italic">
                    Stock: Consultar disponibilidad
                  </p>
                )}
              </div>

              {/* Technical Description */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Descripción Técnica
                </h2>
                {product.description && product.description.trim() ? (
                  <div
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeDescription(product.description),
                    }}
                  />
                ) : (
                  <p className="text-gray-600 italic">
                    Consultar especificaciones técnicas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  slug={relatedProduct.slug}
                  price={relatedProduct.price}
                  images={relatedProduct.images}
                  featured={relatedProduct.featured}
                  category={relatedProduct.category}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
