import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import type useEmblaCarousel from 'embla-carousel-react';

export type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;
export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  options?: CarouselOptions;
  children: ReactNode;
}
export interface CarouselContentProps extends HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
}
export interface CarouselContextValue {
  viewportRef: ReturnType<typeof useEmblaCarousel>[0];
  selected: number;
  snaps: number[];
  canPrevious: boolean;
  canNext: boolean;
  previous: () => void;
  next: () => void;
  scrollTo: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}
