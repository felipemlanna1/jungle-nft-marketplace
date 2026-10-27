import type { NFT } from '../../contracts';
export type { CatalogSearch, NFT } from '../../contracts';
export interface NFTCardProps {
  nft: NFT;
  favorite: boolean;
  onFavorite: () => void;
  busy: boolean;
}
export interface MarketplaceHeroProps {
  appearance: 'kurio' | 'expedition';
}
export interface CollectionStripProps {
  category?: string;
  onSelect: (category: string) => void;
}
