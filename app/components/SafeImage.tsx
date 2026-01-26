"use client";

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  objectFit = 'cover',
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // No intentar cargar otra imagen, mostrar SVG inline directamente
    }
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Imagen no disponible</p>
        </div>
      </div>
    );
  }

  const imageClassName = `${className} ${
    objectFit === 'contain' ? 'object-contain' :
    objectFit === 'cover' ? 'object-cover' :
    objectFit === 'fill' ? 'object-fill' :
    objectFit === 'none' ? 'object-none' :
    'object-scale-down'
  }`;

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={imageClassName}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        unoptimized={imgSrc.includes('cdn.jimsports.shop')} // Desactivar optimización para CDN problemático
        loading={priority ? undefined : 'lazy'}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={imageClassName}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      unoptimized={imgSrc.includes('cdn.jimsports.shop')} // Desactivar optimización para CDN problemático
    />
  );
}
