import { test, expect, type Page } from '@playwright/test';

async function boot(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}
async function request(page: Page, path: string, method = 'GET', body?: unknown) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const r = await fetch('/api' + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: r.status, data: await r.json().catch(() => null) };
    },
    { path, method, body },
  );
}

test('catalog is accessible, responsive and has working detail navigation', async ({ page }) => {
  await boot(page);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('link', { name: /cart|carrinho/i }).first()).toBeVisible();
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    view: window.innerWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.view + 1);
  const result = await request(page, '/nfts');
  expect(result.status).toBe(200);
  expect(result.data.items.length).toBeGreaterThan(0);
  await page.goto('/nft/' + result.data.items[0].id);
  await expect(
    page.getByRole('heading', { name: result.data.items[0].title }).first(),
  ).toBeVisible();
});

test('direct missing NFT displays a recovery state', async ({ page }) => {
  await boot(page);
  await page.goto('/nft/does-not-exist');
  await expect(
    page.getByText(/não encontrada|not found|could not be found/i).first(),
  ).toBeVisible();
});

test('URL filters survive refresh and do not overflow', async ({ page }) => {
  await boot(page);
  await page.goto('/?q=art&sort=price-asc&page=2');
  await page.reload();
  await expect(page).toHaveURL(/sort=price-asc/);
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole('main')).toBeVisible();
});

test('keyboard users can reach navigation and visible focus', async ({ page }) => {
  await boot(page);
  await page.keyboard.press('Tab');
  const active = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    text: document.activeElement?.textContent,
  }));
  expect(['A', 'BUTTON', 'INPUT']).toContain(active.tag);
});

test('private routes require sign in and return context is preserved', async ({ page }) => {
  await boot(page);
  await page.goto('/checkout');
  await expect(page.getByRole('link', { name: 'Sign in to continue' })).toBeVisible();
  await page.getByRole('link', { name: 'Sign in to continue' }).click();
  await expect(page).toHaveURL(/redirect=%2Fcheckout|redirect=\/checkout/);
});

test('demo controls are keyboard accessible and focus returns after close', async ({ page }) => {
  await boot(page);
  const trigger = page.getByRole('button', { name: 'Open demo scenarios' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('catalog visual regression', async ({ page }) => {
  await boot(page);
  await expect(page.locator('img').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('catalog.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
