import { lazy, Suspense } from 'react';
import { Button, Modal } from '../../../../styleguide';
import { useEditorialHighlights } from './useEditorialHighlights';
import { EditorialCard } from './components/EditorialCard';
import { EditorialSkeleton } from './components/EditorialSkeleton';
const ArticleReader = lazy(() =>
  import('./components/ArticleReader').then((module) => ({ default: module.ArticleReader })),
);

export function EditorialHighlights() {
  const { articles, selected, openArticle, onOpenChange } = useEditorialHighlights();
  return (
    <section className="editorial-highlights page-shell" aria-labelledby="editorial-title">
      <header className="editorial-heading">
        <h2 id="editorial-title">Diário da Cunhagem</h2>
        <p>
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </header>
      {articles.isPending ? (
        <EditorialSkeleton />
      ) : articles.isError ? (
        <div className="editorial-error" role="alert">
          <p>Não foi possível carregar o Diário da Cunhagem.</p>
          <Button variant="secondary" onClick={() => articles.refetch()}>
            Tentar carregar o diário
          </Button>
        </div>
      ) : !articles.data.length ? (
        <p className="muted">Nenhuma leitura disponível no momento.</p>
      ) : (
        <div className="editorial-grid">
          {articles.data.map((article) => (
            <EditorialCard key={article.id} article={article} onRead={openArticle} />
          ))}
        </div>
      )}
      <Modal
        open={!!selected}
        onOpenChange={onOpenChange}
        title={selected?.title ?? 'Diário da Cunhagem'}
        description="Leitura ilustrativa do protótipo. Textos, datas e tempos são simulados; não representam uma publicação ou pesquisa real."
      >
        {selected && (
          <Suspense
            fallback={
              <div className="article-reader">
                <p role="status">Abrindo leitura…</p>
              </div>
            }
          >
            <ArticleReader id={selected.id} />
          </Suspense>
        )}
      </Modal>
    </section>
  );
}
