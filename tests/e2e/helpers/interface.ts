import { expect, type Page } from '@playwright/test';

export async function openOptions(page: Page) {
  const menu = page.getByRole('dialog', { name: /^(Menu|Sua conta)$/ });
  if (!(await menu.isVisible())) {
    const footer = page.getByRole('button', { name: 'Opções da demonstração', exact: true });
    const navigation = page.getByRole('button', { name: 'Abrir navegação', exact: true }).first();
    await expect(footer.or(navigation).first()).toBeVisible();
    if (await footer.isVisible()) await footer.click();
    else await navigation.click();
  }
  await expect(menu).toBeVisible();
}
export async function closeOptions(page: Page) {
  const menu = page.getByRole('dialog', { name: /^(Menu|Sua conta)$/ });
  await menu.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
  await expect(menu).not.toBeVisible();
}
export async function openDemoScenarios(page: Page) {
  await openOptions(page);
  await page.getByRole('button', { name: 'Open demo scenarios', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Explore todos os estados', exact: true }),
  ).toBeVisible();
}
export async function closeDemoScenarios(page: Page) {
  await page.getByRole('button', { name: 'Close demo scenarios', exact: true }).click();
  if (await page.getByRole('dialog', { name: /^(Menu|Sua conta)$/, includeHidden: true }).count())
    await closeOptions(page);
}
