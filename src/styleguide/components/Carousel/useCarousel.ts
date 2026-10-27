import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type KeyboardEvent,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { CarouselContextValue, CarouselOptions } from './shared-types';

export const CarouselContext = createContext<CarouselContextValue | null>(null);
export function useCarouselContext() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('Carousel components require a Carousel parent.');
  return context;
}
export function useCarousel(options?: CarouselOptions): CarouselContextValue {
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [viewportRef, api] = useEmblaCarousel({
    align: 'start',
    ...options,
    duration: reducedMotion ? 0 : (options?.duration ?? 25),
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setSnaps(api.scrollSnapList());
      setCanPrevious(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    sync();
    api.on('select', sync).on('reInit', sync);
    return () => {
      api.off('select', sync).off('reInit', sync);
    };
  }, [api]);
  const previous = useCallback(() => api?.scrollPrev(reducedMotion), [api, reducedMotion]);
  const next = useCallback(() => api?.scrollNext(reducedMotion), [api, reducedMotion]);
  const scrollTo = useCallback(
    (index: number) => api?.scrollTo(index, reducedMotion),
    [api, reducedMotion],
  );
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]'))
      return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
    if (event.key === 'Home') {
      event.preventDefault();
      scrollTo(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      scrollTo(snaps.length - 1);
    }
  };
  return {
    viewportRef,
    selected,
    snaps,
    canPrevious,
    canNext,
    previous,
    next,
    scrollTo,
    handleKeyDown,
  };
}
