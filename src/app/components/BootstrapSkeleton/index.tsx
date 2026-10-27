import { Skeleton } from '../../../styleguide/components/Skeleton';
import { CatalogSkeleton } from '../../../modules/catalog/components/CatalogSkeleton';
import { NftDetailsSkeleton } from '../../../modules/catalog/components/NftDetailsSkeleton';
import { GenericPageSkeleton } from '../GenericPageSkeleton';
import './styles.css';

export function BootstrapSkeleton({ pathname }: { pathname: string }) {
  const detail = pathname.startsWith('/nft/');
  const catalog = ['/', '/login', '/register'].includes(pathname);
  return (
    <>
      <header className="site-header" aria-hidden="true">
        <div className="header-inner bootstrap-header">
          <span className="bootstrap-brand">kurio</span>
          <Skeleton className="bootstrap-navigation" />
        </div>
      </header>
      <main id="main-content" aria-busy="true" aria-label="Carregando demonstração">
        <div className="bootstrap-status" role="status">
          <strong>kurio</strong>
          <span>Carregando a demonstração…</span>
        </div>
        {detail ? (
          <NftDetailsSkeleton />
        ) : catalog ? (
          <>
            <div className="mobile-catalog-tools page-shell" aria-hidden="true">
              <Skeleton className="bootstrap-search" />
              <Skeleton className="bootstrap-filter" />
            </div>
            <div className="hero page-shell kurio-hero bootstrap-hero" aria-hidden="true">
              <div className="hero-copy">
                <Skeleton className="text-skeleton short" />
                <Skeleton className="bootstrap-heading" />
                <Skeleton className="text-skeleton" />
              </div>
              <Skeleton className="bootstrap-art" />
            </div>
            <section className="marketplace-section page-shell" aria-label="Carregando catálogo">
              <div className="catalog-layout">
                <aside className="catalog-sidebar" aria-hidden="true">
                  <Skeleton className="bootstrap-sidebar" />
                </aside>
                <div className="catalog-content">
                  <div className="catalog-toolbar" aria-hidden="true">
                    <Skeleton className="bootstrap-tabs" />
                  </div>
                  <CatalogSkeleton />
                </div>
              </div>
            </section>
          </>
        ) : (
          <GenericPageSkeleton />
        )}
      </main>
    </>
  );
}
