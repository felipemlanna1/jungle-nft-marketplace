import { test, expect } from '@playwright/test';
test('slow data keeps skeletons, error state recovers through real network mocks', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.evaluate(() =>
    fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'slow' }),
    }),
  );
  await page.reload();
  await expect(page.locator('.nft-grid .skeleton').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
  await page.evaluate(() =>
    fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'server-error' }),
    }),
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Não foi possível carregar a coleção.' }),
  ).toBeVisible();
  await page.evaluate(() =>
    fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'default' }),
    }),
  );
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
});
test('unknown routes provide a real recovery link', async ({ page }) => {
  await page.goto('/not-a-route');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await page.getByRole('link', { name: 'Explorar NFTs' }).click();
  await expect(page.locator('#hero-title')).toBeVisible();
});
