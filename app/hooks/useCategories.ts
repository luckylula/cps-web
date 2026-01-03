import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
}

export function useCategories(categorySlugs: string[]) {
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);
        
        const categoryPromises = categorySlugs.map(async (slug) => {
          const response = await fetch(`/api/categories/${slug}?includeProducts=true`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        });

        const fetchedCategories = await Promise.all(categoryPromises);
        const categoriesMap: Record<string, Category> = {};

        fetchedCategories.forEach((category, index) => {
          if (category) {
            const key = categorySlugs[index];
            categoriesMap[key] = category;
          }
        });

        setCategories(categoriesMap);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Error al cargar las categorías');
      } finally {
        setLoading(false);
      }
    }

    if (categorySlugs.length > 0) {
      fetchCategories();
    }
  }, [categorySlugs.join(',')]);

  return { categories, loading, error };
}
