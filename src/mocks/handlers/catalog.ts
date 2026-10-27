import { http } from 'msw';
import type { CatalogSearch } from '../../contracts';
import { catalogFacets, filterCatalog } from '../../domain/catalog';
import { ApiError, database, nftById } from '../database';
import { route, json, idParam } from './network';

export const catalogHandlers = [
  http.get(
    '/api/nfts',
    route(({ request }) => {
      const db = database();
      const url = new URL(request.url);
      const search: CatalogSearch = {
        q: url.searchParams.get('q') ?? undefined,
        category: url.searchParams.get('category') ?? undefined,
        sort: (url.searchParams.get('sort') ?? 'newest') as CatalogSearch['sort'],
        minPrice: url.searchParams.get('minPrice') ?? undefined,
        maxPrice: url.searchParams.get('maxPrice') ?? undefined,
        network: (url.searchParams.get('network') ?? undefined) as CatalogSearch['network'],
        tab: (url.searchParams.get('tab') ?? 'all') as CatalogSearch['tab'],
      };
      if (search.network && !['Ethereum', 'Polygon', 'Solana'].includes(search.network))
        throw new ApiError('Choose a supported catalogue network.');
      if (!['all', 'new', 'trending'].includes(search.tab ?? 'all'))
        throw new ApiError('Choose a supported catalogue tab.');
      for (const value of [search.minPrice, search.maxPrice])
        if (value !== undefined && !/^(0|[1-9]\d{0,31})(\.\d{1,18})?$/.test(value))
          throw new ApiError('Use a nonnegative ETH decimal with at most 18 decimal places.');
      const page = Math.max(
        1,
        Math.min(100, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1),
      );
      const dataset = db.scenario === 'empty' ? [] : db.nfts;
      let items;
      try {
        items = filterCatalog(dataset, search);
      } catch {
        throw new ApiError('The minimum price cannot exceed the maximum price.');
      }
      return json({
        items: items.slice((page - 1) * 9, page * 9),
        total: items.length,
        page,
        pageSize: 9,
        facets: catalogFacets(dataset),
      });
    }),
  ),
  http.get(
    '/api/nfts/:id',
    route(({ params }) => json(nftById(database(), idParam(params)))),
  ),
];
