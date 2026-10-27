import { Skeleton } from '../../../../../../styleguide';
export function EditorialSkeleton() {
  return (
    <div className="editorial-grid" aria-busy="true" aria-label="Carregando Diário da Cunhagem">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="editorial-card" key={index} aria-hidden="true">
          <Skeleton className="editorial-card-image" />
          <div className="editorial-card-copy editorial-skeleton-copy">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      ))}
    </div>
  );
}
