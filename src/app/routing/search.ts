import type { CatalogSearch } from '../../contracts';
import { safeRedirect } from '../../lib/returnTo';
import type { AuthSearch } from '../../modules/account/shared-types';

const categories = new Set([
  'all',
  'Art',
  'Abstract',
  'Photography',
  'Music',
  '3D',
  'Collectibles',
  'Generative',
  'Gaming',
  'Memberships',
  'Utility',
]);
const decimalPrice = /^(?:0|[1-9]\d{0,31})(?:\.\d{1,18})?$/;
function price(value: unknown): string | undefined {
  return typeof value === 'string' && decimalPrice.test(value) ? value : undefined;
}
export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const page = Number(raw.page);
  return {
    q: typeof raw.q === 'string' ? raw.q.slice(0, 100) : '',
    category:
      typeof raw.category === 'string' && categories.has(raw.category) ? raw.category : 'all',
    sort: raw.sort === 'price-asc' || raw.sort === 'price-desc' ? raw.sort : 'newest',
    page: Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1),
    tab: raw.tab === 'new' || raw.tab === 'trending' ? raw.tab : 'all',
    ...(price(raw.minPrice) !== undefined ? { minPrice: price(raw.minPrice) } : {}),
    ...(price(raw.maxPrice) !== undefined ? { maxPrice: price(raw.maxPrice) } : {}),
    ...(raw.network === 'Ethereum' || raw.network === 'Polygon' || raw.network === 'Solana'
      ? { network: raw.network }
      : {}),
  };
}
export function validateRedirectSearch(raw: Record<string, unknown>): AuthSearch {
  return {
    redirect: safeRedirect(raw.redirect),
    ...(typeof raw.favorite === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(raw.favorite)
      ? { favorite: raw.favorite }
      : {}),
  };
}
