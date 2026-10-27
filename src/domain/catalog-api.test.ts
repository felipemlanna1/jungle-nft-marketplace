// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import { database, initializeDatabase, save } from '../mocks/database';
import { cartSchema, catalogSchema, nftSchema, userSchema, walletsSchema } from './schemas';
import { selectEdition } from './editions';
import { fromWei, toWei } from './money';
import type { NFT } from '../contracts';
vi.stubGlobal('crypto', webcrypto);
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(async () => {
  localStorage.clear();
  await initializeDatabase(true);
});
const request = (path: string, method = 'GET', body?: unknown) =>
  fetch(`${location.origin}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
function authenticate() {
  const db = database();
  db.currentUserId = db.users[0].id;
  db.expiresAt = Date.now() + 60_000;
  save(db);
  return db;
}
describe('catalogue and account HTTP contracts', () => {
  it.each(['1', [1], true])('rejects nonnumeric quantity payload %j', async (quantity) => {
    expect((await request('/cart/items', 'POST', { nftId: 'nft-1', quantity })).status).toBe(400);
    expect(database().guestCart).toEqual({});
  });
  it('serializes competing purchases so a unique edition is reserved only once', async () => {
    const db = authenticate();
    db.users[0].cart = { 'nft-1::one-of-one': 1 };
    save(db);
    const quote = await (await request('/quote', 'POST', {})).json();
    const input = {
      quoteFingerprint: quote.fingerprint,
      walletId: 'wallet-1',
      network: 'Ethereum',
      collectorName: 'Demo Collector',
      collectorEmail: 'collector@example.test',
    };
    const responses = await Promise.all([
      request('/orders', 'POST', { ...input, idempotencyKey: 'competing-attempt-one' }),
      request('/orders', 'POST', { ...input, idempotencyKey: 'competing-attempt-two' }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect(Object.keys(database().orders)).toHaveLength(1);
    expect(selectEdition(database().nfts[0], 'one-of-one').available).toBe(0);
  });
  it('adds, updates and removes one edition without merging or deleting another edition', async () => {
    expect((await request('/cart/items', 'POST', { nftId: 'nft-1', quantity: 1 })).status).toBe(
      200,
    );
    const added = await request('/cart/items', 'POST', {
      nftId: 'nft-1',
      quantity: 2,
      editionId: 'one-of-ten',
    });
    const cart = cartSchema.parse(await added.json());
    expect(cart.items.map((item) => item.id)).toEqual(['nft-1', 'nft-1::one-of-ten']);
    expect(cart.items[1].nft.price).toBe(selectEdition(database().nfts[0], 'one-of-ten').price);
    const key = encodeURIComponent('nft-1::one-of-ten');
    const patched = cartSchema.parse(
      await (await request(`/cart/items/${key}`, 'PATCH', { quantity: 3 })).json(),
    );
    expect(patched.items[1].quantity).toBe(3);
    const removed = cartSchema.parse(await (await request(`/cart/items/${key}`, 'DELETE')).json());
    expect(removed.items.map((item) => item.id)).toEqual(['nft-1']);
    expect(
      (await request('/cart/items', 'POST', { nftId: 'nft-1', quantity: 1, editionId: 'unknown' }))
        .status,
    ).toBe(404);
  });
  it('merges guest quantities within each edition independently at login', async () => {
    const db = database();
    db.guestCart = { 'nft-1': 2, 'nft-1::one-of-ten': 2 };
    db.users[0].cart = { 'nft-1': 1, 'nft-1::one-of-ten': 2 };
    save(db);
    const response = await request('/session/login', 'POST', {
      email: 'collector@example.test',
      password: 'Collect0r!Demo',
    });
    expect(response.status).toBe(200);
    expect(database().users[0].cart).toEqual({ 'nft-1': 3, 'nft-1::one-of-ten': 4 });
    expect(database().guestCart).toEqual({});
  });
  it('updates the default edition through the event endpoint while preserving other edition prices', async () => {
    const before = database().nfts[0];
    const originalVariant = selectEdition(before, 'one-of-ten').price;
    const response = await request('/demo/nft-update', 'POST', { id: before.id });
    expect(response.status).toBe(200);
    const updated = nftSchema.parse(await response.json());
    expect(updated.price).toBe(fromWei(toWei(before.price) + toWei('0.01')));
    expect(selectEdition(updated).price).toBe(updated.price);
    expect(selectEdition(updated, 'one-of-ten').price).toBe(originalVariant);
  });
  it('returns combinable exact-price results and real global facets', async () => {
    const db = database();
    db.nfts = [
      {
        ...db.nfts[0],
        id: 'exact-low',
        category: 'Music',
        price: '0.100000000000000001',
        network: 'Polygon',
      },
      {
        ...db.nfts[0],
        id: 'exact-high',
        category: 'Music',
        price: '0.100000000000000002',
        network: 'Polygon',
      },
      { ...db.nfts[0], id: 'other', category: 'Art', price: '0.5', network: 'Ethereum' },
    ];
    save(db);
    const response = await request(
      '/nfts?category=Music&network=Polygon&minPrice=0.100000000000000002&maxPrice=0.100000000000000002',
    );
    expect(response.status).toBe(200);
    const catalogue = catalogSchema.parse(await response.json());
    expect(catalogue.items.map((nft) => nft.id)).toEqual(['exact-high']);
    expect(catalogue.total).toBe(1);
    expect(catalogue.facets).toEqual({
      categories: { Music: 2, Art: 1 },
      networks: { Polygon: 2, Ethereum: 1 },
    });
  });
  it.each(['minPrice=1e2', 'minPrice=-1', 'minPrice=2&maxPrice=1', 'network=Unknown'])(
    'rejects invalid query %s',
    async (query) => {
      expect((await request(`/nfts?${query}`)).status).toBe(400);
    },
  );
  it('round-trips profile fields through the public allowlist', async () => {
    authenticate();
    const response = await request('/profile', 'PATCH', {
      name: 'Demo display',
      username: 'demo.collector',
      email: 'updated@example.test',
      ens: 'demo-collector.eth',
      walletNickname: 'Demo primary',
      passwordHash: 'must never be accepted',
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    const profile = userSchema.parse(data);
    expect(profile).toMatchObject({
      name: 'Demo display',
      username: 'demo.collector',
      email: 'updated@example.test',
      ens: 'demo-collector.eth',
      walletNickname: 'Demo primary',
    });
    expect(data.passwordHash).toBeUndefined();
    expect((await (await request('/profile')).json()).username).toBe('demo.collector');
    expect(database().users[1].email).toBe('second@example.test');
  });
  it('rejects identity conflicts atomically without changing other profile fields', async () => {
    const db = authenticate();
    const before = { name: db.users[0].name, email: db.users[0].email };
    const response = await request('/profile', 'PATCH', {
      name: 'Should not persist',
      email: 'second@example.test',
    });
    expect(response.status).toBe(409);
    expect(database().users[0]).toMatchObject(before);
  });
  it('persists every optional wallet field and validates the secondary address', async () => {
    authenticate();
    const response = await request('/wallets', 'POST', {
      label: 'Demo vault',
      address: `0x${'a'.repeat(40)}`,
      network: 'Polygon',
      primary: false,
      displayName: 'Demo wallet',
      profileName: 'Demo Collector',
      secondaryAddress: 'demo-collector.eth',
      walletType: 'WalletConnect',
      referralCode: 'DEMO-CODE',
      email: 'wallet@example.test',
      ens: 'demo-vault.eth',
    });
    expect(response.status).toBe(200);
    const wallets = walletsSchema.parse(await response.json());
    expect(wallets.at(-1)).toMatchObject({
      displayName: 'Demo wallet',
      profileName: 'Demo Collector',
      secondaryAddress: 'demo-collector.eth',
      walletType: 'WalletConnect',
      referralCode: 'DEMO-CODE',
      email: 'wallet@example.test',
      ens: 'demo-vault.eth',
    });
    const invalid = await request('/wallets', 'POST', {
      label: 'Invalid',
      address: `0x${'b'.repeat(40)}`,
      network: 'Ethereum',
      secondaryAddress: 'private recovery phrase',
    });
    expect(invalid.status).toBe(400);
    expect(database().users[0].wallets).toHaveLength(2);
  });
  it('adds new catalogue metadata without deleting existing cart or account state', async () => {
    const db = authenticate();
    db.users[0].cart = { 'nft-1': 2 };
    const old = db.nfts[0] as Partial<NFT>;
    delete old.network;
    delete old.releasedAt;
    delete old.popularity;
    save(db);
    await initializeDatabase();
    expect(database().nfts[0]).toMatchObject({
      network: expect.any(String),
      releasedAt: expect.any(Number),
      popularity: expect.any(Number),
    });
    expect(database().users[0].cart).toEqual({ 'nft-1': 2 });
    expect(database().currentUserId).toBe('user-1');
  });
});
