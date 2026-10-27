import type { Article } from '../contracts';
import { createNfts } from './fixtures';

const nfts = createNfts();
const introduction =
  'Este é um exemplo de conteúdo editorial criado para demonstrar a interface do Diário da Cunhagem. As datas e os tempos de leitura são dados ilustrativos do template.';

export const articles: readonly Article[] = [
  {
    id: 'nft-ownership',
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: nfts[2].image,
    publishedAt: '2026-09-12T00:00:00.000Z',
    readMinutes: 6,
    simulated: true,
    paragraphs: [
      introduction,
      'Neste cenário fictício, um token identifica um item do catálogo de demonstração. Os nomes e as obras são exemplos: não há transferência em blockchain nem promessa de direitos sobre ativos reais. Este texto não oferece orientação jurídica ou financeira.',
    ],
  },
  {
    id: 'digital-artists',
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
    image: nfts[0].image,
    publishedAt: '2026-09-13T00:00:00.000Z',
    readMinutes: 2,
    simulated: true,
    paragraphs: [
      introduction,
      'O título e o resumo reproduzem o exemplo do template visual. Não se trata de uma lista publicada nem de uma recomendação de dez artistas reais. Os personagens e as coleções usados nesta demonstração são fictícios.',
    ],
  },
  {
    id: 'rarity-and-provenance',
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: nfts[1].image,
    publishedAt: '2026-09-15T00:00:00.000Z',
    readMinutes: 3,
    simulated: true,
    paragraphs: [
      introduction,
      'Os selos, os atributos e a procedência apresentados pertencem aos dados fictícios do catálogo. Este conteúdo apenas demonstra a leitura de um artigo e não constitui orientação jurídica ou financeira.',
    ],
  },
  {
    id: 'wallet-protection',
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: nfts[6].image,
    publishedAt: '2026-09-15T00:00:00.000Z',
    readMinutes: 2,
    simulated: true,
    paragraphs: [
      introduction,
      'Esta leitura usa uma carteira simulada, sem conexão com provedores reais. O formulário da demonstração não solicita frase de recuperação nem chave privada. O texto é ilustrativo e não substitui a documentação de um serviço real.',
    ],
  },
];
