import type { NFT } from '../contracts';
const artworks = [
  ['The future of ETH®', 'Marco Conti', 'Abstract', '0.32', 'art-01'],
  ['Silent dimensions', 'Sofia Reyes', 'Art', '0.48', 'art-02'],
  ['Beyond the horizon', 'Eli Nova', 'Photography', '0.19', 'art-03'],
  ['Dream in color', 'Maya Chen', 'Abstract', '0.72', 'art-04'],
  ['Crystal universe', 'Kai Studio', 'Art', '0.24', 'art-05'],
  ['A different kind of blue', 'Luca Moreau', 'Photography', '0.56', 'art-06'],
  ['Electric bloom', 'Nina Park', 'Abstract', '0.37', 'art-07'],
  ['The observer', 'Theo West', 'Art', '0.91', 'art-08'],
  ['Golden hour', 'Ava Lake', 'Photography', '0.15', 'art-09'],
  ['Orbital stories', 'Marco Conti', 'Abstract', '0.63', 'art-10'],
  ['Still in motion', 'Sofia Reyes', 'Art', '0.41', 'art-11'],
  ['Soft geometry', 'Eli Nova', 'Abstract', '0.28', 'art-12'],
  ['Ritual of light', 'Maya Chen', 'Photography', '0.82', 'art-13'],
  ['Parallel worlds', 'Kai Studio', 'Art', '0.34', 'art-14'],
  ['Out of the ordinary', 'Nina Park', 'Abstract', '0.47', 'art-15'],
  ['Moonlight signal', 'Theo West', 'Art', '0.29', 'art-16'],
  ['Chromatic island', 'Ava Lake', 'Photography', '0.67', 'art-17'],
  ['Infinite potential', 'Luca Moreau', 'Abstract', '0.53', 'art-18'],
] as const;
export function createNfts(): NFT[] {
  return artworks.map(([title, creator, category, price], index) => ({
    id: `nft-${index + 1}`,
    title,
    creator,
    collection: 'Beyond imagination',
    category,
    price,
    image: `/art/nft-${(index % 12) + 1}.svg`,
    available: index === 17 ? 0 : 3 + (index % 6),
    version: 1,
  }));
}
export const DEMO_PASSWORD = 'Collect0r!Demo';
