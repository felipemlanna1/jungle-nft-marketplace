import { prepareVisualPage } from './helpers/visual';
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
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible();
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await prepareVisualPage(page);
  await expect(page).toHaveScreenshot('detail.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
test('cart visual regression', async ({ page }) => {
  await api(page, '/cart/items', { nftId: 'nft-1', quantity: 1 });
  await page.goto('/cart');
  await expect(page.locator('.commerce-cart-unit-price')).toContainText('1.19 ETH');
  await expect(page.locator('.order-summary')).toContainText('ETH');
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await prepareVisualPage(page);
  await expect(page).toHaveScreenshot('cart.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
test('payment visual regression', async ({ page, isMobile }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  if (isMobile) {
    await expect(page.getByRole('link', { name: 'Perfil', exact: true })).toBeVisible();
  } else {
    await expect(page.getByRole('button', { name: /Alex Collector/ })).toBeVisible();
  }
  await api(page, '/cart/items', { nftId: 'nft-1', quantity: 1 });
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Pagamento seguro', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Conectar carteira', exact: true })).toBeEnabled();
  await expect(page.locator('.order-summary')).toContainText('1.206');
  await expect(page.locator('.connection-dot')).toHaveClass(/connected/);
  await prepareVisualPage(page);
  await expect(page).toHaveScreenshot('payment.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
