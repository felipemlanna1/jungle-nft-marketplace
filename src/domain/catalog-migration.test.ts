// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NFT, Order } from '../contracts';
import { createNfts } from '../mocks/fixtures';
import legacyFixture from '../../tests/fixtures/legacy-catalog-v1.json';
import { cartResponse, database, initializeDatabase, save } from '../mocks/database';
import { ensureEditions, selectEdition, setEditionAvailability } from './editions';

vi.stubGlobal('crypto', webcrypto);
const legacy = legacyFixture;
const storageKey = 'jungle.demo.database.v1';
function receipt(id: string, status: Order['status']): Order {
  return {
    id,
    status,
    version: 1,
    createdAt: Date.now() - 1000,
    transactionId: `0x${'9'.repeat(64)}`,
    walletId: 'wallet-1',
    network: 'Ethereum',
    fingerprint: 'a'.repeat(64),
    items: [
      {
        nftId: 'nft-1',
        title: legacy.nfts[0].title,
        image: legacy.nfts[0].image,
        unitPrice: '0.32',
        quantity: 2,
      },
    ],
    subtotal: '0.64',
    discount: '0',
    networkFee: '0.002',
    total: '0.642',
    expiresAt: Date.now() + 60_000,
  };
}
function seedLegacy() {
  const db = database();
  delete (db as unknown as { catalogRevision?: number }).catalogRevision;
  db.nfts = structuredClone(legacy.nfts) as unknown as NFT[];
  db.nfts[0].available = 1;
  db.nfts[0].version = 7;
  db.currentUserId = 'user-1';
  db.expiresAt = Date.now() + 60_000;
  db.users[0].name = 'Legacy display name';
  db.users[0].username = 'legacy.collector';
  db.users[0].favorites = ['nft-1', 'nft-5'];
  db.users[0].cart = { 'nft-1': 2 };
  db.users[0].cartVersion = 7;
  db.guestCart = { 'nft-2': 1 };
  db.guestVersion = 9;
  db.sequence = 4242;
  const pending = receipt('order-legacy-pending', 'pending');
  const terminal = receipt('order-legacy-confirmed', 'confirmed');
  db.orders = {
    [pending.id]: {
      userId: 'user-1',
      order: pending,
      signature: 'pending-signature',
      dueAt: Date.now() + 10_000,
      refusal: false,
    },
    [terminal.id]: {
      userId: 'user-1',
      order: terminal,
      signature: 'terminal-signature',
      dueAt: Date.now() - 1000,
      refusal: false,
    },
  };
  db.attempts = { 'user-1:legacy-attempt': pending.id };
  db.quotes = { 'user-1:legacy-quote': { ...pending } };
  save(db);
  return db;
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

describe('catalogue revision migration from the delivered legacy build', () => {
  it('replaces the actual commit34ba5b5 catalogue without deleting user or purchase state', async () => {
    expect(legacy.sourceCommit).toBe('34ba5b5');
    const before = seedLegacy();
    const account = structuredClone(before.users[0]);
    const orders = structuredClone(before.orders);
    const attempts = structuredClone(before.attempts);
    const latest = createNfts()[0];
    await initializeDatabase();
    const migrated = database();
    expect(migrated.nfts[0].title).toBe(latest.title);
    expect(migrated.nfts[0].image).toBe(latest.image);
    expect(migrated.nfts[0].price).toBe('1.19');
    expect(migrated.nfts[0].available).toBe(1);
    expect(migrated.nfts[0].version).toBe(8);
    expect(migrated.users[0]).toMatchObject({ ...account, cartVersion: 8 });
    expect(migrated.guestCart).toEqual({ 'nft-2': 1 });
    expect(migrated.guestVersion).toBe(10);
    expect(migrated.orders).toEqual(orders);
    expect(migrated.attempts).toEqual(attempts);
    expect(migrated.quotes).toEqual({});
    expect(migrated.currentUserId).toBe('user-1');
    expect(migrated.sequence).toBe(4242);
    expect(JSON.parse(localStorage.getItem(storageKey)!).catalogRevision).toBe(3);
  });
  it('refreshes edition prices while preserving every independent inventory count', async () => {
    const before = seedLegacy();
    const nft = before.nfts[0];
    ensureEditions(nft);
    setEditionAvailability(nft, 'one-of-one', 0);
    setEditionAvailability(nft, 'one-of-ten', 4);
    setEditionAvailability(nft, 'one-of-fifty', 1);
    setEditionAvailability(nft, 'open', 37);
    before.users[0].cart['nft-1::one-of-ten'] = 2;
    save(before);
    await initializeDatabase();
    const updated = database().nfts[0];
    expect(updated.editions?.map((edition) => edition.available)).toEqual([0, 4, 1, 37]);
    expect(updated.editions?.map((edition) => edition.price)).toEqual([
      '2.38',
      '1.4875',
      '1.19',
      '0.952',
    ]);
    expect(database().users[0].cart).toEqual({ 'nft-1': 2, 'nft-1::one-of-ten': 2 });
  });
  it('projects current artwork and price into existing cart items while preserving old receipt snapshots', async () => {
    seedLegacy();
    await initializeDatabase();
    const migrated = database();
    const cart = cartResponse(migrated);
    expect(cart.items[0]).toMatchObject({
      nftId: 'nft-1',
      quantity: 2,
      nft: { title: 'Emerald Ape #042', price: '1.19', image: createNfts()[0].image },
    });
    expect(migrated.orders['order-legacy-pending'].order.items[0]).toMatchObject({
      title: 'The future of ETH®',
      unitPrice: '0.32',
      image: '/art/nft-1.svg',
    });
    expect(migrated.orders['order-legacy-confirmed'].order.total).toBe('0.642');
  });
  it('runs once and preserves new scenario changes and quotes on subsequent initializations', async () => {
    seedLegacy();
    await initializeDatabase();
    const current = database();
    const version = current.nfts[0].version;
    const cartVersion = current.users[0].cartVersion;
    current.nfts[0].price = '7';
    current.quotes['keep-current-quote'] = receipt('quote-sentinel', 'confirmed');
    save(current);
    await initializeDatabase();
    expect(database().nfts[0].price).toBe('7');
    expect(database().nfts[0].version).toBe(version);
    expect(database().users[0].cartVersion).toBe(cartVersion);
    expect(database().quotes).toHaveProperty('keep-current-quote');
  });
  it('restores only the legacy pending reservation if that order is refused after migration', async () => {
    const before = seedLegacy();
    before.orders['order-legacy-pending'].refusal = true;
    save(before);
    await initializeDatabase();
    await vi.advanceTimersByTimeAsync(10_100);
    const migrated = database();
    expect(migrated.orders['order-legacy-pending'].order.status).toBe('refused');
    expect(migrated.orders['order-legacy-pending'].order.total).toBe('0.642');
    expect(selectEdition(migrated.nfts[0]).available).toBe(3);
    expect(migrated.nfts[0].price).toBe('1.19');
    expect(migrated.users[0].cart['nft-1']).toBe(2);
  });
  it('confirms a legacy order without repricing it or removing quantities added while pending', async () => {
    const before = seedLegacy();
    before.users[0].cart['nft-1'] = 3;
    save(before);
    await initializeDatabase();
    await vi.advanceTimersByTimeAsync(10_100);
    const migrated = database();
    expect(migrated.orders['order-legacy-pending'].order.status).toBe('confirmed');
    expect(migrated.orders['order-legacy-pending'].order.items[0].unitPrice).toBe('0.32');
    expect(migrated.users[0].cart['nft-1']).toBe(1);
    expect(migrated.nfts[0].available).toBe(1);
    expect(migrated.nfts[0].price).toBe('1.19');
  });
});
