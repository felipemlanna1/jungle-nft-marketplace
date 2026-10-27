import type { NFT, NftEdition } from '../contracts';
import { fromWei, toWei } from './money';

export const DEFAULT_EDITION_ID = 'one-of-fifty';

/** Default projections preserve the original API; other editions hold independent inventory. */
export function ensureEditions(nft: NFT): NftEdition[] {
  if (!nft.editions?.length) {
    const price = toWei(nft.price);
    nft.defaultEditionId = DEFAULT_EDITION_ID;
    nft.editions = [
      { id: 'one-of-one', label: '1/1', price: fromWei(price * 2n), available: 1 },
      { id: 'one-of-ten', label: '1/10', price: fromWei((price * 125n) / 100n), available: 10 },
      { id: DEFAULT_EDITION_ID, label: '1/50', price: nft.price, available: nft.available },
      { id: 'open', label: 'Open edition', price: fromWei((price * 80n) / 100n), available: 99 },
    ];
  }
  nft.defaultEditionId ??= DEFAULT_EDITION_ID;
  const defaultEdition = nft.editions.find((edition) => edition.id === nft.defaultEditionId);
  if (!defaultEdition) throw new Error('The default edition is missing.');
  defaultEdition.price = nft.price;
  defaultEdition.available = nft.available;
  return nft.editions;
}

export function selectEdition(nft: NFT, editionId?: string): NftEdition {
  const editions = ensureEditions(nft);
  const edition = editions.find((item) => item.id === (editionId ?? nft.defaultEditionId));
  if (!edition) throw new Error('This edition does not exist.');
  return edition;
}

export function editionCartKey(nft: NFT, editionId?: string): string {
  const edition = selectEdition(nft, editionId);
  return edition.id === nft.defaultEditionId ? nft.id : `${nft.id}::${edition.id}`;
}

export function setEditionAvailability(nft: NFT, editionId: string | undefined, available: number) {
  if (!Number.isSafeInteger(available) || available < 0)
    throw new Error('Invalid edition inventory.');
  const edition = selectEdition(nft, editionId);
  edition.available = available;
  if (edition.id === nft.defaultEditionId) nft.available = available;
}
