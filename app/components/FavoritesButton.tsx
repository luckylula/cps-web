"use client";

import Link from 'next/link';
import { useFavorites } from '@/app/context/FavoritesContext';

export default function FavoritesButton() {
  const { getTotalFavorites } = useFavorites();
  const totalFavorites = getTotalFavorites();

  return (
    <Link 
      href="/favoritos" 
      className="text-white hover:text-orange-300 transition-colors font-medium bg-blue-600 px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-blue-700 whitespace-nowrap relative"
    >
      <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
      Favoritos
      {totalFavorites > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalFavorites > 99 ? '99+' : totalFavorites}
        </span>
      )}
    </Link>
  );
}
