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
          <div className="hidden md:flex items-center flex-1 justify-end">
            {/* Categorías: Instalaciones, Material Escolar, Deportes, Textil, Contacto */}
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8 text-base md:text-lg lg:text-xl font-medium">
              {navigationStructure
                .filter((c) => c.slug === "instalaciones" || c.slug === "material-escolar")
                .map((categoria) => (
                  <li key={categoria.slug}>
                    <MultiLevelNav categoria={categoria} />
                  </li>
                ))}
              {navigationStructure
                .filter((c) => c.slug === "deportes")
                .map((categoria) => (
                  <li key={categoria.slug}>
                    <MultiLevelNav categoria={categoria} />
                  </li>
                ))}
              {navigationStructure
                .filter((c) => c.slug === "textil")
                .map((categoria) => (
                  <li key={categoria.slug}>
                    <MultiLevelNav categoria={categoria} />
                  </li>
                ))}
              <li>
                <Link
                  href="/#contacto"
                  className="text-gray-900 hover:text-gray-600 transition-colors py-2 flex items-center justify-center"
                  aria-label="Contacto"
                  title="Contacto (teléfono y email)"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </Link>
              </li>
            </ul>
            {/* Búsqueda, Favoritos, Cesta - muy juntos, alineados a la derecha */}
            <div className="flex items-center gap-1 ml-6 md:ml-8 flex-shrink-0">
              <SearchBar compact />
              <FavoritesButton />
              <CartButton />
            </div>
          </div>

          {/* Búsqueda, Favoritos y Cesta - solo móvil, muy juntos */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            <SearchBar compact />
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
              {[
                ...navigationStructure.filter((c) => c.slug === "instalaciones" || c.slug === "material-escolar"),
                ...navigationStructure.filter((c) => c.slug === "deportes"),
                ...navigationStructure.filter((c) => c.slug === "textil"),
                { slug: "contacto", nombre: "Contacto", subcategorias: [] },
              ].map((item) =>
                item.slug === "contacto" ? (
                  <div key="contacto" className="border-b border-gray-100 py-3">
                    <Link
                      href="/#contacto"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 font-medium text-gray-900 py-2"
                    >
                      <span className="flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      Contacto
                    </Link>
                  </div>
                ) : (
                  <div key={item.slug} className="border-b border-gray-100 py-3">
                    <Link
                      href={`/${item.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block font-medium text-gray-900 py-2"
                    >
                      {item.nombre}
                    </Link>
                    <ul className="pl-3 space-y-1 mt-1">
                      {item.subcategorias.map((sub) => (
                        <li key={sub.slug}>
                          {sub.grupos.length > 0 ? (
                            <>
                              <span className="block text-sm font-medium text-gray-600 py-1">{sub.nombre}</span>
                              <ul className="pl-2 space-y-0.5">
                                {sub.grupos.map((grupo) => (
                                  <li key={grupo.slug}>
                                    <Link
                                      href={buildUrl(item.slug, sub.slug, grupo.slug)}
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
                              href={buildUrl(item.slug, sub.slug)}
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
                )
              )}
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}
