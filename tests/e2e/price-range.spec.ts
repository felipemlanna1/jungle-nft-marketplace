import { test, expect, type Page } from '@playwright/test';

async function filtersFor(page: Page, mobile: boolean) {
  if (mobile) await page.getByRole('button', { name: 'Abrir filtros', exact: true }).click();
  return mobile
    ? page.getByRole('dialog', { name: 'Filtrar NFTs', exact: true })
    : page.locator('.catalog-sidebar');
}

function searchValue(page: Page, key: string) {
  const value = new URL(page.url()).searchParams.get(key);
  return value?.startsWith('"') ? (JSON.parse(value) as unknown) : value;
}

test('real price targets accept pointer and keyboard input without rounding the other ETH boundary', async ({
  page,
  isMobile,
}) => {
  await page.goto('/?network=Ethereum');
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
  const filters = await filtersFor(page, isMobile);
  const minimum = filters.getByLabel('Preço mínimo', { exact: true });
  const maximum = filters.getByLabel('Preço máximo', { exact: true });
  const minSlider = filters.getByRole('slider', { name: 'Preço mínimo em ETH', exact: true });
  const maxSlider = filters.getByRole('slider', { name: 'Preço máximo em ETH', exact: true });
  await maxSlider.scrollIntoViewIfNeeded();
  const minBox = await minSlider.boundingBox();
  const maxBox = await maxSlider.boundingBox();
  if (!minBox || !maxBox) throw new Error('Both price targets must be visible.');
  for (const box of [minBox, maxBox]) {
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
  expect(minBox.x + minBox.width).toBeLessThan(maxBox.x);
  const exactMinimum = '0.123456789012345678';
  await minimum.fill(exactMinimum);
  const before = await maximum.inputValue();
  // Start outside the visible 15px circle, inside the actual 24px pointer target.
  await page.mouse.move(maxBox.x + maxBox.width / 2, maxBox.y + maxBox.height - 1);
  await page.mouse.down();
  await page.mouse.move(maxBox.x + maxBox.width / 2 - 30, maxBox.y + maxBox.height - 1, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(maximum).not.toHaveValue(before);
  await expect(minimum).toHaveValue(exactMinimum);
  const pointerMaximum = Number(await maximum.inputValue());
  await maxSlider.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(maximum).toHaveValue(String(Math.round((pointerMaximum - 0.01) * 100) / 100));
  await expect(minimum).toHaveValue(exactMinimum);
  const exactMaximum = await maximum.inputValue();
  const request = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/nfts' &&
      new URL(response.url()).searchParams.get('minPrice') === exactMinimum,
  );
  await filters.getByRole('button', { name: 'Aplicar', exact: true }).click();
  const response = await request;
  expect(response.status()).toBe(200);
  expect(new URL(response.url()).searchParams.get('maxPrice')).toBe(exactMaximum);
  expect(new URL(response.url()).searchParams.get('network')).toBe('Ethereum');
  await expect.poll(() => searchValue(page, 'minPrice')).toBe(exactMinimum);
  await expect.poll(() => searchValue(page, 'maxPrice')).toBe(exactMaximum);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
  const restored = await filtersFor(page, isMobile);
  await expect(restored.getByLabel('Preço mínimo', { exact: true })).toHaveValue(exactMinimum);
  await expect(restored.getByLabel('Preço máximo', { exact: true })).toHaveValue(exactMaximum);
});

test('keyboard minimum adjustment preserves an exact manual maximum through the API and refresh', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
  const filters = await filtersFor(page, isMobile);
  const exactMaximum = '12.123456789012345678';
  await filters.getByLabel('Preço máximo', { exact: true }).fill(exactMaximum);
  const minimum = filters.getByRole('slider', { name: 'Preço mínimo em ETH', exact: true });
  await minimum.focus();
  await page.keyboard.press('ArrowRight');
  await expect(filters.getByLabel('Preço mínimo', { exact: true })).toHaveValue('0.03');
  await expect(filters.getByLabel('Preço máximo', { exact: true })).toHaveValue(exactMaximum);
  const request = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/nfts' &&
      new URL(response.url()).searchParams.get('maxPrice') === exactMaximum,
  );
  await filters.getByRole('button', { name: 'Aplicar', exact: true }).click();
  const response = await request;
  expect(response.status()).toBe(200);
  expect(new URL(response.url()).searchParams.get('minPrice')).toBe('0.03');
  await expect.poll(() => searchValue(page, 'maxPrice')).toBe(exactMaximum);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true })).toBeVisible();
  const restored = await filtersFor(page, isMobile);
  await expect(restored.getByLabel('Preço mínimo', { exact: true })).toHaveValue('0.03');
  await expect(restored.getByLabel('Preço máximo', { exact: true })).toHaveValue(exactMaximum);
  if (!isMobile) {
    await page.goto('/nft/nft-1');
    await expect(page.getByRole('img', { name: '4.5 de 5 estrelas', exact: true })).toBeVisible();
  }
});
