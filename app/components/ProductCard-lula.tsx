import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: string | number;  // ← CAMBIO AQUÍ
  images: string[];
  featured: boolean;
  category: {
    name: string;
  };
}

export default function ProductCard({ 
  name, 
  slug, 
  price, 
  images, 
  featured,
  category 
}: ProductCardProps) {
  const numericPrice = Number(price);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;

  return (
    <Link 
      href={`/productos/${slug}`}
      className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={images[0] || '/placeholder.png'}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {featured && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            DESTACADO
          </span>
        )}
      </div>
      
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {category.name}
        </p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>
        {hasPrice ? (
          <p className="text-xl font-bold text-blue-600">
            {numericPrice.toFixed(2)}€
          </p>
        ) : (
          <p className="text-xl font-bold text-blue-600">
            Consultar precio
          </p>
        )}
      </div>
    </Link>
  );
}