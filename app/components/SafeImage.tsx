"use client";

import { useState, useEffect, useRef } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resetear estado cuando cambia la src
  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src]);

  const handleError = () => {
    // Limpiar timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Intentar retry solo 1 vez antes de mostrar error
    if (retryCount < 1) {
      console.log(`[SafeImage] Retry ${retryCount + 1} for image: ${src}`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Intentar recargar la misma URL con timestamp para evitar caché
        const baseUrl = src.split('?')[0];
        setImgSrc(`${baseUrl}?t=${Date.now()}`);
        setIsLoading(true);
      }, 2000); // Esperar 2 segundos antes de retry
    } else {
      console.error(`[SafeImage] Failed to load image after retries: ${src}`);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    // Limpiar timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);
  };

  // Validar que la URL sea válida
  const isValidUrl = src && src.trim() !== '' && (
    src.startsWith('http://') || 
    src.startsWith('https://') || 
    src.startsWith('data:') || 
    src.startsWith('/')
  );

  if (!isValidUrl || hasError) {
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
  } ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`;

  // Determinar si desactivar optimización (para CDNs externos problemáticos)
  const shouldUnoptimize = imgSrc.includes('cdn.jimsports.shop') || 
                          imgSrc.includes('cdn.b2b.grupojimsports.com') ||
                          imgSrc.includes('jimsports.shop') ||
                          imgSrc.includes('madeforsport.eu');

  if (fill) {
    return (
      <div className={`relative ${className}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={imageClassName}
          sizes={sizes}
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
          unoptimized={shouldUnoptimize}
          loading={priority ? undefined : 'lazy'}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center" style={{ width, height }}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={imageClassName}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={shouldUnoptimize}
        loading={priority ? undefined : 'lazy'}
      />
    </div>
  );
}
