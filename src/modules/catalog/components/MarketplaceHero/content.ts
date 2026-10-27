import { figmaAssets } from '../../../../assets/figma';
import type { MarketplaceHeroSlide } from '../../shared-types';

export const marketplaceHeroSlides: readonly MarketplaceHeroSlide[] = [
  {
    id: 'digital-culture',
    eyebrow: 'Bem-vindo à Kurio',
    desktopTitle: ['SEJA DONO DO FUTURO', 'DA ARTE DIGITAL'],
    mobileTitle: ['SEJA DONO DA', 'CULTURA DIGITAL'],
    desktopDescription:
      'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
    mobileDescription: 'Descubra NFTs selecionados de criadores do mundo todo.',
    image: figmaAssets.home.imgFrame136,
    thumbnail: figmaAssets.home.imgNftArtwork18,
    imageAlt: 'Emerald Ape, personagem de arte digital em verde esmeralda',
    target: { kind: 'catalog' },
  },
  {
    id: 'genesis-drops',
    eyebrow: 'Coleções em destaque',
    desktopTitle: ['LANÇAMENTOS GÊNESIS', 'DE EDIÇÃO LIMITADA'],
    mobileTitle: ['LANÇAMENTOS', 'GÊNESIS'],
    desktopDescription:
      'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    mobileDescription: 'Colecione edições escassas diretamente dos criadores.',
    image: figmaAssets.home.imgFrame136,
    imageAlt: 'Emerald Ape, obra da coleção Kurio Apes',
    target: { kind: 'nft', id: 'nft-1' },
  },
  {
    id: 'curated-art',
    eyebrow: 'Coleções em destaque',
    desktopTitle: ['ARTE DIGITAL SELECIONADA', 'E MUITO MAIS'],
    mobileTitle: ['ARTE DIGITAL', 'SELECIONADA'],
    desktopDescription: 'Explore novos artistas, coleções e obras digitais que definem a cultura.',
    mobileDescription: 'Explore novos artistas, coleções e obras digitais.',
    image: figmaAssets.home.imgNftArtwork05,
    imageAlt: 'Neon Vessel, personagem de arte digital com traje claro',
    target: { kind: 'nft', id: 'nft-3' },
  },
];
