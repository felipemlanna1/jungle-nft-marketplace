import type { Catalog, CatalogSearch, NFT } from '../../contracts';
import type { FormEvent } from 'react';
export type { CatalogSearch, NFT } from '../../contracts';
export type CatalogSort = NonNullable<CatalogSearch['sort']>;
export interface NFTCardProps {
  nft: NFT;
  priority?: boolean;
  favorite: boolean;
  onFavorite: () => void;
  busy: boolean;
}

export interface CatalogFiltersProps {
  search: CatalogSearch;
  facets?: Catalog['facets'];
  update: (search: Partial<CatalogSearch>) => void;
  minPrice: string;
  maxPrice: string;
  onMinPrice: (value: string) => void;
  onMaxPrice: (value: string) => void;
  applyPrice: (event: FormEvent) => void;
  priceError: string;
  idPrefix: string;
}

export interface FavoriteChange {
  id: string;
  active: boolean;
  ownerId: string;
}
export interface FavoriteContext {
  ownerId: string;
  key: readonly ['favorites', string];
  previous: string[] | undefined;
}

export interface AddToCartInput {
  ownerId: string;
  nftId: string;
  quantity: number;
  editionId?: string;
}

export interface FavoritesListProps {
  onNavigate: () => void;
}

export interface MarketplaceHeroSlide {
  id: string;
  eyebrow: string;
  desktopTitle: readonly [string, string];
  mobileTitle: readonly [string, string];
  desktopDescription: string;
  mobileDescription: string;
  image: string;
  imageAlt: string;
  thumbnail?: string;
  target: { kind: 'catalog' } | { kind: 'nft'; id: string };
}
export interface MarketplaceHeroSlideProps {
  slide: MarketplaceHeroSlide;
  index: number;
}

export interface NftFavoriteActionProps {
  nftId: string;
  authenticated: boolean;
  active: boolean;
  pending: boolean;
  onToggle: () => void;
  className?: string;
  showLabel?: boolean;
}

export interface NftPreviewState {
  nftId: string | null;
  openPreview: (nftId: string) => void;
  closePreview: () => void;
}
