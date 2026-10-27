import type { CatalogSort } from './shared-types';

export const catalogSortOptions = [
  { value: 'newest', label: 'Listados recentemente' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
] as const satisfies readonly { value: CatalogSort; label: string }[];
