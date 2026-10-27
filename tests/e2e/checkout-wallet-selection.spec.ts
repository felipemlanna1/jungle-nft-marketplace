import { expect, test, type Page } from '@playwright/test';

async function post(page: Page, path: string, body: unknown) {
  return page.evaluate(
    async ({ path, body }) => {
      const response = await fetch('/api' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return { status: response.status, data: await response.json() };
    },
    { path, body },
  );
}

test('changing a saved wallet leaves manual mode and purchases with the selected API wallet', async ({
  page,
  isMobile,
}) => {
  await page.goto('/login?redirect=%2Fcart');
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/cart$/);
  expect((await post(page, '/cart/items', { nftId: 'nft-1', quantity: 1 })).status).toBe(200);
  const saved = await post(page, '/wallets', {
    label: 'Reserva E2E',
    address: '0x2222222222222222222222222222222222222222',
    network: 'Ethereum',
    walletType: 'WalletConnect',
    primary: false,
  });
  expect(saved.status).toBe(200);
  const reserve = saved.data.find((wallet: { label: string }) => wallet.label === 'Reserva E2E');
  expect(reserve.id).toBeTruthy();
  if (isMobile) await page.setViewportSize({ width: 440, height: 956 });
  await page.goto('/checkout');
  await expect(page.getByRole('button', { name: 'Conectar carteira', exact: true })).toBeEnabled();
  const manual = page.getByRole('checkbox', { name: 'Usar outra carteira?' });
  await manual.check();
  if (isMobile) {
    await page.getByRole('radio', { name: 'Reserva E2E', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Reserva E2E', exact: true })).toBeChecked();
    await expect(manual).not.toBeChecked();
  } else {
    await manual.uncheck();
    await page
      .getByRole('combobox', { name: 'Carteira salva', exact: true })
      .selectOption(reserve.id);
  }
  await expect(page.getByLabel('Endereço da carteira da compra', { exact: true })).toHaveValue(
    '0x2222222222222222222222222222222222222222',
  );
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar compra', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Revisão do pedido' })).toContainText(
    'Reserva E2E',
  );
  const submitted = page.waitForRequest(
    (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders',
  );
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  expect((await submitted).postDataJSON().walletId).toBe(reserve.id);
  await expect(page.getByRole('heading', { name: 'Compra confirmada!' })).toBeVisible();
});
