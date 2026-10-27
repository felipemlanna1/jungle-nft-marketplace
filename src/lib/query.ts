import { QueryClient } from '@tanstack/react-query';
import type { CatalogSearch } from '../contracts';
export const keys = {
  catalog: (search: CatalogSearch = {}) => ['catalog', search] as const,
  nft: (id: string) => ['nft', id] as const,
  session: ['session'] as const,
  favorites: (userId?: string) => ['favorites', userId ?? 'guest'] as const,
  cart: (userId?: string) => ['cart', userId ?? 'guest'] as const,
  quote: (userId?: string, coupon = '') => ['quote', userId ?? 'guest', coupon] as const,
  profile: (userId?: string) => ['profile', userId ?? 'guest'] as const,
  wallets: (userId?: string) => ['wallets', userId ?? 'guest'] as const,
  order: (id: string, userId?: string) => ['order', userId ?? 'guest', id] as const,
};
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      retry: (count, error) => {
        const status = (error as { response?: { status?: number } }).response?.status;
        return count < 1 && (!status || status >= 500);
      },
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});
/** Run on login/logout, including expired sessions, before fetching private data. */
export async function clearPrivateCache() {
  await queryClient.cancelQueries();
  queryClient.removeQueries({
    predicate: (query) => !['catalog', 'nft', 'session'].includes(String(query.queryKey[0])),
  });
}
