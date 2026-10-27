import { Link } from '@tanstack/react-router';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselControls,
  Notice,
  Skeleton,
} from '../../../../styleguide';
import { errorMessage } from '../../../../services/marketplace';
import { useRelatedNfts } from './useRelatedNfts';
import { responsiveArtwork } from '../../../../assets/figma/responsiveArtwork';

export function RelatedNfts({
  title,
  excludeIds = [],
}: {
  title: string;
  excludeIds?: readonly string[];
}) {
  const { criterionId, criterionLabel, items, isPending, error, retry } =
    useRelatedNfts(excludeIds);
  return (
    <section className="related-nfts">
      <h2>{title}</h2>
      {criterionLabel && (
        <p className="sr-only" id={criterionId}>
          {criterionLabel}
        </p>
      )}
      {isPending ? (
        <div className="related-nfts-grid">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="related-nft-skeleton" />
          ))}
        </div>
      ) : error ? (
        <Notice tone="error">
          {errorMessage(error)}{' '}
          <button type="button" className="text-link" onClick={retry}>
            Tentar novamente
          </button>
        </Notice>
      ) : !items.length ? (
        <p>Nenhuma obra relacionada disponível.</p>
      ) : (
        <Carousel
          label={title}
          className="related-carousel"
          aria-describedby={criterionLabel ? criterionId : undefined}
          options={{ slidesToScroll: 'auto', containScroll: 'trimSnaps' }}
        >
          <CarouselContent className="related-nfts-grid">
            {items.map((item, index) => (
              <CarouselItem key={item.id} aria-label={`${index + 1} de ${items.length}`}>
                <article>
                  <Link
                    to="/nft/$id"
                    params={{ id: item.id }}
                    aria-label={`Ver ${item.title}`}
                    draggable={false}
                  >
                    <img
                      src={item.image}
                      {...responsiveArtwork(item.image, '(max-width: 767px) 174px, 220px')}
                      alt={item.title}
                      draggable={false}
                      width="220"
                      height="232"
                      loading="lazy"
                    />
                  </Link>
                  <Link to="/nft/$id" params={{ id: item.id }}>
                    {item.title}
                  </Link>
                  <strong>{item.price} ETH</strong>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselControls />
        </Carousel>
      )}
    </section>
  );
}
