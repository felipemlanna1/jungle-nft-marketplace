import { test, expect } from '@playwright/test';
import { DEMO_LOGIN } from '../../src/config/demo';
import { openOptions } from './helpers/interface';

for (const origin of ['catalog', 'detail'] as const) {
  test(`guest favorite from ${origin} survives demo sign-in, refresh and removal`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      origin === 'catalog' ? '/?q=Sage&tab=trending&sort=price-desc#marketplace' : '/nft/nft-2',
    );
    const guestAction =
      origin === 'catalog'
        ? page.getByRole('button', {
            name: 'Adicionar Sage Nomad #009 aos favoritos',
            exact: true,
          })
        : page.getByRole('link', { name: 'Entrar para favoritar', exact: true });
    await expect(guestAction).toBeVisible();
    const originalUrl = page.url();
    const original = new URL(originalUrl);
    await guestAction.click();
    await expect(page).toHaveURL(/\/login\?/);
    const loginUrl = new URL(page.url());
    expect(loginUrl.searchParams.get('redirect')).toBe(
      original.pathname + original.search + original.hash,
    );
    expect(loginUrl.searchParams.get('favorite')).toBe('nft-2');
    await expect(
      page.getByText('Entre para salvar a obra selecionada', { exact: false }),
    ).toBeVisible();

    let loginPosts = 0;
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/session/login' && request.method() === 'POST')
        loginPosts++;
    });
    await page.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
    await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue(DEMO_LOGIN.email);
    await expect(page.getByLabel('Senha', { exact: true })).toHaveValue(DEMO_LOGIN.password);
    expect(loginPosts).toBe(0);
    const signInBounds = await page
      .getByRole('button', { name: 'Entrar', exact: true })
      .boundingBox();
    expect(signInBounds).not.toBeNull();
    expect(signInBounds!.y).toBeGreaterThanOrEqual(0);
    expect(signInBounds!.y + signInBounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.screenshot({
      path: `reports/favorite-login-${origin}-${testInfo.project.name}.png`,
      fullPage: true,
    });
    const favoriteSaved = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/favorites' &&
        response.request().method() === 'POST',
    );
    await page.getByLabel('Senha', { exact: true }).press('Enter');
    const saveResponse = await favoriteSaved;
    expect(saveResponse.status()).toBe(200);
    expect(saveResponse.request().postDataJSON()).toEqual({ id: 'nft-2', active: true });
    expect(loginPosts).toBe(1);
    await expect(page).toHaveURL(originalUrl);
    const removeName =
      origin === 'catalog' ? 'Remover Sage Nomad #009 dos favoritos' : 'Remover dos favoritos';
    await expect(page.getByRole('button', { name: removeName, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.screenshot({
      path: `reports/favorite-saved-${origin}-${testInfo.project.name}.png`,
      fullPage: true,
    });
    await page.reload();
    await expect(page.getByRole('button', { name: removeName, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const favoriteRemoved = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/favorites' &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: removeName, exact: true }).click();
    const removeResponse = await favoriteRemoved;
    expect(removeResponse.status()).toBe(200);
    expect(removeResponse.request().postDataJSON()).toEqual({ id: 'nft-2', active: false });
    await page.reload();
    const addName =
      origin === 'catalog' ? 'Adicionar Sage Nomad #009 aos favoritos' : 'Adicionar aos favoritos';
    await expect(page.getByRole('button', { name: addName, exact: true })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
}

test('demo prefill never resets a password changed by the collector', async ({ page }) => {
  const currentPassword = 'Changed0nly!Demo';
  await page.goto('/login?redirect=%2Fprofile');
  await page.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  await page.getByLabel('Senha', { exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/profile$/);
  await page.getByLabel('Senha atual', { exact: true }).fill(DEMO_LOGIN.password);
  await page.getByLabel('Nova senha', { exact: true }).fill(currentPassword);
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill(currentPassword);
  await page.getByRole('button', { name: 'Atualizar senha', exact: true }).click();
  await expect(page.getByText('Senha atualizada.', { exact: true })).toBeVisible();
  await openOptions(page);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await page.goto('/login?redirect=%2Fprofile');
  await page.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  await page.getByLabel('Senha', { exact: true }).press('Enter');
  await expect(page.getByRole('alert')).toContainText('use a senha atual');
  await expect(page).toHaveURL(/\/login\?/);
  await page.getByLabel('Senha', { exact: true }).fill(currentPassword);
  await page.getByLabel('Senha', { exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/profile$/);
});
