import { describe, expect, it } from 'vitest';
import {
  cartSchema,
  catalogSchema,
  ethSchema,
  favoritesSchema,
  nftSchema,
  orderSchema,
  quoteSchema,
  userSchema,
  walletSchema,
} from './schemas';
import { createNfts } from '../mocks/fixtures';
const nft = createNfts()[0];
const quote = {
  fingerprint: 'quote-1',
  subtotal: '0.32',
  discount: '0',
  networkFee: '0.002',
  total: '0.322',
  items: [{ nftId: nft.id, title: nft.title, image: nft.image, unitPrice: nft.price, quantity: 1 }],
  expiresAt: 2_000_000_000_000,
};
describe('runtime network contracts', () => {
  it('accepts complete fixture resources', () => {
    expect(nftSchema.parse(nft)).toEqual(nft);
    expect(quoteSchema.parse(quote)).toEqual(quote);
  });
  it.each(['-0.1', '1e5', '0.1234567890123456789', 'NaN'])('rejects invalid ETH %s', (value) =>
    expect(ethSchema.safeParse(value).success).toBe(false),
  );
  it('rejects malformed NFT availability and missing fields', () => {
    expect(nftSchema.safeParse({ ...nft, available: -1 }).success).toBe(false);
    expect(nftSchema.safeParse({ id: 'x' }).success).toBe(false);
  });
  it('rejects malformed catalogue and cart quantities', () => {
    expect(catalogSchema.safeParse({ items: [nft], total: 1, page: 0, pageSize: 9 }).success).toBe(
      false,
    );
    expect(
      cartSchema.safeParse({ items: [{ nftId: nft.id, nft, quantity: 0 }], version: 1 }).success,
    ).toBe(false);
  });
  it('rejects unsafe user and wallet shapes', () => {
    expect(userSchema.safeParse({ id: 'u1', name: 'Alex', email: 'invalid' }).success).toBe(false);
    expect(
      walletSchema.safeParse({
        id: 'w1',
        label: 'Demo',
        address: 'secret phrase',
        network: 'Ethereum',
        primary: true,
      }).success,
    ).toBe(false);
  });
  it('rejects invalid order status and numeric price transport', () => {
    expect(
      orderSchema.safeParse({
        ...quote,
        id: 'o1',
        status: 'paid',
        version: 1,
        createdAt: 100,
        transactionId: 'demo',
        walletId: 'w1',
        network: 'Ethereum',
      }).success,
    ).toBe(false);
    expect(quoteSchema.safeParse({ ...quote, total: 0.322 }).success).toBe(false);
  });
  it('rejects non-string favorites', () =>
    expect(favoritesSchema.safeParse(['nft-1', 2]).success).toBe(false));
});
