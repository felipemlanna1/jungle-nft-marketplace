import * as z from 'zod/mini';
import type {
  Cart,
  Article,
  ArticlePreview,
  Catalog,
  NFT,
  NewsletterSubscription,
  Order,
  OrderInput,
  Quote,
  Recommendations,
  User,
  Wallet,
} from '../contracts';

/** Transport validation keeps malformed network payloads outside application state. */
export const ethSchema = z
  .string()
  .check(
    z.maxLength(80),
    z.regex(/^(0|[1-9]\d*)(\.\d{1,18})?$/, 'Expected an exact decimal ETH string'),
  );
const text = (maximum: number) => z.string().check(z.minLength(1), z.maxLength(maximum));
const identifier = text(160);
const version = z.int().check(z.positive());
const network = z.enum(['Ethereum', 'Polygon']);
const address = z.string().check(z.regex(/^0x[a-fA-F0-9]{40}$/));
const ens = z
  .string()
  .check(z.maxLength(100), z.regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+eth$/i));
const optionalEns = z.optional(z.union([ens, z.literal('')]));
const walletProvider = z.enum(['MetaMask', 'Coinbase', 'WalletConnect']);
const editionSchema = z.object({
  id: identifier,
  label: text(80),
  price: ethSchema,
  available: z.int().check(z.nonnegative()),
});
export const nftSchema: z.ZodMiniType<NFT> = z
  .object({
    id: identifier,
    title: text(200),
    creator: text(120),
    image: text(2000),
    collection: text(200),
    category: text(80),
    network,
    releasedAt: version,
    popularity: z.int().check(z.nonnegative(), z.lte(100)),
    previousPrice: z.optional(ethSchema),
    tokenId: z.optional(z.string()),
    description: z.optional(z.string()),
    attributes: z.optional(z.array(z.string())),
    rating: z.optional(z.number().check(z.minimum(0), z.maximum(5))),
    reviewCount: z.optional(z.int().check(z.nonnegative())),
    rarity: z.optional(z.enum(['Rare', 'Common'])),
    editions: z.optional(z.array(editionSchema).check(z.minLength(1))),
    defaultEditionId: z.optional(identifier),
    price: ethSchema,
    available: z.int().check(z.nonnegative()),
    version,
  })
  .check(
    z.refine((nft) => {
      if (nft.editions === undefined) return nft.defaultEditionId === undefined;
      return (
        new Set(nft.editions.map((edition) => edition.id)).size === nft.editions.length &&
        nft.editions.some((edition) => edition.id === nft.defaultEditionId)
      );
    }, 'Edition identifiers must be unique and include the declared default.'),
  );
export const catalogSchema: z.ZodMiniType<Catalog> = z.object({
  items: z.array(nftSchema),
  total: z.int().check(z.nonnegative()),
  page: version,
  pageSize: version,
  facets: z.object({
    categories: z.record(z.string(), z.int().check(z.nonnegative())),
    networks: z.record(z.string(), z.int().check(z.nonnegative())),
  }),
});
export const recommendationsSchema: z.ZodMiniType<Recommendations> = z.object({
  items: z.array(nftSchema),
  criterion: z.literal('simulated-popularity'),
  label: text(200),
  simulated: z.literal(true),
});
export const newsletterEmailSchema = z.email().check(z.maxLength(160));
export const newsletterSubscriptionSchema: z.ZodMiniType<NewsletterSubscription> = z.object({
  id: identifier,
  email: newsletterEmailSchema,
  createdAt: version,
  simulated: z.literal(true),
  alreadySubscribed: z.boolean(),
});
const articlePreviewShape = {
  id: identifier,
  title: text(200),
  excerpt: text(500),
  image: text(2000),
  publishedAt: z.iso.datetime(),
  readMinutes: z.int().check(z.positive(), z.lte(60)),
  simulated: z.literal(true),
};
export const articlePreviewSchema: z.ZodMiniType<ArticlePreview> = z.object(articlePreviewShape);
export const articlesSchema = z.array(articlePreviewSchema);
export const articleSchema: z.ZodMiniType<Article> = z.object({
  ...articlePreviewShape,
  paragraphs: z.array(text(5000)).check(z.minLength(1)),
});
export const userSchema: z.ZodMiniType<User> = z.object({
  id: identifier,
  email: z.email().check(z.maxLength(200)),
  name: text(200),
  avatar: z.optional(z.string().check(z.maxLength(500_000))),
  username: z.optional(z.string().check(z.regex(/^[a-zA-Z0-9._-]{3,40}$/))),
  ens: optionalEns,
  walletNickname: z.optional(z.string().check(z.maxLength(60))),
});
export const walletSchema: z.ZodMiniType<Wallet> = z.object({
  id: identifier,
  label: text(60),
  address,
  network,
  primary: z.boolean(),
  displayName: z.optional(z.string().check(z.maxLength(120))),
  profileName: z.optional(z.string().check(z.maxLength(120))),
  secondaryAddress: z.optional(z.union([address, ens, z.literal('')])),
  walletType: z.optional(walletProvider),
  referralCode: z.optional(z.string().check(z.maxLength(80))),
  email: z.optional(z.union([z.email().check(z.maxLength(200)), z.literal('')])),
  ens: optionalEns,
});
export const cartSchema: z.ZodMiniType<Cart> = z.object({
  items: z.array(
    z.object({
      id: z.optional(identifier),
      editionId: z.optional(identifier),
      editionLabel: z.optional(text(80)),
      nftId: identifier,
      quantity: version,
      nft: nftSchema,
    }),
  ),
  version,
});
export const orderItemSchema = z.object({
  tokenId: z.optional(text(80)),
  cartItemId: z.optional(identifier),
  editionId: z.optional(identifier),
  editionLabel: z.optional(text(80)),
  nftId: identifier,
  title: text(200),
  image: text(2000),
  unitPrice: ethSchema,
  quantity: version,
});
const quoteShape = {
  fingerprint: text(200),
  subtotal: ethSchema,
  discount: ethSchema,
  networkFee: ethSchema,
  total: ethSchema,
  items: z.array(orderItemSchema).check(z.minLength(1)),
  expiresAt: version,
};
export const quoteSchema: z.ZodMiniType<Quote> = z.object(quoteShape);
const collectorDetails = {
  username: z.optional(z.string().check(z.regex(/^[a-zA-Z0-9._-]{3,40}$/))),
  profileName: z.optional(z.string().check(z.maxLength(120))),
  ens: optionalEns,
  referralCode: z.optional(z.string().check(z.maxLength(80))),
  notes: z.optional(z.string().check(z.maxLength(1000))),
};
export const orderInputSchema: z.ZodMiniType<OrderInput> = z.object({
  quoteFingerprint: text(200),
  idempotencyKey: text(160),
  walletId: identifier,
  network,
  collectorName: text(200),
  collectorEmail: z.email(),
  coupon: z.optional(z.string().check(z.maxLength(40))),
  collectorDetails: z.optional(z.object(collectorDetails)),
  provider: z.optional(walletProvider),
});
export const purchaseAttemptSchema = z.object({
  userId: identifier,
  input: orderInputSchema,
  orderId: z.optional(identifier),
});
export const orderSchema: z.ZodMiniType<Order> = z.object({
  ...quoteShape,
  id: identifier,
  status: z.enum(['pending', 'confirmed', 'refused']),
  version,
  createdAt: version,
  transactionId: text(200),
  walletId: identifier,
  network,
  collector: z.optional(z.object({ name: text(200), email: z.email(), ...collectorDetails })),
  wallet: z.optional(
    z.object({ label: text(60), address, network, provider: z.optional(walletProvider) }),
  ),
});
export const favoritesSchema = z.array(identifier);
export const walletsSchema = z.array(walletSchema);
export const sessionSchema = z.nullable(userSchema);
export const recoverOrderSchema = z.nullable(orderSchema);
export function parseResponse<T>(schema: z.ZodMiniType<T>, payload: unknown): T {
  return schema.parse(payload);
}
