import { test, expect } from '@playwright/test';
import { openOptions } from './helpers/interface';

test('account menu hands favorites to the detail route and restores the outer trigger on close', async ({
  page,
  isMobile,
}) => {
  await page.goto('/login?redirect=%2F');
  await page.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  await page.getByLabel('Senha', { exact: true }).press('Enter');
  const favorite = page.getByRole('button', {
    name: 'Adicionar Sage Nomad #009 aos favoritos',
    exact: true,
  });
  await favorite.click();
  await expect(
    page.getByRole('button', { name: 'Remover Sage Nomad #009 dos favoritos', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const trigger = isMobile
    ? page
        .locator('.mobile-bottom-nav')
        .getByRole('button', { name: 'Abrir navegação', exact: true })
    : page.locator('.header-actions').getByRole('button', { name: /Alex Collector/ });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'Sua conta', exact: true });
  await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  const list = page.getByRole('dialog', { name: 'Lista de interesse', exact: true });
  await expect(list).toBeVisible();
  await expect(menu).toHaveCount(0);
  await list.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
  await expect(list).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  await list.getByRole('link', { name: /Sage Nomad #009/ }).click();
  await expect(page).toHaveURL(/\/nft\/nft-2$/);
  await expect(page.getByRole('heading', { name: 'Sage Nomad #009', exact: true })).toBeVisible();
  await expect(menu).toHaveCount(0);
  await expect(list).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Comprar NFT', exact: true })).toBeEnabled();
});

test('guest favorites navigate to a single usable login dialog without reopening the menu', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
  const footer = page.getByRole('button', { name: 'Opções da demonstração', exact: true });
  const trigger = (await footer.isVisible())
    ? footer
    : page.getByRole('button', { name: 'Abrir navegação', exact: true }).first();
  await openOptions(page);
  const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
  await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  const list = page.getByRole('dialog', { name: 'Lista de interesse', exact: true });
  await expect(list).toBeVisible();
  await expect(menu).toHaveCount(0);
  await list.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
  await expect(trigger).toBeFocused();
  await openOptions(page);
  await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  await list.getByRole('link', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?/);
  const login = page.getByRole('dialog', { name: 'Entrar', exact: true });
  await expect(login).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(menu).toHaveCount(0);
  await expect(list).toHaveCount(0);
  await expect
    .poll(() => login.evaluate((node) => node.contains(document.activeElement)))
    .toBe(true);
  await login.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  await login.getByLabel('Senha', { exact: true }).press('Enter');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(menu).toHaveCount(0);
  await expect(list).toHaveCount(0);
});
