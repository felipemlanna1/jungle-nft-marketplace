import { openDemoScenarios, closeDemoScenarios } from './helpers/interface';
import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, redirect: string) {
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(new RegExp(`${redirect}$`));
}

async function changeRemoteProfileAndRefetch(page: Page) {
  const status = await page.evaluate(async () => {
    const generation = sessionStorage.getItem('jungle:transport-generation') ?? '';
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Demo-Session': generation },
      body: JSON.stringify({ name: 'Remote account update' }),
    });
    return response.status;
  });
  expect(status).toBe(200);
  await openDemoScenarios(page);
  // This actual interface action invalidates the session query; no private cache setter is used.
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().endsWith('/api/session') && response.status() === 200,
    ),
    page.getByLabel('Rede e pagamento').selectOption('empty'),
  ]);
  await closeDemoScenarios(page);
}

test('profile draft survives a changed account response for the same user', async ({ page }) => {
  await login(page, '/profile');
  const name = page.getByLabel('Nome de exibição', { exact: true });
  await expect(name).toHaveValue('Alex Collector');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width + 1,
  );
  await name.fill('My unsaved collector draft');
  await changeRemoteProfileAndRefetch(page);
  await expect(name).toHaveValue('My unsaved collector draft');
});

test('checkout collector draft survives session refetch for the same user', async ({ page }) => {
  await page.goto('/nft/nft-1');
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click();
  await expect(page.getByText('A obra está no seu carrinho.')).toBeVisible();
  await login(page, '/checkout');
  const name = page.getByLabel('Nome completo', { exact: true });
  await expect(name).toHaveValue('Alex Collector');
  await name.fill('Unsaved checkout name');
  await changeRemoteProfileAndRefetch(page);
  await expect(name).toHaveValue('Unsaved checkout name');
});
