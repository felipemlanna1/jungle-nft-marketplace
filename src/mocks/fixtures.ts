import type { NFT } from '../contracts';

const artworks = [
  ['Emerald Ape #042', 'Kurio Editions', 'Art', '1.19', 'emerald'],
  ['Sage Nomad #009', 'Kurio Editions', 'Photography', '1.69', 'sage'],
  ['Neon Vessel #552', 'Kurio Editions', '3D', '1.99', 'ivory'],
  ['Cosmic Bloom #118', 'Studio Nomad', 'Art', '1.29', 'sage'],
  ['Violet Nomad #314', 'Studio Nomad', 'Generative', '1.39', 'sage'],
  ['Ivory Baron #088', 'Kurio Editions', 'Collectibles', '1.79', 'ivory'],
  ['Golden Beat #207', 'Studio Signal', 'Music', '0.99', 'golden'],
  ['Golden Pulse #099', 'Studio Signal', 'Gaming', '0.79', 'golden'],
  ['Golden Signal #160', 'Studio Signal', 'Utility', '0.39', 'golden'],
  ['Linen Scholar #011', 'Kurio Studio', 'Art', '1.05', 'linen'],
  ['Olive Explorer #027', 'Kurio Studio', '3D', '0.84', 'olive'],
  ['Terracotta Traveler #016', 'Kurio Studio', 'Photography', '0.63', 'terracotta'],
  ['Midnight Curator #101', 'Kurio Studio', 'Generative', '0.41', 'midnight'],
  ['Ivory Listener #204', 'Kurio Studio', 'Memberships', '0.28', 'listener'],
  ['Burgundy Collector #018', 'Kurio Studio', 'Collectibles', '0.82', 'burgundy'],
  ['Southbound #041', 'Atelier Atlantic', 'Art', '0.34', 'cartographer'],
  ['Clay Archive #063', 'Atelier Atlantic', 'Utility', '0.47', 'maker'],
  ['Last Light #090', 'Studio Signal', 'Art', '0.53', 'golden'],
] as const;
const studioPopularity = [98, 92, 86, 78, 90, 72] as const;
const artworkImages = {
  emerald: '/figma/art/f20b58b99de12b6e.webp',
  sage: '/figma/art/9b25d8d72395aa62.webp',
  ivory: '/figma/art/326df4c1c08c31c8.webp',
  golden: '/figma/art/2a42ba5adc341c3d.webp',
  cartographer: '/art/atlantic-cartographer.webp',
  maker: '/art/ceramic-maker.webp',
  linen: '/art/apes/linen-scholar.webp',
  olive: '/art/apes/olive-explorer.webp',
  terracotta: '/art/apes/terracotta-traveler.webp',
  midnight: '/art/apes/midnight-curator.webp',
  listener: '/art/apes/ivory-listener.webp',
  burgundy: '/art/apes/burgundy-collector.webp',
} as const;

export function createNfts(): NFT[] {
  return artworks.map(([title, creator, category, price, artwork], index) => ({
    id: `nft-${index + 1}`,
    title,
    creator,
    collection: index < 9 ? 'Kurio Apes' : index < 15 ? 'Kurio Studio Apes' : 'Atlantic Editions',
    category,
    price,
    ...(index === 2 ? { previousPrice: '2.29' } : {}),
    image: artworkImages[artwork],
    network: index < 9 || index % 3 === 0 ? 'Ethereum' : 'Polygon',
    releasedAt: Date.UTC(2026, 9, 27) - index * 5 * 86_400_000,
    popularity:
      index >= 9 && index < 15 ? studioPopularity[index - 9] : Math.max(0, 96 - index * 4),
    available: index === 17 ? 0 : index === 5 ? 10 : 3 + (index % 6),
    tokenId: title.split('#')[1],
    description: `Colecionável digital da coleção ${index < 9 ? 'Kurio Apes' : index < 15 ? 'Kurio Studio Apes' : 'Atlantic Editions'}. Esta obra e sua negociação fazem parte de uma simulação.`,
    attributes: index === 0 ? ['Óculos', 'Esmeralda', 'Raro'] : [category, 'Edição digital'],
    rating: index === 0 ? 4.5 : 4,
    reviewCount: index === 0 ? 19 : 3 + index,
    rarity: [2, 9, 13, 14].includes(index) ? 'Rare' : 'Common',
    version: 1,
  }));
}
export { DEMO_LOGIN } from '../config/demo';
