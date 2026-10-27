export type Network = 'Ethereum' | 'Polygon';
export interface NftEdition {
  id: string;
  label: string;
  price: string;
  available: number;
}
export interface NFT {
  id: string;
  title: string;
  creator: string;
  image: string;
  collection: string;
  category: string;
  network: Network;
  releasedAt: number;
  popularity: number;
  previousPrice?: string;
  tokenId?: string;
  description?: string;
  attributes?: string[];
  rating?: number;
  reviewCount?: number;
  rarity?: 'Rare' | 'Common';
  editions?: NftEdition[];
  defaultEditionId?: string;
  price: string;
  available: number;
  version: number;
}
export interface CatalogSearch {
  q?: string;
  category?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc';
  page?: number;
  minPrice?: string;
  maxPrice?: string;
  network?: Network | 'Solana';
  tab?: 'all' | 'new' | 'trending';
}
export interface Catalog {
  items: NFT[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    categories: Record<string, number>;
    networks: Record<string, number>;
  };
}
export interface RecommendationSearch {
  exclude?: string[];
  limit?: number;
}
export interface Recommendations {
  items: NFT[];
  criterion: 'simulated-popularity';
  label: string;
  simulated: true;
}
export interface NewsletterSubscription {
  id: string;
  email: string;
  createdAt: number;
  simulated: true;
  alreadySubscribed: boolean;
}
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
  readMinutes: number;
  paragraphs: string[];
  simulated: true;
}
export type ArticlePreview = Omit<Article, 'paragraphs'>;
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  username?: string;
  ens?: string;
  walletNickname?: string;
}
export type ProfileInput = Pick<User, 'name'> &
  Partial<Pick<User, 'email' | 'avatar' | 'username' | 'ens' | 'walletNickname'>>;
export type WalletType = 'MetaMask' | 'Coinbase' | 'WalletConnect';
export interface Wallet {
  id: string;
  label: string;
  address: string;
  network: Network;
  primary: boolean;
  displayName?: string;
  profileName?: string;
  secondaryAddress?: string;
  walletType?: WalletType;
  referralCode?: string;
  email?: string;
  ens?: string;
}
export interface CartItem {
  id?: string;
  editionId?: string;
  editionLabel?: string;
  nftId: string;
  quantity: number;
  nft: NFT;
}
export interface Cart {
  items: CartItem[];
  version: number;
}
export interface OrderItem {
  tokenId?: string;
  cartItemId?: string;
  editionId?: string;
  editionLabel?: string;
  nftId: string;
  title: string;
  image: string;
  unitPrice: string;
  quantity: number;
}
export interface Quote {
  fingerprint: string;
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  items: OrderItem[];
  expiresAt: number;
}
export interface Order extends Quote {
  id: string;
  status: 'pending' | 'confirmed' | 'refused';
  version: number;
  createdAt: number;
  transactionId: string;
  walletId: string;
  network: Network;
  collector?: { name: string; email: string } & CollectorDetails;
  wallet?: { label: string; address: string; network: Network; provider?: WalletType };
}
export interface CollectorDetails {
  username?: string;
  profileName?: string;
  ens?: string;
  referralCode?: string;
  notes?: string;
}
export interface OrderInput {
  quoteFingerprint: string;
  idempotencyKey: string;
  walletId: string;
  network: Network;
  collectorName: string;
  collectorEmail: string;
  coupon?: string;
  collectorDetails?: CollectorDetails;
  provider?: WalletType;
}
export interface NftEvent {
  eventId: string;
  nft: NFT;
  version: number;
}
export interface OrderEvent {
  eventId: string;
  order: Order;
  version: number;
  userId: string;
}
export type Scenario =
  | 'default'
  | 'slow'
  | 'empty'
  | 'offline'
  | 'server-error'
  | 'expired'
  | 'payment-refused'
  | 'order-timeout';
