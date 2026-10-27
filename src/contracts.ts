export type Network = 'Ethereum' | 'Polygon';
export interface NFT {
  id: string;
  title: string;
  creator: string;
  image: string;
  collection: string;
  category: string;
  price: string;
  available: number;
  version: number;
}
export interface CatalogSearch {
  q?: string;
  category?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc';
  page?: number;
}
export interface Catalog {
  items: NFT[];
  total: number;
  page: number;
  pageSize: number;
}
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
export interface Wallet {
  id: string;
  label: string;
  address: string;
  network: Network;
  primary: boolean;
}
export interface CartItem {
  nftId: string;
  quantity: number;
  nft: NFT;
}
export interface Cart {
  items: CartItem[];
  version: number;
}
export interface OrderItem {
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
}
export interface OrderInput {
  quoteFingerprint: string;
  idempotencyKey: string;
  walletId: string;
  network: Network;
  collectorName: string;
  collectorEmail: string;
  coupon?: string;
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
