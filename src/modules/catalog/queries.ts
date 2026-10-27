import { queryOptions } from '@tanstack/react-query';
import type { CatalogSearch } from '../../contracts';
import { keys } from '../../lib/query';
import { market } from '../../services/marketplace';

export const catalogQueryOptions = (search: CatalogSearch) =>
  queryOptions({
    queryKey: keys.catalog(search),
    queryFn: ({ signal }) => market.catalog(search, signal),
    staleTime: 30_000,
  });

export const nftQueryOptions = (id: string) =>
  queryOptions({
    queryKey: keys.nft(id),
    queryFn: ({ signal }) => market.nft(id, signal),
    staleTime: 20_000,
    retry: false,
  });
