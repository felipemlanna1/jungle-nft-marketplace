import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button, CarouselItem } from '../../../../../../styleguide';
import { criticalMedia } from '../../../../../../assets/critical-media';
import type { MarketplaceHeroSlideProps } from '../../../../shared-types';
import { useMarketplaceHero } from '../../useMarketplaceHero';

export function HeroSlide({ slide, index }: MarketplaceHeroSlideProps) {
  const { active, initial, artwork, thumbnailArtwork } = useMarketplaceHero({ slide, index });
  return (
    <CarouselItem
      className={`kurio-hero-slide ${initial ? '' : 'kurio-hero-slide-secondary'}`}
      inert={!active}
      aria-hidden={!active}
      aria-label={`${index + 1} de 3`}
    >
      <div className="hero-copy">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h1 id={active ? 'hero-title' : undefined}>
          <span className="kurio-desktop-copy">
            {slide.desktopTitle[0]}
            <br />
            {slide.desktopTitle[1]}
          </span>
          <span className="kurio-mobile-copy">
            {slide.mobileTitle[0]}
            <br />
            {slide.mobileTitle[1]}
          </span>
        </h1>
        <p className="hero-description kurio-desktop-copy">{slide.desktopDescription}</p>
        <p className="hero-description kurio-mobile-copy">{slide.mobileDescription}</p>
        <Button asChild>
          {slide.target.kind === 'catalog' ? (
            <a className="kurio-explore" href="#marketplace">
              EXPLORAR <ArrowRight className="kurio-mobile-copy" size={16} aria-hidden="true" />
            </a>
          ) : (
            <Link className="kurio-explore" to="/nft/$id" params={{ id: slide.target.id }}>
              EXPLORAR <ArrowRight className="kurio-mobile-copy" size={16} aria-hidden="true" />
            </Link>
          )}
        </Button>
        <div className="kurio-hero-control-space" aria-hidden="true" />
      </div>
      <div className="hero-art">
        <picture>
          {initial && (
            <source
              media="(max-width: 767px)"
              srcSet={criticalMedia.kurioHeroMobileSrcSet}
              sizes={criticalMedia.kurioHeroMobileSizes}
            />
          )}
          <img
            src={slide.image}
            {...(!initial ? artwork : undefined)}
            width="450"
            height="450"
            draggable={false}
            alt={slide.imageAlt}
            loading={initial ? 'eager' : 'lazy'}
            fetchPriority={initial ? 'high' : 'low'}
          />
        </picture>
        {slide.thumbnail && (
          <img
            className="kurio-hero-thumbnail kurio-mobile-art"
            src={slide.thumbnail}
            {...thumbnailArtwork}
            width="58"
            height="58"
            alt=""
            draggable={false}
            loading="lazy"
            fetchPriority="low"
          />
        )}
      </div>
    </CarouselItem>
  );
}
