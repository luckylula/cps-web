"use client";

import { useState, useEffect, useRef } from "react";

interface Slide {
  title: string;
  subtitle: string;
  video: string;
}

/** Display duration per slide in ms. Carousel 2 (index 1) lasts longer. */
const slideDurationsMs = [6000, 10000, 6000, 6000, 6000];

const slides: Slide[] = [
  {
    title: "Equipamiento Deportivo de Alto Rendimiento",
    subtitle: "Innovación y seguridad certificada para centros educativos, clubes y colectivos.",
    video: "/categorias/videocarrusel1.mp4",
  },
  {
    title: "Asesoramiento Técnico Especializado",
    subtitle: "No solo vendemos material, diseñamos soluciones integrales para tus espacios deportivos.",
    video: "/categorias/videocarrusel2.mp4",
  },
  {
    title: "Tu Socio Estratégico en el Deporte",
    subtitle: "Explora nuestro catálogo. Material deportivo para cada espacio y cada nivel",
    video: "/categorias/videocarrusel3.mp4",
  },
  {
    title: "Soluciones Deportivas Profesionales",
    subtitle: "Equipamos espacios deportivos donde la calidad, la seguridad y el rendimiento van de la mano.",
    video: "/categorias/videocarrusel4.mp4",
  },
  {
    title: "Material Deportivo de Calidad",
    subtitle: "Todo lo que necesitas para tu centro deportivo, colegio o instalación.",
    video: "/categorias/videocarrusel5.mp4",
  },
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex]);

  useEffect(() => {
    const duration = slideDurationsMs[currentIndex] ?? 6000;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        setIsVisible(true);
      }, 500);
    }, duration);

    return () => clearInterval(interval);
  }, [currentIndex]);

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
          {/* Video de fondo */}
          <div className="absolute inset-0">
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={slide.video}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              preload="auto"
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
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-lg md:text-xl lg:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {slide.subtitle}
                </p>
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
