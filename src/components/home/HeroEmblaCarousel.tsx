import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { BannerSlide } from "@/types/database";
import Icon from "@/components/ui/Icon";

interface Props {
  slides: BannerSlide[];
  autoplayDelay?: number;
}

export default function HeroEmblaCarousel({
  slides,
  autoplayDelay = 5500,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const total = slides.length;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 25,
      skipSnaps: false,
    },
    [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="hero hero-embla-wrapper"
      aria-label="Carrusel Embla con arrastre táctil"
    >
      <div className="embla-viewport" ref={emblaRef}>
        <div className="embla-container">
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div className="embla-slide" key={slide.id}>
                {/* Imagen del Slide */}
                <picture>
                  {slide.imagen_mobile && (
                    <source
                      media="(max-width: 680px)"
                      srcSet={slide.imagen_mobile}
                    />
                  )}
                  <img
                    src={slide.imagen_desktop}
                    alt={slide.titulo || "Maison des Parfums"}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </picture>

                {/* Sombra y Degradado */}
                <div className="hero-shade" aria-hidden="true" />

                {/* Contenido Editorial */}
                <div
                  className={`hero-content ${
                    isActive ? "hero-content-active" : ""
                  }`}
                >
                  {slide.subtitulo && (
                    <p className="eyebrow">{slide.subtitulo}</p>
                  )}
                  <h1>
                    {slide.titulo}
                  </h1>
                  <p>
                    Descubre aromas que trascienden el tiempo y convierten tu
                    esencia en una firma inolvidable.
                  </p>
                  {slide.texto_boton && (
                    <a
                      href={slide.enlace_url || "/perfumes"}
                      className="btn btn-gold"
                    >
                      {slide.texto_boton} <Icon name="arrow" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicadores de navegación y controles de arrastre */}
      <div className="hero-index">
        <button
          type="button"
          onClick={scrollPrev}
          className="hero-arrow-btn"
          aria-label="Diapositiva anterior"
          title="Anterior"
        >
          ‹
        </button>

        <span className="hero-counter-num">
          {String(selectedIndex + 1).padStart(2, "0")}
        </span>

        {/* Línea divisoria elegante */}
        <i className="hero-index-divider" />

        <span className="hero-counter-num">
          {String(total).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={scrollNext}
          className="hero-arrow-btn"
          aria-label="Diapositiva siguiente"
          title="Siguiente"
        >
          ›
        </button>

        {/* Puntos interactivos */}
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-dot ${i === selectedIndex ? "active" : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
