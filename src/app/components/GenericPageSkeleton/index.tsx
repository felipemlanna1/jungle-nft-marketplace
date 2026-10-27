import { Skeleton } from '../../../styleguide/components/Skeleton';

export function GenericPageSkeleton() {
  return (
    <section
      className="page-shell stack"
      aria-busy="true"
      role="status"
      aria-label="Carregando página"
    >
      <Skeleton className="text-skeleton" />
      <Skeleton className="art-skeleton" />
    </section>
  );
}
