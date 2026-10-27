import { test, expect, type Page } from '@playwright/test';
async function api(page: Page, path: string, body: unknown) {
  return page.evaluate(
    async ({ path, body }) => {
      const r = await fetch('/api' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return r.status;
    },
    { path, body },
  );
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('jungle.marketplace.theme', 'kurio'));
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
});
test('detail visual regression', async ({ page }) => {
  await page.goto('/nft/nft-1');
  await expect(
    page.getByRole('heading', { name: 'The future of ETH®', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await expect(page).toHaveScreenshot('detail.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
test('cart visual regression', async ({ page }) => {
  await api(page, '/cart/items', { nftId: 'nft-1', quantity: 1 });
  await page.goto('/cart');
  await expect(page.locator('.cart-item-info .price')).toHaveText('0.32 ETH');
  await expect(page.locator('.summary-card')).toContainText('ETH');
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await expect(page).toHaveScreenshot('cart.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
test('payment visual regression', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('button', { name: /Alex Collector/ })).toBeVisible();
  await api(page, '/cart/items', { nftId: 'nft-1', quantity: 1 });
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Pagamento seguro', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Conectar carteira', exact: true })).toBeEnabled();
  await expect(page.locator('.summary-card')).toContainText('0.322');
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await expect(page).toHaveScreenshot('payment.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
