import { expect, test } from '@playwright/test';

test('card preview, cart and rarity follow the mocked API', async ({ page, isMobile }) => {
  await page.goto('/');
  const card = page
    .locator('.nft-card')
    .filter({ has: page.getByRole('heading', { name: 'Emerald Ape #042', exact: true }) });
  await expect(card).toBeVisible();
  if (!isMobile) await card.hover();
  const detail = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/nfts/nft-1',
  );
  if (isMobile) {
    await expect(
      card.getByRole('button', { name: 'Adicionar Emerald Ape #042 ao carrinho', exact: true }),
    ).toBeHidden();
    await expect(
      card.getByRole('button', { name: 'Ampliar Emerald Ape #042', exact: true }),
    ).toBeHidden();
    await card.getByRole('link', { name: 'Ver Emerald Ape #042', exact: true }).click();
  }
  const previewButton = isMobile
    ? page.getByRole('button', { name: 'Ampliar obra', exact: true })
    : card.getByRole('button', { name: 'Ampliar Emerald Ape #042', exact: true });
  await previewButton.click();
  const data = await (await detail).json();
  const preview = page.getByRole('dialog', { name: data.title, exact: true });
  await expect(preview).toBeVisible();
  await expect(preview.getByRole('img', { name: data.title })).toHaveAttribute('src', data.image);
  if (!isMobile) await expect(preview).toContainText(`${data.price} ETH`);
  else await expect(page.locator('.detail-price')).toContainText(`${data.price} ETH`);
  await page.keyboard.press('Escape');
  await expect(preview).not.toBeVisible();
  await expect(previewButton).toBeFocused();
  const addition = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/cart/items' &&
      response.request().method() === 'POST',
  );
  if (isMobile) await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click();
  else
    await card
      .getByRole('button', { name: 'Adicionar Emerald Ape #042 ao carrinho', exact: true })
      .click();
  const response = await addition;
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON()).toMatchObject({
    nftId: 'nft-1',
    quantity: 1,
    editionId: data.defaultEditionId,
  });
  if (isMobile) {
    await expect(page.getByRole('link', { name: 'Ver carrinho', exact: true })).toBeVisible();
    await page.goto('/');
    await expect(card).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Carrinho, 1 itens', exact: true })).toBeVisible();
  const catalogue = await page.evaluate(async () => (await fetch('/api/nfts')).json());
  const rare = catalogue.items.find((item: { rarity?: string }) => item.rarity === 'Rare');
  expect(rare).toBeTruthy();
  const rareCard = page
    .locator('.nft-card')
    .filter({ has: page.getByRole('heading', { name: rare.title, exact: true }) });
  await expect(rareCard.getByText('RARO', { exact: true })).toBeVisible();
  await expect(card.getByText('RARO', { exact: true })).toHaveCount(data.rarity === 'Rare' ? 1 : 0);
  const recommendations = page.waitForResponse(
    (candidate) =>
      new URL(candidate.url()).pathname === '/api/recommendations' &&
      new URL(candidate.url()).searchParams.get('exclude')?.includes('nft-1') === true,
  );
  await page.getByRole('link', { name: 'Carrinho, 1 itens', exact: true }).click();
  const suggested = await (await recommendations).json();
  expect(suggested.simulated).toBe(true);
  expect(suggested.items.every((item: { id: string }) => item.id !== 'nft-1')).toBe(true);
  const related = page.getByRole('region', { name: 'Colecionadores também viram', exact: true });
  await expect(
    related.getByRole('link', { name: `Ver ${suggested.items[0].title}`, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('.commerce-cart-row')).toContainText('Emerald Ape #042');
  await expect(page.locator('.order-summary .total')).toContainText('1.206 ETH');
});
