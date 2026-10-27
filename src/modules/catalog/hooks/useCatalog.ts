import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../services/marketplace';
import type { CatalogSearch, User } from '../../../contracts';
export function useCatalog(search: CatalogSearch) {
  return useQuery({
    queryKey: ['catalog', search],
    queryFn: ({ signal }) => market.catalog(search, signal),
    staleTime: 30_000,
  });
}
export function useFavorite(user: User | null | undefined) {
  const client = useQueryClient();
  const key = ['favorites', user?.id];
  const favorites = useQuery({
    queryKey: key,
    queryFn: market.favorites,
    enabled: !!user,
  });
  const mutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      market.toggleFavorite(id, active),
    onMutate: async ({ id, active }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<string[]>(key);
      client.setQueryData<string[]>(key, (old = []) =>
        active ? [...new Set([...old, id])] : old.filter((item) => item !== id),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) client.setQueryData(key, context.previous ?? []);
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
  return { favorites: favorites.data ?? [], mutation };
}
