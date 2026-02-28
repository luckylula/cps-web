"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { generateBlurDataURL, shouldUnoptimizeImage, fixUrlProtocol } from '@/app/lib/imageUtils';

interface ImageLoaderProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
}

export default function ImageLoader({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  sizes,
  objectFit = 'contain',
  quality = 80,
}: ImageLoaderProps) {
  const fixedSrc = useMemo(() => fixUrlProtocol(src), [src]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const blurDataURL = generateBlurDataURL();
  const shouldUnoptimize = shouldUnoptimizeImage(fixedSrc);
  
  const objectFitClass = 
    objectFit === 'contain' ? 'object-contain' :
    objectFit === 'cover' ? 'object-cover' :
    objectFit === 'fill' ? 'object-fill' :
    objectFit === 'none' ? 'object-none' :
    'object-scale-down';

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

  if (fill) {
    return (
      <div className={`relative ${className}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Skeleton mientras carga */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-10">
            <div className="absolute inset-0 bg-gray-200 animate-shimmer" />
          </div>
        )}
        <Image
          src={fixedSrc}
          alt={alt}
          fill
          className={`${objectFitClass} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={shouldUnoptimize}
          quality={shouldUnoptimize ? undefined : quality}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Skeleton mientras carga */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-10 rounded"
          style={{ width, height }}
        >
          <div className="absolute inset-0 bg-gray-200 animate-shimmer rounded" />
        </div>
      )}
      <Image
        src={fixedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${objectFitClass} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={shouldUnoptimize}
        quality={shouldUnoptimize ? undefined : quality}
      />
    </div>
  );
}
