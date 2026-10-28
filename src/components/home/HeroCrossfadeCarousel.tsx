import { useState, useEffect, useRef, useCallback } from "react";
import type { BannerSlide } from "@/types/database";
import Icon from "@/components/ui/Icon";

interface Props {
  slides: BannerSlide[];
  intervalMs?: number;
}

export default function HeroCrossfadeCarousel({
  slides,
  intervalMs = 6000,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
    setProgress(0);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
    setProgress(0);
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrent(index);
    setProgress(0);
  };

  // Temporizador y barra de progreso continua
  useEffect(() => {
    if (isPaused || total <= 1) return;

    const tickMs = 50;
    const step = (tickMs / intervalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [isPaused, intervalMs, nextSlide, total]);

  // Soporte táctil Swipe (móviles y tablets)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="hero hero-crossfade"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrusel de fragancias destacadas"
    >
      {/* Capas de imágenes con fundido cruzado (Crossfade) y Ken-Burns sutil */}
      <div className="hero-slides-layer" aria-hidden="true">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`hero-slide-bg ${isActive ? "active" : ""}`}
            >
              <picture>
                {slide.imagen_mobile && (
                  <source
                    media="(max-width: 680px)"
                    srcSet={slide.imagen_mobile}
                  />
                )}
                <img
                  src={slide.imagen_desktop}
                  alt={slide.titulo || "Perfume Maison des Parfums"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </picture>
            </div>
          );
        })}
      </div>

      {/* Degradado editorial de sombra */}
      <div className="hero-shade" aria-hidden="true" />

      {/* Contenido textual con animación suave de entrada */}
      {slides.map((slide, index) => {
        if (index !== current) return null;
        return (
          <div key={slide.id} className="hero-content hero-content-fade">
            {slide.subtitulo && (
              <p className="eyebrow">{slide.subtitulo}</p>
            )}
            <h1>
              {slide.titulo}
            </h1>
            <p>
              Descubre aromas que trascienden el tiempo y convierten tu esencia en
              una firma inolvidable.
            </p>
            {slide.texto_boton && (
              <a href={slide.enlace_url || "/perfumes"} className="btn btn-gold">
                {slide.texto_boton} <Icon name="arrow" />
              </a>
            )}
          </div>
        );
      })}

      {/* Indicadores de navegación y barra de progreso viva */}
      <div className="hero-index">
        <button
          type="button"
          onClick={prevSlide}
          className="hero-arrow-btn"
          aria-label="Diapositiva anterior"
          title="Anterior"
        >
          ‹
        </button>

        <span className="hero-counter-num">
          {String(current + 1).padStart(2, "0")}
        </span>

        {/* Barra de progreso interactiva */}
        <div className="hero-progress-track" title="Pausar / Continuar">
          <div
            className="hero-progress-bar"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <span className="hero-counter-num">
          {String(total).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={nextSlide}
          className="hero-arrow-btn"
          aria-label="Diapositiva siguiente"
          title="Siguiente"
        >
          ›
        </button>

        {/* Puntos discretos de salto directo */}
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-dot ${i === current ? "active" : ""}`}
              onClick={() => goToSlide(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
