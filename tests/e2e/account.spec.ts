import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, destination = '/profile') {
  await page.goto(`/login?redirect=${encodeURIComponent(destination)}`);
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
}

test('auth controls reveal passwords and report disconnected identity providers honestly', async ({
  page,
}, testInfo) => {
  await page.goto('/login');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Senha', { exact: true }).fill('Draft0nly!');
  await page.getByRole('button', { name: 'Mostrar senha', exact: true }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar senha', exact: true }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'password');
  await page.screenshot({
    path: `reports/account-${testInfo.project.name}-login.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Continuar com Google' }).click();
  await expect(page.getByRole('alert')).toContainText('não está conectado');
  await expect(page).toHaveURL(/\/login/);
  await page.getByRole('button', { name: 'Esqueceu sua senha?' }).click();
  await expect(page.getByRole('alert')).toContainText('recuperação de senha não está conectada');
  expect(await page.evaluate(() => sessionStorage.getItem('jungle.demo.session'))).toBeNull();
});

test('registration requires matching passwords and creates an isolated collector', async ({
  page,
}, testInfo) => {
  await page.goto('/register?redirect=%2Fprofile');
  await page.getByLabel('Nome completo', { exact: true }).fill('Nova Colecionadora');
  await page.getByLabel('E-mail', { exact: true }).fill('new.collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!New');
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Different0!');
  await page.screenshot({
    path: `reports/account-${testInfo.project.name}-register.png`,
    fullPage: true,
  });
  await page.locator('.auth-submit').click();
  await expect(page.getByRole('alert')).toHaveText('As senhas não coincidem.');
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Collect0r!New');
  await page.locator('.auth-submit').click();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
  await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue(
    'Nova Colecionadora',
  );
});

test('profile and expanded wallet data persist and secondary wallet controls are functional', async ({
  page,
}, testInfo) => {
  await login(page);
  await page.getByLabel('Nome de exibição', { exact: true }).fill('Colecionador visual');
  await page.getByLabel('Nome de usuário', { exact: true }).fill('collector.visual');
  await page.getByLabel('Nome ENS', { exact: true }).fill('visual');
  await page.getByLabel('Apelido da carteira', { exact: true }).fill('Meu acervo');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Seu perfil foi salvo.' })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nome de usuário', { exact: true })).toHaveValue('collector.visual');
  await expect(page.getByLabel('Nome ENS', { exact: true })).toHaveValue('visual');
  await page.screenshot({
    path: `reports/account-${testInfo.project.name}-profile.png`,
    fullPage: true,
  });
  await page.goto('/wallets');
  await page.getByLabel('Igual à carteira principal', { exact: true }).check();
  await expect(
    page.getByText('A carteira principal está selecionada para suas compras.'),
  ).toBeVisible();
  await page
    .locator('.secondary-wallet-actions')
    .getByRole('button', { name: 'Adicionar', exact: true })
    .click();
  await page.getByLabel('Nome da carteira', { exact: true }).fill('Carteira visual');
  await page.getByLabel('Tipo de carteira', { exact: true }).selectOption('WalletConnect');
  await page.getByLabel('Endereço da carteira', { exact: true }).fill('invalid');
  await page.getByRole('button', { name: 'Salvar carteira', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('0x');
  await page.getByLabel('Endereço da carteira', { exact: true }).fill(`0x${'4'.repeat(40)}`);
  await page.getByLabel('Nome do perfil', { exact: true }).fill('Coleção visual');
  await page.getByLabel('Tipo de carteira', { exact: true }).selectOption('WalletConnect');
  await page
    .getByLabel('ENS ou carteira secundária (opcional)', { exact: true })
    .fill('secondary.eth');
  await page.getByLabel('Nome ENS', { exact: true }).fill('wallet');
  await page.getByRole('button', { name: 'Salvar carteira', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Carteira salva.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Carteira visual', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Editar Carteira visual', exact: true }).click();
  await expect(page.getByLabel('Tipo de carteira', { exact: true })).toHaveValue('WalletConnect');
  await expect(page.getByLabel('Nome do perfil', { exact: true })).toHaveValue('Coleção visual');
  await expect(
    page.getByLabel('ENS ou carteira secundária (opcional)', { exact: true }),
  ).toHaveValue('secondary.eth');
  await page.screenshot({
    path: `reports/account-${testInfo.project.name}-wallets.png`,
    fullPage: true,
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
