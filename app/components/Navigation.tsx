"use client";

import Image from "next/image";
import Link from "next/link";
import MultiLevelNav from "@/app/components/MultiLevelNav";
import { navigationStructure } from "@/app/lib/navigationStructure";
import SearchBar from "@/app/components/SearchBar";
import FavoritesButton from "@/app/components/FavoritesButton";
import CartButton from "@/app/components/CartButton";

export default function Navigation() {
  return (
    <nav 
      className="w-full bg-white border-b border-gray-200 sticky top-0 z-40"
      style={{ '--nav-height': '73px' } as React.CSSProperties}
    >
      <div className="w-full px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between gap-4 md:gap-6 w-full">
          {/* Logo - Izquierda */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
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
          
          {/* Menú, Búsqueda, Favoritos y Carrito - Todo alineado a la derecha */}
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6 flex-1 justify-end">
            <ul className="flex items-center gap-4 md:gap-6 lg:gap-8 text-base md:text-lg lg:text-xl font-medium">
              {navigationStructure.map((categoria) => (
                <li key={categoria.slug}>
                  <MultiLevelNav categoria={categoria} />
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <div className="hidden md:block">
                <SearchBar />
              </div>
              <FavoritesButton />
              <CartButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
