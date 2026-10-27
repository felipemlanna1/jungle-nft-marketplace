// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Catalog, CatalogSearch } from '../../contracts';
import { createNfts } from '../../mocks/fixtures';
import { queryClient, keys } from '../../lib/query';
import { catalogQueryOptions, nftQueryOptions } from '../../modules/catalog/queries';
import { detailArtworkSizes } from '../../assets/figma/responsiveArtwork';
import { prefetchPublicRoute } from './preload';

const api = vi.hoisted(() => ({ catalog: vi.fn(), nft: vi.fn() }));
vi.mock('../../services/marketplace', () => ({ market: api }));
const nfts = createNfts();
const result: Catalog = {
  items: [nfts[0], nfts[1], nfts[2], nfts[6]],
  total: 4,
  page: 2,
  pageSize: 9,
  facets: { categories: { Art: 4 }, networks: { Ethereum: 4 } },
};
beforeEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
  document.head.querySelectorAll('link[rel="preload"]').forEach((link) => link.remove());
  api.catalog.mockResolvedValue(result);
  api.nft.mockResolvedValue(nfts[0]);
});
afterEach(() => queryClient.clear());

describe('public route prefetch through the shared query contract', () => {
  it('shares a pending catalogue request with the UI and hints only returned artwork', async () => {
    let complete!: (value: Catalog) => void;
    api.catalog.mockReturnValueOnce(
      new Promise<Catalog>((resolve) => {
        complete = resolve;
      }),
    );
    const expected: CatalogSearch = {
      q: 'Neon',
      category: 'all',
      sort: 'newest',
      page: 2,
      tab: 'all',
      network: 'Polygon',
    };
    const prefetch = prefetchPublicRoute({
      pathname: '/',
      search: '?q=Neon&page=2&network=Polygon',
    });
    const ui = queryClient.fetchQuery(catalogQueryOptions(expected));
    expect(api.catalog).toHaveBeenCalledTimes(1);
    expect(api.catalog).toHaveBeenCalledWith(expected, expect.any(AbortSignal));
    complete(result);
    await Promise.all([prefetch, ui]);
    const links = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]')];
    expect(links.map((link) => new URL(link.href).pathname)).toEqual(
      result.items.map((item) => item.image),
    );
    expect(
      links.every((link) => link.imageSizes === '(max-width: 767px) calc(50vw - 33px), 258px'),
    ).toBe(true);
    expect(api.nft).not.toHaveBeenCalled();
  });
  it('decodes the public NFT id, shares its cache and deduplicates matching responsive hints', async () => {
    await prefetchPublicRoute({ pathname: '/nft/nft%2D1', search: '' });
    await queryClient.fetchQuery(nftQueryOptions('nft-1'));
    await prefetchPublicRoute({ pathname: '/nft/nft%2D1', search: '' });
    expect(api.nft).toHaveBeenCalledTimes(1);
    expect(api.nft).toHaveBeenCalledWith('nft-1', expect.any(AbortSignal));
    const links = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]')];
    expect(links).toHaveLength(1);
    expect(links[0].imageSizes).toBe(detailArtworkSizes);
    expect(queryClient.getQueryData(keys.nft('nft-1'))).toEqual(nfts[0]);
  });
  it('does not prefetch sessions, private routes or malformed encoded identifiers', async () => {
    for (const pathname of [
      '/checkout',
      '/profile',
      '/wallets',
      '/login',
      '/orders/order-1',
      '/nft/%E0%A4%A',
    ])
      await prefetchPublicRoute({ pathname, search: '' });
    expect(api.catalog).not.toHaveBeenCalled();
    expect(api.nft).not.toHaveBeenCalled();
    expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0);
  });
  it('keeps failed public requests in Query for the error UI instead of inventing data', async () => {
    const error = new Error('Fixture not found');
    api.nft.mockRejectedValueOnce(error);
    await expect(
      prefetchPublicRoute({ pathname: '/nft/missing', search: '' }),
    ).resolves.toBeUndefined();
    expect(queryClient.getQueryState(keys.nft('missing'))?.error).toBe(error);
    expect(queryClient.getQueryData(keys.nft('missing'))).toBeUndefined();
    expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0);
  });
  it('uses the router JSON search parsing and preserves an empty response without image hints', async () => {
    api.catalog.mockResolvedValueOnce({ ...result, items: [], total: 0 });
    await prefetchPublicRoute({
      pathname: '/',
      search: '?q=%22true%22&minPrice=%220.28%22&sort=price-asc',
    });
    expect(api.catalog.mock.calls[0][0]).toEqual({
      q: 'true',
      minPrice: '0.28',
      category: 'all',
      sort: 'price-asc',
      page: 1,
      tab: 'all',
    });
    expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0);
  });
});
