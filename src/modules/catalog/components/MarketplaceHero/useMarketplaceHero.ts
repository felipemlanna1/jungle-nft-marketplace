import { useCarouselContext } from '../../../../styleguide';
import { responsiveArtwork } from '../../../../assets/figma/responsiveArtwork';
import type { MarketplaceHeroSlideProps } from '../../shared-types';

export function useMarketplaceHero({ slide, index }: MarketplaceHeroSlideProps) {
  const { selected } = useCarouselContext();
  return {
    active: selected === index,
    initial: index === 0,
    artwork: responsiveArtwork(
      slide.image,
      '(max-width: 374px) 108px, (max-width: 767px) 138px, 450px',
    ),
    thumbnailArtwork: slide.thumbnail ? responsiveArtwork(slide.thumbnail, '58px') : undefined,
  };
}
