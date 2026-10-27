import { Skeleton } from '../../../../styleguide/components/Skeleton';
export function CatalogSkeleton() {
  return (
    <div className="nft-grid" role="status" aria-label="Carregando coleção">
      {Array.from({ length: 9 }, (_, i) => (
        <div className="nft-card skeleton-card" key={i}>
          <Skeleton className="art-skeleton" />
          <div className="nft-card-copy">
            <Skeleton className="text-skeleton" />
            <Skeleton className="text-skeleton short" />
          </div>
        </div>
      ))}
    </div>
  );
}
