import type { NFT } from '../../contracts';
import { ensureEditions } from '../../domain/editions';

export const CATALOG_REVISION = 3;

/** Replace fixture metadata while keeping reservations and independent edition inventory. */
export function migrateCatalog(previous: readonly NFT[], fixtures: readonly NFT[]): NFT[] {
  const previousById = new Map(previous.map((nft) => [nft.id, nft]));
  const updated = fixtures.map((fixture) => {
    const current = structuredClone(fixture);
    const editions = ensureEditions(current);
    const old = previousById.get(current.id);
    if (!old) return current;
    const oldEditions = new Map(old.editions?.map((edition) => [edition.id, edition]) ?? []);
    const oldDefault = oldEditions.get(old.defaultEditionId ?? current.defaultEditionId!);
    for (const edition of editions)
      edition.available =
        oldEditions.get(edition.id)?.available ??
        (edition.id === current.defaultEditionId
          ? (oldDefault?.available ?? old.available)
          : edition.available);
    current.available = editions.find(
      (edition) => edition.id === current.defaultEditionId,
    )!.available;
    current.version = Math.max(old.version, current.version) + 1;
    return current;
  });
  const knownIds = new Set(fixtures.map((nft) => nft.id));
  return [...updated, ...previous.filter((nft) => !knownIds.has(nft.id))];
}
