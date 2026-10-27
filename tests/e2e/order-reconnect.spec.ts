import { test, expect, type Page } from '@playwright/test';
import { closeDemoScenarios, openDemoScenarios } from './helpers/interface';

async function prepareDisconnectedCheckout(page: Page) {
  await page.goto('/login?redirect=%2F');
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  const added = await page.evaluate(async () => {
    const response = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nftId: 'nft-1', quantity: 1, editionId: 'one-of-ten' }),
    });
    return response.status;
  });
  expect(added).toBe(200);
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar compra', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Revisão do pedido' })).toBeVisible();
  await openDemoScenarios(page);
  await page.getByRole('button', { name: 'Desconectar tempo real', exact: true }).click();
  await expect(page.locator('.connection-dot')).not.toHaveClass(/connected/);
  await closeDemoScenarios(page);
}

test('a pending edition purchase finishes offline and preserves its receipt after Socket.IO reconnect', async ({
  page,
}) => {
  await prepareDisconnectedCheckout(page);
  const creation = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/orders' && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  const response = await creation;
  expect(response.status()).toBe(200);
  const created = await response.json();
  expect(created.status).toBe('pending');
  expect(created.items[0].editionId).toBe('one-of-ten');
  await expect(
    page.getByRole('heading', { name: 'Seu pedido está em processamento', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Compra confirmada!', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.connection-dot')).not.toHaveClass(/connected/);
  await expect(page.locator('.commerce-receipt-meta')).toContainText(`${created.total} ETH`);
  await expect(page.locator('.commerce-receipt-items')).toContainText('1/10');
  await page.getByRole('button', { name: 'Fechar comprovante', exact: true }).click();
  await expect(page.locator('#hero-title')).toBeVisible();
  await openDemoScenarios(page);
  await page.getByRole('button', { name: 'Reconectar tempo real', exact: true }).click();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await closeDemoScenarios(page);
  await page.goto(`/orders/${created.id}`);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Compra confirmada!', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.commerce-receipt-meta')).toContainText(`${created.total} ETH`);
  const state = await page.evaluate(() => {
    const database = JSON.parse(localStorage.getItem('jungle.demo.database.v1')!);
    return { orders: Object.keys(database.orders), cart: database.users[0].cart };
  });
  expect(state.orders).toEqual([created.id]);
  expect(state.cart['nft-1::one-of-ten']).toBeUndefined();
});

// This test controls Date only. REST requests, Socket.IO and browser interactions stay real.
// It exercises reconnection before the model deadline without racing six clicks against two seconds.
test('Socket.IO reconnect reconciles a still-pending order before a controlled deadline', async ({
  page,
}) => {
  const now = Date.now();
  await page.clock.setFixedTime(now);
  await prepareDisconnectedCheckout(page);
  const creation = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/orders' && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  const response = await creation;
  expect(response.status()).toBe(200);
  const created = await response.json();
  expect(created.status).toBe('pending');
  await expect(
    page.getByRole('heading', { name: 'Seu pedido está em processamento', exact: true }),
  ).toBeVisible();
  await openDemoScenarios(page);
  await page.getByRole('button', { name: 'Reconectar tempo real', exact: true }).click();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await closeDemoScenarios(page);
  const beforeDeadline = await page.evaluate(async (id: string) => {
    const response = await fetch(`/api/orders/${id}`);
    return { status: response.status, order: await response.json() };
  }, created.id);
  expect(beforeDeadline.status).toBe(200);
  expect(beforeDeadline.order.status).toBe('pending');
  await expect(
    page.getByRole('heading', { name: 'Seu pedido está em processamento', exact: true }),
  ).toBeVisible();
  await page.clock.setFixedTime(created.createdAt + 2_100);
  await expect(
    page.getByRole('heading', { name: 'Compra confirmada!', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.commerce-receipt-meta')).toContainText(`${created.total} ETH`);
  const orders = await page.evaluate(() =>
    Object.keys(JSON.parse(localStorage.getItem('jungle.demo.database.v1')!).orders),
  );
  expect(orders).toEqual([created.id]);
});
