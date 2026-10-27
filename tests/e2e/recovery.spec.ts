import { test, expect } from '@playwright/test';
import type { Order, Quote, User, Wallet } from '../../src/contracts';
import type { PurchaseAttempt } from '../../src/modules/checkout/attempt';

test('opening an older receipt preserves an uncertain purchase and recovery never duplicates it', async ({
  page,
}) => {
  test.setTimeout(45_000);
  await page.goto('/login?redirect=%2F');
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/(?:\?.*)?$/);
  await expect(page.getByRole('dialog', { name: 'Entrar', exact: true })).toHaveCount(0);

  const previous = await page.evaluate(async () => {
    async function request<T>(path: string, body?: unknown): Promise<T> {
      const response = await fetch(`/api/${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json() as Promise<T>;
    }
    const user = await request<User>('session');
    const wallets = await request<Wallet[]>('wallets');
    const wallet = wallets.find((item) => item.primary)!;
    await request('cart/items', { nftId: 'nft-1', quantity: 1 });
    const quote = await request<Quote>('quote', {});
    const order = await request<Order>('orders', {
      quoteFingerprint: quote.fingerprint,
      idempotencyKey: crypto.randomUUID(),
      walletId: wallet.id,
      network: wallet.network,
      collectorName: user.name,
      collectorEmail: user.email,
    });
    return { order, userId: user.id };
  });
  await expect
    .poll(() =>
      page.evaluate(async (id) => {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) throw new Error(`Order lookup: ${response.status}`);
        return ((await response.json()) as Order).status;
      }, previous.order.id),
    )
    .toBe('confirmed');

  await page.goto('/nft/nft-1');
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click();
  await expect(page.getByText('A obra está no seu carrinho.')).toBeVisible();
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Conectar e finalizar', exact: true }).click();
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar compra', exact: true }).click();
  const scenarioStatus = await page.evaluate(async () => {
    const response = await fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'order-timeout' }),
    });
    return response.status;
  });
  expect(scenarioStatus).toBe(200);
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Recuperar compra anterior' })).toBeEnabled({
    timeout: 12_000,
  });
  const attemptKey = `kurio:purchase-attempt:${previous.userId}`;
  const uncertain = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as PurchaseAttempt,
    attemptKey,
  );
  expect(uncertain.userId).toBe(previous.userId);
  expect(uncertain.orderId).toBeUndefined();
  const committed = await page.evaluate(async (key) => {
    const response = await fetch(`/api/orders/attempt/${key}`);
    if (!response.ok) throw new Error(`Attempt lookup: ${response.status}`);
    return (await response.json()) as Order;
  }, uncertain.input.idempotencyKey);
  expect(committed.id).not.toBe(previous.order.id);
  expect(committed.status).toBe('confirmed');

  await page.goto(`/orders/${previous.order.id}`);
  await expect(
    page.getByRole('heading', { name: 'Compra confirmada!', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.commerce-receipt-order-id')).toHaveText(
    `Pedido ${previous.order.id}`,
  );
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), attemptKey)).toEqual(
    uncertain,
  );

  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Recuperar compra anterior' }).click();
  await expect(page).toHaveURL(new RegExp(`/orders/${committed.id}$`));
  await expect(
    page.getByRole('heading', { name: 'Compra confirmada!', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.commerce-receipt-order-id')).toHaveText(`Pedido ${committed.id}`);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), attemptKey)).toBeNull();
  const orders = await page.evaluate(() =>
    Object.keys(JSON.parse(localStorage.getItem('jungle.demo.database.v1')!).orders),
  );
  expect(orders.sort()).toEqual([previous.order.id, committed.id].sort());
});
