import { test, expect } from '@playwright/test';

test('Socket.IO price event reconciles the visible cart and announces a changed quote', async ({
  page,
}) => {
  await page.goto('/nft/nft-1');
  await expect(
    page.getByRole('heading', { name: 'The future of ETH®', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await page.getByRole('button', { name: /Adicionar ao carrinho/i }).click();
  await page.getByRole('link', { name: /Ver carrinho/i }).click();
  await expect(page.locator('.cart-item-info .price')).toHaveText('0.32 ETH');
  await page.getByRole('button', { name: 'Open demo scenarios' }).click();
  await page.getByRole('button', { name: 'Simulate an NFT price update' }).click();
  await expect(
    page.getByRole('status').filter({
      hasText: 'Price and availability update sent through Socket.IO.',
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close demo scenarios' }).click();
  await expect(page.locator('.cart-item-info .price')).toHaveText('0.33 ETH');
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
  await expect(page.getByRole('heading', { name: /Seja dono do futuro/i })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Ver The future of ETH®', exact: true }),
  ).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('duplicate and older Socket.IO events do not regress the cart snapshot', async ({ page }) => {
  await page.goto('/nft/nft-1');
  await expect(
    page.getByRole('heading', { name: 'The future of ETH®', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await page.getByRole('button', { name: /Adicionar ao carrinho/i }).click();
  await page.getByRole('link', { name: /Ver carrinho/i }).click();
  await expect(page.locator('.cart-item-info .price')).toHaveText('0.32 ETH');
  const updateStatus = await page.evaluate(async () => {
    const response = await fetch('/api/demo/nft-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'nft-1' }),
    });
    return response.status;
  });
  expect(updateStatus).toBe(200);
  await expect(page.locator('.cart-item-info .price')).toHaveText('0.33 ETH');
  const replayStatus = await page.evaluate(async () => {
    const response = await fetch('/api/demo/nft-replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'nft-1' }),
    });
    return response.status;
  });
  expect(replayStatus).toBe(200);
  await expect(page.locator('.cart-item-info .price')).toHaveText('0.33 ETH');
  // An authoritative REST refetch after replay must agree with the visible state.
  await page.reload();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await expect(page.locator('.cart-item-info .price')).toHaveText('0.33 ETH');
});
