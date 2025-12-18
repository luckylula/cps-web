"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const sportsImages = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80",
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1920&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&q=80",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=80",
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sportsImages.length);
    }, 5000); // Cambia de imagen cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {sportsImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Imagen deportiva ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {sportsImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

