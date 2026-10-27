import { Button, Skeleton } from '../../../../../../styleguide';
import { responsiveArtwork } from '../../../../../../assets/figma/responsiveArtwork';
import type { ArticleReaderProps } from '../../shared-types';
import { formatEditorialDate } from '../../format';
import { useArticleReader } from './useArticleReader';

export function ArticleReader({ id }: ArticleReaderProps) {
  const article = useArticleReader(id);
  return (
    <article className="article-reader" aria-busy={article.isPending}>
      {article.isPending ? (
        <>
          <p role="status">Carregando leitura…</p>
          <Skeleton className="article-reader-image" />
        </>
      ) : article.isError ? (
        <div className="editorial-error" role="alert">
          <p>Não foi possível carregar esta leitura.</p>
          <Button variant="secondary" onClick={() => article.refetch()}>
            Tentar leitura novamente
          </Button>
        </div>
      ) : (
        <>
          <img
            className="article-reader-image"
            src={article.data.image}
            {...responsiveArtwork(
              article.data.image,
              '(max-width: 767px) calc(100vw - 80px), 672px',
            )}
            width="672"
            height="260"
            alt=""
          />
          <p className="editorial-meta">
            <time dateTime={article.data.publishedAt}>
              {formatEditorialDate(article.data.publishedAt)}
            </time>
            {`  |  Leitura de ${article.data.readMinutes} min`}
          </p>
          <div className="article-reader-paragraphs">
            {article.data.paragraphs.map((paragraph, index) => (
              <p key={`${id}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
