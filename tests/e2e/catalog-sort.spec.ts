import { test, expect, type Page } from '@playwright/test';
import { toWei } from '../../src/domain/money';

function searchValue(page: Page, key: string) {
  const value = new URL(page.url()).searchParams.get(key);
  return value?.startsWith('"') ? (JSON.parse(value) as unknown) : value;
}

async function sortControl(page: Page, mobile: boolean) {
  if (mobile) {
    await page.getByRole('button', { name: 'Abrir filtros', exact: true }).click();
    return page.getByRole('combobox', { name: 'Ordenar NFTs', exact: true });
  }
  return page.getByRole('combobox', { name: 'Ordenar por:', exact: true });
}

async function expectPrices(page: Page, descending: boolean, minimum?: string, maximum?: string) {
  await expect
    .poll(async () => {
      const labels = await page.locator('.nft-grid .eth-price').allTextContents();
      const values = labels.map((label) => toWei(label.replace('ETH', '').trim()));
      return (
        values.length > 1 &&
        values.every(
          (value, index) =>
            (index === 0 ||
              (descending ? value <= values[index - 1] : value >= values[index - 1])) &&
            (minimum === undefined || value >= toWei(minimum)) &&
            (maximum === undefined || value <= toWei(maximum)),
        )
      );
    })
    .toBe(true);
}

test('the themed sort supports keyboard selection, Escape and focus restoration', async ({
  page,
  isMobile,
}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.nft-grid .nft-card').first()).toBeVisible();
  const trigger = await sortControl(page, isMobile);
  await expect(trigger).toContainText('Listados recentemente');
  await expect(trigger).toHaveCSS('font-size', '14px');
  if (!isMobile) await expect(trigger).toHaveCSS('width', '224px');
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const menu = page.getByRole('listbox');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS('background-color', 'rgb(56, 34, 15)');
  await expect(menu).toHaveCSS('font-size', '14px');
  await page.screenshot({
    path: `reports/catalog-sort-keyboard-${testInfo.project.name}.png`,
    fullPage: false,
  });
  const urlBeforeEscape = page.url();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(page.url()).toBe(urlBeforeEscape);
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('option', { name: 'Listados recentemente', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('option', { name: 'Maior preço', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/sort=price-desc/);
  await expectPrices(page, true);
  await page.reload();
  const restored = await sortControl(page, isMobile);
  await expect(restored).toContainText('Maior preço');
  await expectPrices(page, true);
});

test('price sorting by pointer preserves applied minimum and maximum filters after refresh', async ({
  page,
  isMobile,
}) => {
  await page.goto('/?network=Ethereum');
  await expect(page.locator('.nft-grid .nft-card').first()).toBeVisible();
  if (isMobile) await page.getByRole('button', { name: 'Abrir filtros', exact: true }).click();
  const filters = isMobile
    ? page.getByRole('dialog', { name: 'Filtrar NFTs' })
    : page.locator('.catalog-sidebar');
  await filters.getByLabel('Preço mínimo', { exact: true }).fill('0.7');
  await filters.getByLabel('Preço máximo', { exact: true }).fill('2');
  await filters.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect.poll(() => searchValue(page, 'minPrice')).toBe('0.7');
  await expect.poll(() => searchValue(page, 'maxPrice')).toBe('2');

  const ascending = await sortControl(page, isMobile);
  await ascending.click();
  const ascendingQuery = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/nfts' &&
      new URL(response.url()).searchParams.get('sort') === 'price-asc',
  );
  await page.getByRole('option', { name: 'Menor preço', exact: true }).click();
  expect((await ascendingQuery).status()).toBe(200);
  await expect(page).toHaveURL(/sort=price-asc/);
  await expectPrices(page, false, '0.7', '2');
  const descending = await sortControl(page, isMobile);
  await descending.click();
  const descendingQuery = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/nfts' &&
      new URL(response.url()).searchParams.get('sort') === 'price-desc',
  );
  await page.getByRole('option', { name: 'Maior preço', exact: true }).click();
  const response = await descendingQuery;
  expect(response.status()).toBe(200);
  const query = new URL(response.url()).searchParams;
  expect(query.get('minPrice')).toBe('0.7');
  expect(query.get('maxPrice')).toBe('2');
  expect(query.get('network')).toBe('Ethereum');
  await expect(page).toHaveURL(/sort=price-desc/);
  await expectPrices(page, true, '0.7', '2');
  await page.reload();
  await expectPrices(page, true, '0.7', '2');
  expect(searchValue(page, 'minPrice')).toBe('0.7');
  expect(searchValue(page, 'maxPrice')).toBe('2');
  expect(searchValue(page, 'network')).toBe('Ethereum');
  expect(searchValue(page, 'sort')).toBe('price-desc');
});
