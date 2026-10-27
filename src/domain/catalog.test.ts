import { describe, expect, it } from 'vitest';
import type { NFT } from '../contracts';
import { catalogFacets, filterCatalog } from './catalog';

const reference = Date.UTC(2026, 9, 27);
const day = 86_400_000;
function artwork(id: string, changes: Partial<NFT> = {}): NFT {
  return {
    id,
    title: `Artwork ${id}`,
    creator: 'Demo Artist',
    collection: 'Demo collection',
    category: 'Art',
    network: 'Ethereum',
    releasedAt: reference,
    popularity: 50,
    image: '/art/demo.webp',
    price: '0.1',
    available: 3,
    version: 1,
    ...changes,
  };
}
describe('combinable catalogue filters', () => {
  it('combines search, category, network, price and release criteria', () => {
    const catalogue = [
      artwork('match', { title: 'Emerald morning', price: '0.2' }),
      artwork('wrong-network', { title: 'Emerald evening', network: 'Polygon' }),
      artwork('old', { title: 'Emerald night', releasedAt: reference - 40 * day }),
      artwork('wrong-category', { title: 'Emerald mist', category: 'Photography' }),
      artwork('expensive', { title: 'Emerald sky', price: '1' }),
    ];
    const result = filterCatalog(catalogue, {
      q: 'emerald',
      category: 'Art',
      network: 'Ethereum',
      minPrice: '0.1',
      maxPrice: '0.2',
      tab: 'new',
    });
    expect(result.map((nft) => nft.id)).toEqual(['match']);
    expect(catalogue).toHaveLength(5);
  });
  it('compares all 18 ETH decimal places exactly at inclusive boundaries', () => {
    const low = artwork('low', { price: '0.100000000000000001' });
    const high = artwork('high', { price: '0.100000000000000002' });
    expect(
      filterCatalog([low, high], {
        minPrice: '0.100000000000000002',
        maxPrice: '0.100000000000000002',
      }).map((nft) => nft.id),
    ).toEqual(['high']);
  });
  it('uses actual trend metadata and respects explicit price ordering', () => {
    const nfts = [
      artwork('quiet', { popularity: 69 }),
      artwork('popular', { popularity: 80, price: '0.1' }),
      artwork('leading', { popularity: 95, price: '0.2' }),
    ];
    expect(filterCatalog(nfts, { tab: 'trending' }).map((nft) => nft.id)).toEqual([
      'leading',
      'popular',
    ]);
    expect(
      filterCatalog(nfts, { tab: 'trending', sort: 'price-asc' }).map((nft) => nft.id),
    ).toEqual(['popular', 'leading']);
  });
  it('returns an honest empty result for a network without inventory', () => {
    expect(filterCatalog([artwork('one')], { network: 'Solana' })).toEqual([]);
  });
  it('rejects an inverted price interval instead of silently changing user intent', () => {
    expect(() => filterCatalog([], { minPrice: '2', maxPrice: '1' })).toThrow(/minimum/);
  });
  it('computes global facet counts from the actual dataset', () => {
    expect(
      catalogFacets([
        artwork('one'),
        artwork('two', { category: 'Music', network: 'Polygon' }),
        artwork('three', { category: 'Music' }),
      ]),
    ).toEqual({ categories: { Art: 1, Music: 2 }, networks: { Ethereum: 2, Polygon: 1 } });
  });
});
