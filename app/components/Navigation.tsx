"use client";

import Image from "next/image";
import Link from "next/link";
import MegaMenu from "@/app/components/MegaMenu";
import SearchBar from "@/app/components/SearchBar";
import FavoritesButton from "@/app/components/FavoritesButton";
import CartButton from "@/app/components/CartButton";

export default function Navigation() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
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
              <MegaMenu categorySlug="deportes" categoryName="Deportes" />
            </li>
            <li>
              <MegaMenu categorySlug="textil" categoryName="Textil" />
            </li>
            <li>
              <MegaMenu categorySlug="instalaciones" categoryName="Instalaciones" />
            </li>
            <li>
              <MegaMenu categorySlug="material-escolar" categoryName="Material Escolar" />
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
  );
}
