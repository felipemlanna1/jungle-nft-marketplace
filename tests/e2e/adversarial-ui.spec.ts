import { test, expect, type Page } from '@playwright/test';

async function boot(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.evaluate(async () => {
    await fetch('/api/demo/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });
  await page.reload();
  await expect(
    page
      .getByRole('heading', { name: /Arte extraordinária|futuro da arte|Descubra|Colecione/i })
      .first(),
  ).toBeVisible();
}
async function login(page: Page, email = 'collector@example.test') {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}
async function checkout(page: Page) {
  await page.goto('/nft/nft-1');
  await page.getByRole('button', { name: /Adicionar ao carrinho/i }).click();
  await expect(page.getByText('A obra está no seu carrinho.', { exact: false })).toBeVisible();
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: /Revisar compra/i }).click();
  await expect(page.getByRole('heading', { name: 'Revise sua compra' })).toBeVisible();
}

test('a changed quote requires a second explicit confirmation before any order exists', async ({
  page,
}) => {
  await boot(page);
  await login(page);
  await checkout(page);
  await page.evaluate(async () => {
    await fetch('/api/demo/nft-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'nft-1' }),
    });
  });
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: /changed.*confirm again|mudou.*confirm/i })
      .first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => Object.keys(JSON.parse(localStorage.getItem('jungle.demo.database.v1')!).orders).length,
    ),
  ).toBe(0);
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Compra confirmada!' })).toBeVisible();
});

test('favorites and private profile do not cross a logout and account switch', async ({ page }) => {
  await boot(page);
  await login(page);
  await page.goto('/nft/nft-1');
  await page.getByRole('button', { name: 'Adicionar aos favoritos', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Remover dos favoritos', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Alex Collector/ }).click();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await login(page, 'second@example.test');
  await page.goto('/nft/nft-1');
  await expect(
    page.getByRole('button', { name: 'Adicionar aos favoritos', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/profile');
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Taylor Collector');
});
