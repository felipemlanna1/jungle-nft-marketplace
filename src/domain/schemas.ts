import { z } from 'zod';
import type { Cart, Catalog, NFT, Order, Quote, User, Wallet } from '../contracts';

/** Transport validation keeps malformed network payloads outside application state. */
export const ethSchema = z
  .string()
  .max(80)
  .regex(/^(0|[1-9]\d*)(\.\d{1,18})?$/, 'Expected an exact decimal ETH string');
const identifier = z.string().min(1).max(160);
const version = z.number().int().positive();
const network = z.enum(['Ethereum', 'Polygon']);
export const nftSchema: z.ZodType<NFT> = z.object({
  id: identifier,
  title: z.string().min(1).max(200),
  creator: z.string().min(1).max(120),
  image: z.string().min(1).max(2000),
  collection: z.string().min(1).max(200),
  category: z.string().min(1).max(80),
  price: ethSchema,
  available: z.number().int().nonnegative(),
  version,
});
export const catalogSchema: z.ZodType<Catalog> = z.object({
  items: z.array(nftSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export const userSchema: z.ZodType<User> = z.object({
  id: identifier,
  email: z.email().max(200),
  name: z.string().min(1).max(200),
  avatar: z.string().max(500_000).optional(),
});
export const walletSchema: z.ZodType<Wallet> = z.object({
  id: identifier,
  label: z.string().min(1).max(60),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  network,
  primary: z.boolean(),
});
export const cartSchema: z.ZodType<Cart> = z.object({
  items: z.array(
    z.object({ nftId: identifier, quantity: z.number().int().positive(), nft: nftSchema }),
  ),
  version,
});
export const orderItemSchema = z.object({
  nftId: identifier,
  title: z.string().min(1).max(200),
  image: z.string().min(1).max(2000),
  unitPrice: ethSchema,
  quantity: z.number().int().positive(),
});
const quoteShape = {
  fingerprint: z.string().min(1).max(200),
  subtotal: ethSchema,
  discount: ethSchema,
  networkFee: ethSchema,
  total: ethSchema,
  items: z.array(orderItemSchema).min(1),
  expiresAt: z.number().int().positive(),
};
export const quoteSchema: z.ZodType<Quote> = z.object(quoteShape);
export const orderSchema: z.ZodType<Order> = z.object({
  ...quoteShape,
  id: identifier,
  status: z.enum(['pending', 'confirmed', 'refused']),
  version,
  createdAt: z.number().int().positive(),
  transactionId: z.string().min(1).max(200),
  walletId: identifier,
  network,
});
export const favoritesSchema = z.array(identifier);
export const walletsSchema = z.array(walletSchema);
export const sessionSchema = userSchema.nullable();
export const recoverOrderSchema = orderSchema.nullable();
export function parseResponse<T>(schema: z.ZodType<T>, payload: unknown): T {
  return schema.parse(payload);
}
