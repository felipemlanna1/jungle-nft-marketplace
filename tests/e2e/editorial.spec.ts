import { test, expect, type Page } from '@playwright/test';

const sectionName = 'Diário da Cunhagem';
const firstTitle = 'Como funciona a propriedade de NFTs';
async function scenario(page: Page, value: 'default' | 'server-error' | 'empty') {
  await page.evaluate(async (scenario) => {
    const response = await fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!response.ok) throw new Error('Cannot prepare the simulated scenario.');
  }, value);
}

test('editorial previews come from REST and open a lazy simulated reading with focus restored', async ({
  page,
}, testInfo) => {
  const detailRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/articles/'))
      detailRequests.push(request.url());
  });
  const listResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/articles',
  );
  await page.goto('/');
  const previews = await (await listResponse).json();
  expect(previews).toHaveLength(4);
  expect(previews[0]).not.toHaveProperty('paragraphs');
  const section = page.getByRole('region', { name: sectionName, exact: true });
  await expect(section.locator('.editorial-card')).toHaveCount(4);
  await expect(section.getByText(/12 de setembro/)).toBeVisible();
  expect(detailRequests).toHaveLength(0);
  if (testInfo.project.name === 'desktop') {
    const card = await section.locator('.editorial-card').first().boundingBox();
    const image = await section.locator('.editorial-card-image').first().boundingBox();
    expect(card?.width).toBe(268);
    expect(image?.height).toBe(195);
  }
  const trigger = section.getByRole('button', { name: `Ler mais: ${firstTitle}`, exact: true });
  const detailResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/articles/nft-ownership',
  );
  await trigger.click();
  const detail = await (await detailResponse).json();
  expect(detail.simulated).toBe(true);
  const dialog = page.getByRole('dialog', { name: firstTitle, exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(detail.paragraphs[0], { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Leitura ilustrativa do protótipo/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/\/(?:\?.*)?$/);
});

test('editorial reader failures show a real retry and closing returns focus to the same card', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: sectionName, exact: true });
  await expect(section.locator('.editorial-card')).toHaveCount(4);
  await scenario(page, 'server-error');
  const trigger = section.getByRole('button', { name: `Ler mais: ${firstTitle}`, exact: true });
  const response = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/articles/nft-ownership',
  );
  await trigger.click();
  expect((await response).status()).toBe(503);
  const dialog = page.getByRole('dialog', { name: firstTitle, exact: true });
  await expect(dialog.getByRole('alert')).toContainText('Não foi possível carregar esta leitura.');
  await scenario(page, 'default');
  await dialog.getByRole('button', { name: 'Tentar leitura novamente', exact: true }).click();
  await expect(dialog.locator('.article-reader-paragraphs')).toBeVisible();
  await dialog.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
  await expect(trigger).toBeFocused();
});

test('editorial list failure and empty state recover through the simulated API', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await scenario(page, 'server-error');
  await page.reload();
  const section = page.getByRole('region', { name: sectionName, exact: true });
  await expect(section.getByRole('alert')).toContainText('Não foi possível carregar o Diário');
  await scenario(page, 'default');
  await section.getByRole('button', { name: 'Tentar carregar o diário', exact: true }).click();
  await expect(section.locator('.editorial-card')).toHaveCount(4);
  await scenario(page, 'empty');
  await page.reload();
  await expect(section.getByText('Nenhuma leitura disponível no momento.')).toBeVisible();
});

test('all four editorial cards request their own content without creating editorial routes', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: sectionName, exact: true });
  await expect(section.locator('.editorial-card')).toHaveCount(4);
  const ids = ['nft-ownership', 'digital-artists', 'rarity-and-provenance', 'wallet-protection'];
  for (let index = 0; index < ids.length; index++) {
    const trigger = section.getByRole('button', { name: /^Ler mais:/ }).nth(index);
    const response = page.waitForResponse(
      (response) => new URL(response.url()).pathname === `/api/articles/${ids[index]}`,
    );
    await trigger.click();
    const article = await (await response).json();
    expect(article.id).toBe(ids[index]);
    const dialog = page.getByRole('dialog', { name: article.title, exact: true });
    await expect(dialog.getByText(article.paragraphs[0], { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
  await expect(page).toHaveURL(/\/(?:\?.*)?$/);
});
