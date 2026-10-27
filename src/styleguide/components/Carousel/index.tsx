import type { HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CarouselContentProps, CarouselProps } from './shared-types';
import { CarouselContext, useCarousel, useCarouselContext } from './useCarousel';

export function Carousel({
  label,
  options,
  className = '',
  children,
  onKeyDown,
  ...props
}: CarouselProps) {
  const carousel = useCarousel(options);
  return (
    <CarouselContext.Provider value={carousel}>
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label={label}
        tabIndex={0}
        className={`carousel ${className}`}
        onKeyDown={(event) => {
          carousel.handleKeyDown(event);
          onKeyDown?.(event);
        }}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}
export function CarouselContent({
  viewportClassName = '',
  className = '',
  children,
  ...props
}: CarouselContentProps) {
  const { viewportRef } = useCarouselContext();
  return (
    <div className={`carousel-viewport ${viewportClassName}`} ref={viewportRef}>
      <div className={`carousel-track ${className}`} {...props}>
        {children}
      </div>
    </div>
  );
}
export function CarouselItem({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={`carousel-slide ${className}`}
      {...props}
    />
  );
}
export function CarouselDots({ className = '' }: { className?: string }) {
  const { selected, snaps, scrollTo } = useCarouselContext();
  return (
    <div className={`carousel-dots ${className}`} role="group" aria-label="Selecionar destaque">
      {snaps.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Ir para destaque ${index + 1}`}
          aria-current={selected === index ? 'true' : undefined}
          onClick={() => scrollTo(index)}
        >
          <span />
        </button>
      ))}
    </div>
  );
}
export function CarouselControls({ className = '' }: { className?: string }) {
  const { canPrevious, canNext, previous, next } = useCarouselContext();
  return (
    <div className={`carousel-controls ${className}`}>
      <button
        type="button"
        aria-label="Destaque anterior"
        onClick={previous}
        disabled={!canPrevious}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <CarouselDots />
      <button type="button" aria-label="Próximo destaque" onClick={next} disabled={!canNext}>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
export { useCarouselContext } from './useCarousel';
