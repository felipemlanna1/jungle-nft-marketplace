import type { NFT, RecommendationSearch, Recommendations } from '../contracts';

/** A deterministic fixture ranking, explicitly unrelated to real collector analytics. */
export function recommendNfts(
  nfts: readonly NFT[],
  { exclude = [], limit = 8 }: RecommendationSearch = {},
): Recommendations {
  const excluded = new Set(exclude);
  return {
    items: nfts
      .filter((nft) => !excluded.has(nft.id))
      .sort((left, right) => right.popularity - left.popularity || left.id.localeCompare(right.id))
      .slice(0, limit),
    criterion: 'simulated-popularity',
    label: 'Seleção demonstrativa por popularidade fictícia',
    simulated: true,
  };
}
