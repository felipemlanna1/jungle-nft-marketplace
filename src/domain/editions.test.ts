// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { OrderInput } from '../contracts';
import {
  buildQuote,
  cartResponse,
  createOrder,
  database,
  initializeDatabase,
  save,
  settleOrder,
} from '../mocks/database';
import { editionCartKey, selectEdition } from './editions';
import { fromWei, toWei } from './money';
import { orderSchema } from './schemas';
vi.stubGlobal('crypto', webcrypto);
const variantKey = 'nft-1::one-of-ten';
async function prepare(cart: Record<string, number> = { [variantKey]: 2 }) {
  const db = database();
  db.currentUserId = db.users[0].id;
  db.expiresAt = Date.now() + 60_000;
  db.users[0].cart = cart;
  save(db);
  const quote = await buildQuote(db);
  const input: OrderInput = {
    quoteFingerprint: quote.fingerprint,
    idempotencyKey: 'edition-attempt-0001',
    walletId: 'wallet-1',
    network: 'Ethereum',
    collectorName: 'Demo Collector',
    collectorEmail: 'collector@example.test',
  };
  return { db, input, quote };
}
beforeEach(async () => {
  vi.useFakeTimers();
  localStorage.clear();
  await initializeDatabase(true);
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});
describe('edition and receipt invariants', () => {
  it('keeps the default edition compatible with the legacy item key and price', () => {
    const nft = database().nfts[0];
    expect(nft.editions).toHaveLength(4);
    expect(editionCartKey(nft)).toBe(nft.id);
    expect(selectEdition(nft)).toMatchObject({
      label: '1/50',
      price: nft.price,
      available: nft.available,
    });
    expect(() => selectEdition(nft, 'unknown')).toThrow();
  });
  it('quotes two editions as separate exact-price line items without mutating the base NFT', async () => {
    const { db, quote } = await prepare({ 'nft-1': 1, [variantKey]: 2 });
    const variant = selectEdition(db.nfts[0], 'one-of-ten');
    expect(quote.items.map((item) => item.cartItemId)).toEqual(['nft-1', variantKey]);
    expect(quote.items[1]).toMatchObject({
      editionId: 'one-of-ten',
      editionLabel: '1/10',
      unitPrice: variant.price,
    });
    expect(quote.subtotal).toBe(fromWei(toWei(db.nfts[0].price) + toWei(variant.price) * 2n));
    expect(cartResponse(db).items[1].nft.price).toBe(variant.price);
    expect(db.nfts[0].price).not.toBe(variant.price);
  });
  it('reserves only the purchased edition and recovers the same immutable attempt', async () => {
    const { db, input } = await prepare();
    const before = db.nfts[0].available;
    const first = await createOrder(db, input);
    expect(selectEdition(database().nfts[0], 'one-of-ten').available).toBe(8);
    expect(database().nfts[0].available).toBe(before);
    expect((await createOrder(database(), input)).id).toBe(first.id);
    expect(selectEdition(database().nfts[0], 'one-of-ten').available).toBe(8);
  });
  it('restores the refused edition without altering the inventory of other editions', async () => {
    const { db, input } = await prepare();
    db.scenario = 'payment-refused';
    const base = db.nfts[0].available;
    save(db);
    const order = await createOrder(db, input);
    await vi.advanceTimersByTimeAsync(2_100);
    settleOrder(order.id);
    expect(selectEdition(database().nfts[0], 'one-of-ten').available).toBe(10);
    expect(database().nfts[0].available).toBe(base);
    expect(database().users[0].cart[variantKey]).toBe(2);
  });
  it('removes only purchased edition quantities and retains quantities added while pending', async () => {
    const { db, input } = await prepare();
    await createOrder(db, input);
    const latest = database();
    latest.users[0].cart[variantKey] = 3;
    latest.users[0].cart['nft-1'] = 1;
    save(latest);
    await vi.advanceTimersByTimeAsync(2_100);
    expect(database().users[0].cart).toEqual({ [variantKey]: 1, 'nft-1': 1 });
  });
  it('rejects an oversubscribed unique edition before creating an order', async () => {
    const db = database();
    db.currentUserId = 'user-1';
    db.expiresAt = Date.now() + 60_000;
    db.users[0].cart = { 'nft-1::one-of-one': 2 };
    save(db);
    await expect(buildQuote(db)).rejects.toMatchObject({ code: 'AVAILABILITY_CHANGED' });
    expect(Object.keys(database().orders)).toHaveLength(0);
    expect(selectEdition(database().nfts[0], 'one-of-one').available).toBe(1);
  });
  it('persists a normalized collector and wallet snapshot independently of future edits', async () => {
    const { db, input } = await prepare();
    input.provider = 'WalletConnect';
    input.collectorDetails = {
      notes: '  Collection note  ',
      username: 'demo.collector',
      ens: 'DEMO.eth',
      referralCode: 'DEMO',
    };
    const order = await createOrder(db, input);
    const current = database();
    current.users[0].name = 'Changed profile';
    current.users[0].wallets[0].label = 'Changed wallet';
    save(current);
    input.collectorDetails.notes = 'Changed input';
    expect(database().orders[order.id].order.collector).toMatchObject({
      name: 'Demo Collector',
      email: 'collector@example.test',
      notes: 'Collection note',
      ens: 'demo.eth',
    });
    expect(database().orders[order.id].order.wallet).toMatchObject({
      label: 'My collection wallet',
      provider: 'WalletConnect',
    });
  });
  it('normalizes collector field ordering and detects a changed receipt payload', async () => {
    const { db, input } = await prepare();
    input.collectorDetails = { notes: 'Original', username: 'demo.collector' };
    const first = await createOrder(db, input);
    const reordered = {
      ...input,
      collectorDetails: { username: 'demo.collector', notes: 'Original' },
    };
    expect((await createOrder(database(), reordered)).id).toBe(first.id);
    await expect(
      createOrder(database(), {
        ...reordered,
        collectorDetails: { notes: 'Changed', username: 'demo.collector' },
      }),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  });
  it('rejects malformed collector details before reservation', async () => {
    const { db, input } = await prepare();
    await expect(
      createOrder(db, { ...input, collectorDetails: { notes: 'x'.repeat(1001) } }),
    ).rejects.toMatchObject({ status: 400 });
    expect(selectEdition(database().nfts[0], 'one-of-ten').available).toBe(10);
  });
  it('continues parsing legacy receipts without retroactively adding personal snapshots', async () => {
    const { db, input } = await prepare();
    const order = structuredClone(await createOrder(db, input));
    delete order.collector;
    delete order.wallet;
    expect(orderSchema.parse(order)).not.toHaveProperty('collector');
    expect(orderSchema.parse(order)).not.toHaveProperty('wallet');
  });
  it('keeps the purchased token identifier after the catalogue token metadata changes', async () => {
    const { db, input } = await prepare();
    db.nfts[0].tokenId = '#042';
    const quote = await buildQuote(db);
    const order = await createOrder(db, { ...input, quoteFingerprint: quote.fingerprint });
    const latest = database();
    latest.nfts[0].tokenId = '#999';
    save(latest);
    expect(orderSchema.parse(database().orders[order.id].order).items[0].tokenId).toBe('#042');
  });
});
