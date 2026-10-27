import { test, expect } from '@playwright/test';

test('session transport failures do not masquerade as a signed-out user and can recover', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await page.evaluate(() =>
    fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'server-error' }),
    }),
  );
  await page.goto('/profile?source=review#security');
  await expect(
    page.getByRole('heading', { name: 'Não foi possível verificar sua sessão' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Entrar para continuar' })).toHaveCount(0);
  await page.evaluate(() =>
    fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'default' }),
    }),
  );
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Entrar para continuar' })).toBeVisible();
  await page.getByRole('link', { name: 'Entrar para continuar' }).click();
  await expect(page).toHaveURL(/redirect=.*profile.*source/);
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/profile?source=review#security');
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: /^Entrar/ }).click();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
  const destination = new URL(page.url());
  expect(destination.pathname + destination.search + destination.hash).toBe(
    '/profile?source=review#security',
  );
});
