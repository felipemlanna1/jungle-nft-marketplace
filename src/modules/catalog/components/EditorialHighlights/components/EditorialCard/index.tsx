import { ArrowRight } from 'lucide-react';
import { Button } from '../../../../../../styleguide';
import { responsiveArtwork } from '../../../../../../assets/figma/responsiveArtwork';
import type { EditorialCardProps } from '../../shared-types';
import { formatEditorialDate } from '../../format';

export function EditorialCard({ article, onRead }: EditorialCardProps) {
  return (
    <article className="editorial-card">
      <img
        className="editorial-card-image"
        src={article.image}
        {...responsiveArtwork(article.image, '(max-width: 767px) calc(100vw - 48px), 268px')}
        alt=""
        width="268"
        height="195"
        loading="lazy"
        decoding="async"
      />
      <div className="editorial-card-copy">
        <p className="editorial-meta">
          <time dateTime={article.publishedAt}>{formatEditorialDate(article.publishedAt)}</time>
          {`  |  Leitura de ${article.readMinutes} min`}
        </p>
        <h3>{article.title}</h3>
        <p className="editorial-excerpt">{article.excerpt}</p>
        <Button
          variant="ghost"
          className="editorial-read-button"
          aria-label={`Ler mais: ${article.title}`}
          onClick={() => onRead(article)}
        >
          Ler mais <ArrowRight size={12} aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
