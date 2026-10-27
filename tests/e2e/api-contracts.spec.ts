import { test, expect, type Page } from '@playwright/test';
async function api(page: Page, path: string, method = 'GET', body?: unknown) {
  return page.evaluate(
    async (args) => {
      const r = await fetch('/api' + args.path, {
        method: args.method,
        headers: { 'Content-Type': 'application/json' },
        body: args.body === undefined ? undefined : JSON.stringify(args.body),
      });
      return { status: r.status, data: await r.json().catch(() => null) };
    },
    { path, method, body },
  );
}
async function login(page: Page, email = 'collector@example.test') {
  return api(page, '/session/login', 'POST', { email, password: 'Collect0r!Demo' });
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await api(page, '/demo/reset', 'POST');
});

test('guest cart survives login; private resources never leak between accounts', async ({
  page,
}) => {
  expect((await api(page, '/cart/items', 'POST', { nftId: 'nft-1', quantity: 2 })).status).toBe(
    200,
  );
  const session = await login(page);
  expect(session.status).toBe(200);
  expect(session.data.passwordHash).toBeUndefined();
  expect((await api(page, '/cart')).data.items[0].quantity).toBe(2);
  await api(page, '/favorites', 'POST', { id: 'nft-1', active: true });
  await api(page, '/session/logout', 'POST');
  expect((await api(page, '/profile')).status).toBe(401);
  await login(page, 'second@example.test');
  expect((await api(page, '/cart')).data.items).toHaveLength(0);
  expect((await api(page, '/favorites')).data).toHaveLength(0);
});

test('idempotent order is unique, immutable and inaccessible to another user', async ({ page }) => {
  await login(page);
  await api(page, '/cart/items', 'POST', { nftId: 'nft-1', quantity: 1 });
  const quote = (await api(page, '/quote', 'POST', {})).data;
  const input = {
    quoteFingerprint: quote.fingerprint,
    idempotencyKey: 'e2e-attempt-one',
    walletId: 'wallet-1',
    network: 'Ethereum',
    collectorName: 'Alex Demo',
    collectorEmail: 'collector@example.test',
  };
  const first = await api(page, '/orders', 'POST', input);
  expect(first.status).toBe(200);
  const repeat = await api(page, '/orders', 'POST', input);
  expect(repeat.data.id).toBe(first.data.id);
  const conflict = await api(page, '/orders', 'POST', { ...input, collectorName: 'Different' });
  expect(conflict.status).toBe(409);
  await expect
    .poll(async () => (await api(page, '/orders/' + first.data.id)).data.status, { timeout: 8000 })
    .toBe('confirmed');
  const receipt = (await api(page, '/orders/' + first.data.id)).data;
  await api(page, '/demo/nft-update', 'POST', { id: 'nft-1' });
  expect((await api(page, '/orders/' + first.data.id)).data.total).toBe(receipt.total);
  expect((await api(page, '/cart')).data.items).toHaveLength(0);
  await api(page, '/session/logout', 'POST');
  await login(page, 'second@example.test');
  expect((await api(page, '/orders/' + first.data.id)).status).toBe(404);
  expect((await api(page, '/orders/attempt/e2e-attempt-one')).data).toBeNull();
});

test('price change invalidates an accepted quote before order creation', async ({ page }) => {
  await login(page);
  await api(page, '/cart/items', 'POST', { nftId: 'nft-2', quantity: 1 });
  const quote = (await api(page, '/quote', 'POST', {})).data;
  await api(page, '/demo/nft-update', 'POST', { id: 'nft-2' });
  const order = await api(page, '/orders', 'POST', {
    quoteFingerprint: quote.fingerprint,
    idempotencyKey: 'price-conflict',
    walletId: 'wallet-1',
    network: 'Ethereum',
    collectorName: 'Alex Demo',
    collectorEmail: 'collector@example.test',
  });
  expect(order.status).toBe(409);
  expect((await api(page, '/cart')).data.items).toHaveLength(1);
});

test('validation rejects bad quantities, profile values and wallet addresses', async ({ page }) => {
  await login(page);
  for (const quantity of [-1, 0, 1.5, 999])
    expect(
      (await api(page, '/cart/items', 'POST', { nftId: 'nft-1', quantity })).status,
    ).toBeGreaterThanOrEqual(400);
  expect(
    (
      await api(page, '/wallets', 'POST', {
        label: 'Invalid',
        address: 'javascript:alert(1)',
        network: 'Ethereum',
      })
    ).status,
  ).toBe(400);
  expect(
    (await api(page, '/profile', 'PATCH', { name: '', avatar: 'javascript:alert(1)' })).status,
  ).toBe(400);
  expect((await api(page, '/favorites', 'POST', { id: 'nft-1', active: 'yes' })).status).toBe(400);
});

test('duplicate registration and session expiration are explicit failures', async ({ page }) => {
  expect(
    (
      await api(page, '/session/register', 'POST', {
        name: 'Demo',
        email: 'collector@example.test',
        password: 'Collect0r!Demo',
      })
    ).status,
  ).toBe(409);
  await login(page);
  await api(page, '/demo/scenario', 'POST', { scenario: 'expired' });
  expect((await api(page, '/session')).data).toBeNull();
  expect((await api(page, '/wallets')).status).toBe(401);
});
