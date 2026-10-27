import { useQueries, useQuery } from '@tanstack/react-query';
import { useSession } from '../../../account/hooks/useAccount';
import { market } from '../../../../services/marketplace';

export function useFavoritesList() {
  const session = useSession();
  const ownerId = session.data?.id;
  const favorites = useQuery({
    queryKey: ['favorites', ownerId],
    queryFn: market.favorites,
    enabled: !!ownerId,
  });
  const details = useQueries({
    queries: (favorites.data ?? []).map((id) => ({
      queryKey: ['favorite-nft', ownerId, id],
      queryFn: ({ signal }: { signal: AbortSignal }) => market.nft(id, signal),
      enabled: !!ownerId,
    })),
  });
  const items = details.flatMap((query) => (query.data ? [query.data] : []));
  const isPending =
    session.isPending ||
    (!!ownerId && (favorites.isPending || details.some((query) => query.isPending)));
  const error = favorites.error ?? details.find((query) => query.error)?.error;
  const retry = () => {
    void favorites.refetch();
    for (const detail of details) if (detail.isError) void detail.refetch();
  };
  return { user: session.data, items, isPending, error, retry };
}
