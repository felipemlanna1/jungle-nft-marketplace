import { test, expect } from '@playwright/test';
test('avatar and password changes persist through real profile forms', async ({ page }) => {
  await page.goto('/login?redirect=%2Fprofile');
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
  await page.getByLabel('Enviar avatar').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Seu perfil foi salvo.' })).toBeVisible();
  await page.reload();
  await expect(page.getByAltText('Seu avatar')).toBeVisible();
  await page.getByLabel('Senha atual', { exact: true }).fill('Collect0r!Demo');
  await page.getByLabel('Nova senha', { exact: true }).fill('Collect0r!Changed');
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('Collect0r!Changed');
  await page.getByRole('button', { name: 'Atualizar senha', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Senha atualizada.' })).toBeVisible();
  const outcome = await page.evaluate(async () => {
    await fetch('/api/session/logout', { method: 'POST' });
    const response = await fetch('/api/session/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'collector@example.test', password: 'Collect0r!Changed' }),
    });
    return response.status;
  });
  expect(outcome).toBe(200);
});
