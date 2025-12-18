"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    title: "Equipamiento Deportivo de Alto Rendimiento",
    subtitle: "Innovación y seguridad certificada para centros educativos, clubes y colectivos.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80",
    ctaText: "Ver Catálogo 2025",
    ctaLink: "/catalogo.pdf",
  },
  {
    title: "Asesoramiento Técnico Especializado",
    subtitle: "No solo vendemos material, diseñamos soluciones integrales para tus espacios deportivos.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&q=80",
    ctaText: "Solicitar Asesoramiento",
    ctaLink: "#contacto",
  },
  {
    title: "Tu Socio Estratégico en el Deporte",
    subtitle: "Explora nuestro catálogo. Material deportivo para cada espacio y cada nivel",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80",
    ctaText: "Ver Catálogo 2025",
    ctaLink: "/catalogo.pdf",
  },
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        setIsVisible(true);
      }, 500);
    }, 6000); // Cambia cada 6 segundos

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsVisible(true);
    }, 300);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Imagen con efecto Ken Burns */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={`object-cover transition-transform duration-[10000ms] ease-linear ${
                index === currentIndex ? "scale-110" : "scale-100"
              }`}
              priority={index === 0}
            />
          </div>
          
          {/* Overlay oscuro para mejor legibilidad */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Contenido del slide */}
          {index === currentIndex && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8 text-center">
              <div
                className={`max-w-4xl mx-auto transition-all duration-1000 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-montserrat tracking-tight"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 font-light font-inter max-w-3xl mx-auto leading-relaxed"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {slide.subtitle}
                </p>
                <a
                  href={slide.ctaLink}
                  target={slide.ctaLink.startsWith("#") ? undefined : "_blank"}
                  rel={slide.ctaLink.startsWith("#") ? undefined : "noopener noreferrer"}
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full text-lg md:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-inter"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {slide.ctaText}
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Indicadores */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-10 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Flechas de navegación */}
      <button
        onClick={() => goToSlide((currentIndex - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300"
        aria-label="Slide anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goToSlide((currentIndex + 1) % slides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300"
        aria-label="Slide siguiente"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
