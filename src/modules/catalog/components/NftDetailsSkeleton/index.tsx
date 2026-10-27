import { Skeleton } from '../../../../styleguide/components/Skeleton';

export function NftDetailsSkeleton() {
  return (
    <section
      className="page-shell detail-page commerce-page detail-loading"
      aria-label="Carregando obra"
      role="status"
    >
      <div className="detail-mobile-toolbar">
        <Skeleton className="detail-toolbar-skeleton" />
        <Skeleton className="detail-toolbar-skeleton" />
      </div>
      <div className="breadcrumbs">
        <Skeleton className="detail-breadcrumb-skeleton" />
      </div>
      <div className="detail-grid">
        <Skeleton className="detail-gallery-skeleton" />
        <div className="detail-copy detail-copy-skeleton">
          <Skeleton className="detail-heading-skeleton" />
          <Skeleton className="detail-description-skeleton" />
          <Skeleton className="detail-editions-skeleton" />
          <Skeleton className="detail-properties-skeleton" />
        </div>
      </div>
      <div className="nft-content-tabs">
        <Skeleton className="text-skeleton" />
        <Skeleton className="detail-description-skeleton" />
      </div>
      <div className="related-nfts">
        <Skeleton className="detail-heading-skeleton" />
        <div className="related-nfts-grid">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="related-nft-skeleton" />
          ))}
        </div>
      </div>
    </section>
  );
}
