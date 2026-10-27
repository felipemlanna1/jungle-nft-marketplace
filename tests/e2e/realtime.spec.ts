import { openDemoScenarios, closeDemoScenarios } from './helpers/interface';
import { test, expect } from '@playwright/test';
import { DEMO_LOGIN } from '../../src/config/demo';

test('Socket.IO price event reconciles the visible cart and announces a changed quote', async ({
  page,
}, testInfo) => {
  await page.goto('/nft/nft-1');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click();
  await page.getByRole('link', { name: /Ver carrinho/i }).click();
  await expect(page.locator('.commerce-cart-item-total')).toHaveText(/Total do item:\s*1\.19 ETH/);
  await expect(page.locator('.commerce-cart-summary .total dd')).toHaveText('1.206 ETH');
  if (testInfo.project.name === 'mobile') {
    const status = await page.evaluate(async () => {
      const response = await fetch('/api/demo/nft-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'nft-1' }),
      });
      return response.status;
    });
    expect(status).toBe(200);
  } else {
    await openDemoScenarios(page);
    await page.getByRole('button', { name: 'Simulate an NFT price update' }).click();
    await expect(
      page.getByRole('status').filter({
        hasText: 'Price and availability update sent through Socket.IO.',
      }),
    ).toBeVisible();
    await closeDemoScenarios(page);
  }
  await expect(page.locator('.commerce-cart-item-total')).toHaveText(/Total do item:\s*1\.2 ETH/);
  await page.locator('.commerce-cart-item-total').scrollIntoViewIfNeeded();
  await expect(page.locator('.commerce-cart-item-total')).toBeInViewport();
  await expect(page.locator('.commerce-cart-summary .total dd')).toHaveText('1.216 ETH');
  await expect(
    page
      .getByRole('status')
      .filter({
        hasText: /A collectible price or availability changed|preço.*disponibilidade|cotação.*mud/i,
      })
      .first(),
  ).toBeVisible();
});

test('tablet 768px preserves content without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('duplicate and older Socket.IO events do not regress the cart snapshot', async ({ page }) => {
  await page.goto('/nft/nft-1');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click();
  await page.getByRole('link', { name: /Ver carrinho/i }).click();
  await expect(page.locator('.commerce-cart-item-total')).toHaveText(/Total do item:\s*1\.19 ETH/);
  const updateStatus = await page.evaluate(async () => {
    const response = await fetch('/api/demo/nft-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'nft-1' }),
    });
    return response.status;
  });
  expect(updateStatus).toBe(200);
  await expect(page.locator('.commerce-cart-item-total')).toHaveText(/Total do item:\s*1\.2 ETH/);
  const replayStatus = await page.evaluate(async () => {
    const response = await fetch('/api/demo/nft-replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'nft-1' }),
    });
    return response.status;
  });
  expect(replayStatus).toBe(200);
  await expect(page.locator('.commerce-cart-item-total')).toHaveText(/Total do item:\s*1\.2 ETH/);
  // An authoritative REST refetch after replay must agree with the visible state.
  await page.reload();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await expect(page.locator('.commerce-cart-item-total')).toHaveText(/Total do item:\s*1\.2 ETH/);
});

test('decreasing a selected quantity recovers after Socket.IO reduces its inventory limit', async ({
  page,
}) => {
  await page.goto('/login?redirect=%2Fnft%2Fnft-1');
  await page.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  await page.getByLabel('Senha', { exact: true }).press('Enter');
  const quantity = page.getByRole('spinbutton', { name: 'Quantidade', exact: true });
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await expect(quantity).toHaveAttribute('max', '3');
  await quantity.fill('3');
  await expect(quantity).toHaveValue('3');
  const order = await page.evaluate(async (email) => {
    async function post(path: string, body: unknown) {
      const response = await fetch(`/api/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    }
    await post('cart/items', { nftId: 'nft-1', quantity: 2 });
    const quote = await post('quote', {});
    return post('orders', {
      quoteFingerprint: quote.fingerprint,
      idempotencyKey: crypto.randomUUID(),
      walletId: 'wallet-1',
      network: 'Ethereum',
      collectorName: 'Inventory regression collector',
      collectorEmail: email,
    });
  }, DEMO_LOGIN.email);
  expect(order.status).toBe('pending');
  await expect(quantity).toHaveAttribute('max', '1');
  await expect(quantity).toHaveValue('3');
  const decrease = page.getByRole('button', { name: 'Diminuir Quantidade', exact: true });
  await expect(decrease).toBeEnabled();
  await decrease.click();
  await expect(quantity).toHaveValue('1');
  await expect(page.getByRole('button', { name: 'Comprar NFT', exact: true })).toBeEnabled();
});
