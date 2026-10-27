// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildQuote,
  cartResponse,
  createOrder,
  database,
  initializeDatabase,
  publicUser,
  save,
  session,
  settleOrder,
  transaction,
} from '../mocks/database';
import type { OrderInput } from '../contracts';
vi.stubGlobal('crypto', webcrypto);
async function login(index = 0) {
  const db = database();
  db.currentUserId = db.users[index].id;
  db.expiresAt = Date.now() + 60_000;
  save(db);
  return db;
}
async function prepareOrder() {
  const db = await login();
  db.users[0].cart = { 'nft-1': 2 };
  save(db);
  const quote = await buildQuote(db);
  const input: OrderInput = {
    quoteFingerprint: quote.fingerprint,
    idempotencyKey: 'attempt-fixed-0001',
    walletId: 'wallet-1',
    network: 'Ethereum',
    collectorName: 'Demo Collector',
    collectorEmail: 'collector@example.test',
  };
  return { db, quote, input, initialAvailability: db.nfts[0].available };
}
describe('mock marketplace invariants', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();
    await initializeDatabase(true);
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });
  it('stores password digests and never returns them in profiles', () => {
    const db = database();
    expect(db.users[0].passwordHash).toMatch(/^[a-f0-9]{64}$/);
    expect(publicUser(db.users[0])).not.toHaveProperty('passwordHash');
  });
  it('supports a guest quote without exposing another user cart', async () => {
    const db = database();
    db.guestCart = { 'nft-2': 1 };
    db.users[0].cart = { 'nft-3': 2 };
    save(db);
    expect((await buildQuote(db)).items.map((item) => item.nftId)).toEqual(['nft-2']);
    expect(cartResponse(db).items).toHaveLength(1);
  });
  it('calculates the desktop reference cart from its real line items and exact fee', async () => {
    const db = database();
    db.guestCart = { 'nft-1': 2, 'nft-5': 6, 'nft-6': 9 };
    save(db);
    const quote = await buildQuote(db);
    expect(quote.subtotal).toBe('26.83');
    expect(quote.networkFee).toBe('0.016');
    expect(quote.total).toBe('26.846');
  });
  it('isolates carts when the active user changes', async () => {
    const db = await login();
    db.users[0].cart = { 'nft-1': 2 };
    db.users[1].cart = { 'nft-2': 1 };
    save(db);
    db.currentUserId = db.users[1].id;
    save(db);
    expect(cartResponse(db).items.map((item) => item.nftId)).toEqual(['nft-2']);
  });
  it('requires authentication for order creation', async () => {
    await expect(createOrder(database(), {} as OrderInput)).rejects.toMatchObject({ status: 401 });
  });
  it('recovers the same order for a repeated idempotency key', async () => {
    const { db, input, initialAvailability } = await prepareOrder();
    const first = await createOrder(db, input);
    const second = await createOrder(database(), input);
    expect(second.id).toBe(first.id);
    expect(Object.keys(database().orders)).toHaveLength(1);
    expect(database().nfts[0].available).toBe(initialAvailability - 2);
  });
  it('rejects the same attempt key with changed content', async () => {
    const { db, input } = await prepareOrder();
    await createOrder(db, input);
    await expect(
      createOrder(database(), { ...input, collectorName: 'Changed collector' }),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  });
  it('normalizes semantic payloads before matching idempotency', async () => {
    const { db, input } = await prepareOrder();
    const first = await createOrder(db, input);
    const reordered = Object.fromEntries(Object.entries(input).reverse()) as unknown as OrderInput;
    expect((await createOrder(database(), reordered)).id).toBe(first.id);
  });
  it('rejects zero quantity restored from corrupted demo storage', async () => {
    const db = await login();
    db.users[0].cart = { 'nft-1': 0 };
    save(db);
    await expect(buildQuote(db)).rejects.toMatchObject({ status: 400 });
  });
  it('forces review after price changes', async () => {
    const { db, input } = await prepareOrder();
    db.nfts[0].price = '0.99';
    db.nfts[0].version++;
    save(db);
    await expect(createOrder(db, input)).rejects.toMatchObject({ code: 'QUOTE_CHANGED' });
  });
  it('requires a fresh review when a saved fee snapshot differs from the current quote', async () => {
    const { db, input, initialAvailability } = await prepareOrder();
    db.quotes[`user-1:${input.quoteFingerprint}`].networkFee = '0.002';
    save(db);
    await expect(createOrder(db, input)).rejects.toMatchObject({ code: 'QUOTE_CHANGED' });
    expect(Object.keys(database().orders)).toHaveLength(0);
    expect(database().nfts[0].available).toBe(initialAvailability);
  });
  it('rejects a wallet network that differs from the quoted collectibles before reservation', async () => {
    const { db, input, initialAvailability } = await prepareOrder();
    db.users[0].wallets[0].network = 'Polygon';
    input.network = 'Polygon';
    save(db);
    await expect(createOrder(db, input)).rejects.toMatchObject({ code: 'NETWORK_MISMATCH' });
    expect(Object.keys(database().orders)).toHaveLength(0);
    expect(database().nfts[0].available).toBe(initialAvailability);
  });
  it('rejects mixed-network carts without creating an order or reserving stock', async () => {
    const db = await login();
    const other = db.nfts.find((nft) => nft.network !== db.nfts[0].network)!;
    expect(other).toBeDefined();
    db.users[0].cart = { [db.nfts[0].id]: 1, [other.id]: 1 };
    const before = db.nfts.map((nft) => nft.available);
    save(db);
    const quote = await buildQuote(db);
    await expect(
      createOrder(db, {
        quoteFingerprint: quote.fingerprint,
        idempotencyKey: 'mixed-network-attempt',
        walletId: 'wallet-1',
        network: 'Ethereum',
        collectorName: 'Demo Collector',
        collectorEmail: 'collector@example.test',
      }),
    ).rejects.toMatchObject({ code: 'MIXED_NETWORKS' });
    expect(Object.keys(database().orders)).toHaveLength(0);
    expect(database().nfts.map((nft) => nft.available)).toEqual(before);
  });
  it('preserves an immutable receipt and removes only purchased quantities', async () => {
    const { db, input, quote } = await prepareOrder();
    const order = await createOrder(db, input);
    const current = database();
    current.users[0].cart['nft-1'] = 3;
    current.nfts[0].price = '9';
    save(current);
    await vi.advanceTimersByTimeAsync(2_100);
    const updated = database();
    expect(updated.orders[order.id].order.status).toBe('confirmed');
    expect(updated.orders[order.id].order.total).toBe(quote.total);
    expect(updated.orders[order.id].order.items[0].unitPrice).toBe(quote.items[0].unitPrice);
    expect(updated.users[0].cart['nft-1']).toBe(1);
  });
  it('keeps refused order terminal and restores reserved inventory', async () => {
    const { db, input, initialAvailability } = await prepareOrder();
    db.scenario = 'payment-refused';
    save(db);
    const order = await createOrder(db, input);
    await vi.advanceTimersByTimeAsync(2_100);
    settleOrder(order.id);
    expect(database().orders[order.id].order.status).toBe('refused');
    expect(database().nfts[0].available).toBe(initialAvailability);
    expect(database().users[0].cart['nft-1']).toBe(2);
  });
  it('expires sessions before returning private records', async () => {
    const db = await login();
    db.expiresAt = Date.now() - 1;
    save(db);
    expect(() => session(db)).toThrow();
    expect(database().currentUserId).toBeNull();
  });
  it('serializes concurrent mutations even if the first awaits', async () => {
    const steps: number[] = [];
    await Promise.all([
      transaction(async () => {
        steps.push(1);
        await Promise.resolve();
        steps.push(2);
      }),
      transaction(() => {
        steps.push(3);
      }),
    ]);
    expect(steps).toEqual([1, 2, 3]);
  });
});
