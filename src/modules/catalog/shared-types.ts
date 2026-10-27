import type { NFT } from '../../contracts';
export type { CatalogSearch, NFT } from '../../contracts';
export interface NFTCardProps {
  nft: NFT;
  favorite: boolean;
  onFavorite: () => void;
  busy: boolean;
}
