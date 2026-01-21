"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FavoriteItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (product: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: FavoriteItem) => void;
  getTotalFavorites: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'cps_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar favoritos desde localStorage al montar
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = (product: FavoriteItem) => {
    setFavorites((prevFavorites) => {
      // Verificar si ya existe
      if (prevFavorites.find((item) => item.id === product.id)) {
        return prevFavorites;
      }
      return [...prevFavorites, product];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prevFavorites) => prevFavorites.filter((item) => item.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (product: FavoriteItem) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const getTotalFavorites = () => {
    return favorites.length;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        getTotalFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
