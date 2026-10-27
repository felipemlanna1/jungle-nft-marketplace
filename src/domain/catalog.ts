import type { Catalog, CatalogSearch, NFT } from '../contracts';
import { toWei } from './money';

export const catalogCategories = [
  { value: 'Art', label: 'Arte digital' },
  { value: 'Photography', label: 'Fotografia' },
  { value: 'Music', label: 'Música' },
  { value: '3D', label: 'Arte 3D' },
  { value: 'Collectibles', label: 'Colecionáveis' },
  { value: 'Generative', label: 'Generativa' },
  { value: 'Gaming', label: 'Jogos' },
  { value: 'Memberships', label: 'Assinaturas' },
  { value: 'Utility', label: 'Utilidade' },
] as const;

export function catalogFacets(nfts: readonly NFT[]): Catalog['facets'] {
  const facets: Catalog['facets'] = { categories: {}, networks: {} };
  for (const nft of nfts) {
    facets.categories[nft.category] = (facets.categories[nft.category] ?? 0) + 1;
    facets.networks[nft.network] = (facets.networks[nft.network] ?? 0) + 1;
  }
  return facets;
}

/** New releases use the collection's reference date so a deterministic demo does not expire. */
export function filterCatalog(nfts: readonly NFT[], search: CatalogSearch): NFT[] {
  const minimum = search.minPrice === undefined ? undefined : toWei(search.minPrice);
  const maximum = search.maxPrice === undefined ? undefined : toWei(search.maxPrice);
  if (minimum !== undefined && maximum !== undefined && minimum > maximum)
    throw new Error('The minimum price cannot exceed the maximum price.');
  const latestRelease = Math.max(0, ...nfts.map((nft) => nft.releasedAt));
  const releaseThreshold = latestRelease - 30 * 24 * 60 * 60_000;
  const q = search.q?.trim().toLowerCase();
  const category = search.category?.toLowerCase();
  const items = nfts.filter((nft) => {
    const price = toWei(nft.price);
    return (
      (!q || `${nft.title} ${nft.creator}`.toLowerCase().includes(q)) &&
      (!category || category === 'all' || nft.category.toLowerCase() === category) &&
      (!search.network || nft.network === search.network) &&
      (minimum === undefined || price >= minimum) &&
      (maximum === undefined || price <= maximum) &&
      (search.tab !== 'new' || nft.releasedAt >= releaseThreshold) &&
      (search.tab !== 'trending' || nft.popularity >= 70)
    );
  });
  return items.sort((left, right) => {
    if (search.sort === 'price-asc' || search.sort === 'price-desc') {
      const leftPrice = toWei(left.price);
      const rightPrice = toWei(right.price);
      const result = leftPrice < rightPrice ? -1 : leftPrice > rightPrice ? 1 : 0;
      return search.sort === 'price-asc' ? result : -result;
    }
    if (search.tab === 'trending' && left.popularity !== right.popularity)
      return right.popularity - left.popularity;
    return right.releasedAt - left.releasedAt || left.id.localeCompare(right.id);
  });
}
