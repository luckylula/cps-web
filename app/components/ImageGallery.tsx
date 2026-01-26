"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Sin imagen
        </div>
      </div>
    );
  }

  // Si solo hay una imagen, mostrar solo esa
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src={images[0]}
          alt={productName}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  // Múltiples imágenes: galería con thumbnails
  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src={images[selectedImageIndex]}
          alt={`${productName} - Imagen ${selectedImageIndex + 1}`}
          fill
          className="object-contain"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
              selectedImageIndex === index
                ? 'border-[#003366] ring-2 ring-[#003366] ring-offset-2'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            aria-label={`Ver imagen ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${productName} - Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 12.5vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
