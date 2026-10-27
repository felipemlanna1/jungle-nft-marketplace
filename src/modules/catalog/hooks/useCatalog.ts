import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../services/marketplace';
import type { CatalogSearch, User } from '../../../contracts';
import type { FavoriteChange, FavoriteContext } from '../shared-types';
import { catalogQueryOptions } from '../queries';
export function useCatalog(search: CatalogSearch) {
  return useQuery(catalogQueryOptions(search));
}
export function useFavorite(user: User | null | undefined) {
  const client = useQueryClient();
  const key = ['favorites', user?.id] as const;
  const ownsSession = (ownerId: string) =>
    client.getQueryData<User | null>(['session'])?.id === ownerId;
  const favorites = useQuery({
    queryKey: key,
    queryFn: market.favorites,
    enabled: !!user,
  });
  const mutation = useMutation<string[], Error, FavoriteChange, FavoriteContext>({
    mutationKey: ['favorite-change', user?.id],
    mutationFn: ({ id, active, ownerId }) => {
      if (!ownsSession(ownerId))
        throw new Error('A sessão mudou. Entre novamente para alterar favoritos.');
      return market.toggleFavorite(id, active);
    },
    onMutate: async ({ id, active, ownerId }) => {
      const operationKey = ['favorites', ownerId] as const;
      if (!ownsSession(ownerId)) throw new Error('A sessão mudou. Tente novamente.');
      await client.cancelQueries({ queryKey: operationKey });
      if (!ownsSession(ownerId)) throw new Error('A sessão mudou. Tente novamente.');
      const previous = client.getQueryData<string[]>(operationKey);
      client.setQueryData<string[]>(operationKey, (old = []) =>
        active ? [...new Set([...old, id])] : old.filter((item) => item !== id),
      );
      return { ownerId, key: operationKey, previous };
    },
    onError: (_error, _variables, context) => {
      if (context && ownsSession(context.ownerId))
        client.setQueryData(context.key, context.previous ?? []);
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context && ownsSession(context.ownerId))
        return client.invalidateQueries({ queryKey: context.key });
    },
  });
  return { favorites: favorites.data ?? [], mutation };
}
