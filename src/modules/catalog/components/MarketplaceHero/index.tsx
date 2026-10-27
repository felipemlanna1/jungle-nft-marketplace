import { Carousel, CarouselContent, CarouselDots } from '../../../../styleguide';
import { marketplaceHeroSlides } from './content';
import { HeroSlide } from './components/HeroSlide';
import { HeroBackdrop } from './components/HeroBackdrop';

export function MarketplaceHero() {
  return (
    <section className="hero page-shell kurio-hero" aria-labelledby="hero-title">
      <HeroBackdrop />
      <Carousel
        label="Destaques do marketplace"
        options={{ loop: true }}
        className="kurio-hero-carousel"
      >
        <CarouselContent viewportClassName="kurio-hero-viewport" className="kurio-hero-track">
          {marketplaceHeroSlides.map((slide, index) => (
            <HeroSlide key={slide.id} slide={slide} index={index} />
          ))}
        </CarouselContent>
        <CarouselDots className="kurio-hero-carousel-dots" />
      </Carousel>
    </section>
  );
}
