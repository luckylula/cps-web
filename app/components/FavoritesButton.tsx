"use client";

import Link from 'next/link';
import { useFavorites } from '@/app/context/FavoritesContext';

export default function FavoritesButton() {
  const { getTotalFavorites } = useFavorites();
  const totalFavorites = getTotalFavorites();

  return (
    <Link 
      href="/favoritos" 
      className="text-gray-900 hover:text-gray-600 transition-colors font-medium px-3 md:px-4 py-1.5 md:py-2 whitespace-nowrap relative flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill={totalFavorites > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="hidden md:inline">Favoritos</span>
      {totalFavorites > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalFavorites > 99 ? '99+' : totalFavorites}
        </span>
      )}
    </Link>
  );
}
