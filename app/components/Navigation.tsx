"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MultiLevelNav from "@/app/components/MultiLevelNav";
import { navigationStructure } from "@/app/lib/navigationStructure";
import SearchBar from "@/app/components/SearchBar";
import FavoritesButton from "@/app/components/FavoritesButton";
import CartButton from "@/app/components/CartButton";

function buildUrl(slug: string, sub?: string, grupo?: string) {
  if (grupo && sub) return `/${slug}/${sub}/${grupo}`;
  if (sub) return `/${slug}/${sub}`;
  return `/${slug}`;
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav 
      className="w-full bg-white border-b border-gray-200 sticky top-0 z-40"
      style={{ '--nav-height': '73px' } as React.CSSProperties}
    >
      <div className="w-full px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between gap-4 md:gap-6 w-full">
          {/* Menú hamburguesa - solo móvil, alineado a la izquierda */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo - centro en móvil, izquierda en desktop */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0 md:mr-0 mx-auto md:mx-0">
            <span className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 flex items-center justify-center bg-white">
              <Image
                src="/logo.png"
                alt="CPS Material Deportivo"
                width={128}
                height={128}
                className="object-contain w-full h-full"
              />
            </span>
          </Link>
          
          {/* Menú desktop - oculto en móvil */}
          <div className="hidden md:flex items-center gap-3 md:gap-4 lg:gap-6 flex-1 justify-end">
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8 text-base md:text-lg lg:text-xl font-medium">
              {navigationStructure.map((categoria) => (
                <li key={categoria.slug}>
                  <MultiLevelNav categoria={categoria} />
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <SearchBar />
              <FavoritesButton />
              <CartButton />
            </div>
          </div>

          {/* Favoritos y Carrito - solo móvil, a la derecha */}
          <div className="flex md:hidden items-center gap-3 flex-shrink-0">
            <FavoritesButton />
            <CartButton />
          </div>
        </div>
      </div>

      {/* Drawer móvil - menú desplegable desde la izquierda */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden fixed top-0 left-0 bottom-0 w-[min(300px,85vw)] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-medium text-gray-900">Menú</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Cerrar menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4">
              {navigationStructure.map((categoria) => (
                <div key={categoria.slug} className="border-b border-gray-100 last:border-0 py-3">
                  <Link
                    href={`/${categoria.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-medium text-gray-900 py-2"
                  >
                    {categoria.nombre}
                  </Link>
                  <ul className="pl-3 space-y-1 mt-1">
                    {categoria.subcategorias.map((sub) => (
                      <li key={sub.slug}>
                        {sub.grupos.length > 0 ? (
                          <>
                            <span className="block text-sm font-medium text-gray-600 py-1">{sub.nombre}</span>
                            <ul className="pl-2 space-y-0.5">
                              {sub.grupos.map((grupo) => (
                                <li key={grupo.slug}>
                                  <Link
                                    href={buildUrl(categoria.slug, sub.slug, grupo.slug)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-sm text-gray-600 py-1.5 hover:text-[#003366]"
                                  >
                                    {grupo.nombre}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <Link
                            href={buildUrl(categoria.slug, sub.slug)}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm text-gray-600 py-1.5 hover:text-[#003366]"
                          >
                            {sub.nombre}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}
