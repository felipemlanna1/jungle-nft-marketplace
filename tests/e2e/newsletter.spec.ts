import { test, expect, type Page } from '@playwright/test';

const emailLabel = 'E-mail da newsletter';
const submitLabel = 'Inscrever na newsletter';
const confirmation = 'Inscrição simulada confirmada. Nenhum e-mail real será enviado.';
async function scenario(page: Page, value: 'default' | 'slow' | 'server-error') {
  await page.evaluate(async (scenario) => {
    const response = await fetch('/api/demo/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!response.ok) throw new Error('Cannot prepare the demonstration scenario.');
  }, value);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await expect(page.getByLabel(emailLabel, { exact: true })).toBeEnabled();
});

test('newsletter confirms a real simulated POST and deduplicates repeated subscriptions', async ({
  page,
}) => {
  const form = page.getByRole('form', { name: 'Inscrição de novidades', exact: true });
  const input = form.getByLabel(emailLabel, { exact: true });
  const button = form.getByRole('button', { name: submitLabel, exact: true });
  await scenario(page, 'slow');
  await input.fill('updates@example.test');
  const firstResponse = page.waitForResponse((response) =>
    response.url().endsWith('/api/newsletter/subscriptions'),
  );
  await button.click();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(form.getByRole('status')).toHaveCount(0);
  const first = await (await firstResponse).json();
  expect(first.simulated).toBe(true);
  expect(first.alreadySubscribed).toBe(false);
  await expect(form.getByRole('status')).toHaveText(confirmation);
  await expect(input).toHaveValue('');
  await scenario(page, 'default');
  await input.fill('UPDATES@example.test');
  const secondResponse = page.waitForResponse((response) =>
    response.url().endsWith('/api/newsletter/subscriptions'),
  );
  await button.click();
  const second = await (await secondResponse).json();
  expect(second.id).toBe(first.id);
  expect(second.createdAt).toBe(first.createdAt);
  expect(second.alreadySubscribed).toBe(true);
  await expect(form.getByRole('status')).toHaveText(confirmation);
});

test('newsletter rejects invalid input and preserves the draft after a server failure', async ({
  page,
}) => {
  const form = page.getByRole('form', { name: 'Inscrição de novidades', exact: true });
  const input = form.getByLabel(emailLabel, { exact: true });
  const button = form.getByRole('button', { name: submitLabel, exact: true });
  await input.fill('invalid');
  await button.click();
  await expect(form.getByRole('alert')).toContainText('Digite um e-mail válido');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await scenario(page, 'server-error');
  await input.fill('retry@example.test');
  const failed = page.waitForResponse((response) =>
    response.url().endsWith('/api/newsletter/subscriptions'),
  );
  await button.click();
  expect((await failed).status()).toBe(503);
  await expect(form.getByRole('alert')).toContainText('Não foi possível confirmar');
  await expect(form.getByRole('status')).toHaveCount(0);
  await expect(input).toHaveValue('retry@example.test');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await scenario(page, 'default');
  await button.click();
  await expect(form.getByRole('status')).toHaveText(confirmation);
});

test('footer social icons are explicit platform links and open an independent tab', async ({
  page,
  context,
}) => {
  const group = page.getByRole('group', { name: 'Redes sociais ilustrativas', exact: true });
  for (const [name, href] of [
    ['Facebook', 'https://www.facebook.com/'],
    ['Instagram', 'https://www.instagram.com/'],
    ['X', 'https://x.com/'],
    ['LinkedIn', 'https://www.linkedin.com/'],
    ['YouTube', 'https://www.youtube.com/'],
  ]) {
    const link = group.getByRole('link', { name: `Abrir ${name} em nova aba`, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
  await expect(page.getByText('Links ilustrativos do protótipo.', { exact: true })).toBeVisible();
  await context.route('https://www.facebook.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Platform link test</title>' }),
  );
  const opened = context.waitForEvent('page');
  await group.getByRole('link', { name: 'Abrir Facebook em nova aba', exact: true }).click();
  const popup = await opened;
  await popup.waitForLoadState('domcontentloaded');
  expect(popup.url()).toBe('https://www.facebook.com/');
  expect(await popup.evaluate(() => window.opener)).toBeNull();
  await popup.close();
});

test('newsletter drafts are cleared when guest navigation signs into another identity', async ({
  page,
}) => {
  const input = page.getByLabel(emailLabel, { exact: true });
  await input.fill('guest-draft@example.test');
  await page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'Meu perfil', exact: true })
    .click();
  await expect(input).toHaveValue('guest-draft@example.test');
  await page.getByRole('link', { name: 'Entrar para continuar', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  await dialog.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue('Alex Collector');
  await expect(input).toHaveValue('');
  await expect(
    page.getByRole('form', { name: 'Inscrição de novidades' }).getByRole('status'),
  ).toHaveCount(0);
});
