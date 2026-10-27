import { test, expect, type Page } from '@playwright/test';

const password = 'Collect0r!Demo';
async function addAsGuest(page: Page) {
  await page.goto('/nft/nft-1');
  await expect(page.getByRole('button', { name: /^Adicionar ao carrinho/ })).toBeVisible();
  await page.getByRole('button', { name: /^Adicionar ao carrinho/ }).click();
  await expect(page.getByText('A obra está no seu carrinho.')).toBeVisible();
}
async function login(page: Page, email = 'collector@example.test', redirect = '/cart') {
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(new RegExp(`${redirect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
}
async function reviewPurchase(page: Page) {
  await page.getByRole('link', { name: /^Continuar para pagamento/ }).click();
  await expect(page.getByRole('heading', { name: 'Pagamento seguro' })).toBeVisible();
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: /^Revisar compra/ }).click();
  await expect(page.getByRole('heading', { name: 'Revise sua compra' })).toBeVisible();
}
async function setScenario(page: Page, scenario: string) {
  const status = await page.evaluate(
    async (value) =>
      (
        await fetch('/api/demo/scenario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario: value }),
        })
      ).status,
    scenario,
  );
  expect(status).toBe(200);
}

test('guest cart merges on login, validates coupons and completes an immutable receipt', async ({
  page,
}) => {
  await addAsGuest(page);
  await login(page);
  await expect(page.locator('.cart-row')).toHaveCount(1);
  await page.getByLabel('Cupom de desconto').fill('INVALID');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: /coupon|cupom/i })).toBeVisible();
  await page.getByLabel('Cupom de desconto').fill('JUNGLE10');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await reviewPurchase(page);
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Compra confirmada!' })).toBeVisible();
  const orderUrl = page.url();
  const total = await page.locator('.order-summary .total dd').textContent();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Compra confirmada!' })).toBeVisible();
  await expect(page.locator('.order-summary .total dd')).toHaveText(total!);
  expect(page.url()).toBe(orderUrl);
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Sua coleção está esperando' })).toBeVisible();
});

test('declined payment preserves the cart and never displays a success receipt', async ({
  page,
}) => {
  await addAsGuest(page);
  await login(page);
  await reviewPurchase(page);
  await setScenario(page, 'payment-refused');
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Compra confirmada!' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Revisar carrinho e tentar novamente' }).click();
  await expect(page.locator('.cart-row')).toHaveCount(1);
});

test('timeout recovers the same persisted purchase after refresh', async ({ page }) => {
  await addAsGuest(page);
  await login(page);
  await reviewPurchase(page);
  await setScenario(page, 'order-timeout');
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Recuperar compra anterior' })).toBeEnabled({
    timeout: 12000,
  });
  await page.reload();
  await page.getByRole('button', { name: 'Recuperar compra anterior' }).click();
  await expect(page.getByRole('heading', { name: 'Compra confirmada!' })).toBeVisible();
  const orderUrl = page.url();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Compra confirmada!' })).toBeVisible();
  expect(page.url()).toBe(orderUrl);
  const orderCount = await page.evaluate(
    () => Object.keys(JSON.parse(localStorage.getItem('jungle.demo.database.v1')!).orders).length,
  );
  expect(orderCount).toBe(1);
});

test('profile and wallet validation persist while a second collector has isolated data', async ({
  page,
}) => {
  await login(page, 'collector@example.test', '/profile');
  await page.getByLabel('Nome de exibição').fill('Colecionador E2E');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByText('Seu perfil foi salvo.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Colecionador E2E');
  await page.goto('/wallets');
  await page.getByLabel('Nome da carteira', { exact: true }).fill('Carteira E2E');
  await page.getByLabel('Endereço da carteira', { exact: true }).fill('invalid-address');
  await page.getByRole('button', { name: 'Adicionar carteira', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(/0x/);
  await page.getByLabel('Endereço da carteira', { exact: true }).fill(`0x${'3'.repeat(40)}`);
  await page.getByRole('button', { name: 'Adicionar carteira', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Carteira E2E', exact: true })).toBeVisible();
  const mobileMenu = page.getByRole('button', { name: 'Abrir navegação' });
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  else await page.getByRole('button', { name: /Colecionador E2E/ }).click();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page).toHaveURL(/\/(?:\?.*)?$/);
  await login(page, 'second@example.test', '/wallets');
  await expect(page.getByRole('heading', { name: 'Carteira E2E', exact: true })).toHaveCount(0);
  await page.goto('/profile');
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Taylor Collector');
});
