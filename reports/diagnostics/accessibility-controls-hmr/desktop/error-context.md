# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: newsletter.spec.ts >> newsletter confirms a real simulated POST and deduplicates repeated subscriptions
- Location: tests/e2e/newsletter.spec.ts:22:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('form', { name: 'Inscrição de novidades', exact: true }).getByRole('button', { name: 'Enviar inscrição na newsletter', exact: true })
Expected: "true"
Received: "false"
Timeout:  8000ms

Call log:
  - Expect "toHaveAttribute" getByRole('form', { name: 'Inscrição de novidades', exact: true }).getByRole('button', { name: 'Enviar inscrição na newsletter', exact: true }) with timeout 8000ms
  - waiting for getByRole('form', { name: 'Inscrição de novidades', exact: true }).getByRole('button', { name: 'Enviar inscrição na newsletter', exact: true })
    20 × locator resolved to <button type="submit" aria-busy="false" class="button button-primary" aria-label="Enviar inscrição na newsletter">Enviar</button>
       - unexpected value "false"

```

```yaml
- button "Enviar inscrição na newsletter": Enviar
```

```
Error: page.waitForResponse: Test ended.
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const emailLabel = 'E-mail da newsletter';
  4   | const submitLabel = 'Enviar inscrição na newsletter';
  5   | const confirmation = 'Inscrição simulada confirmada. Nenhum e-mail real será enviado.';
  6   | async function scenario(page: Page, value: 'default' | 'slow' | 'server-error') {
  7   |   await page.evaluate(async (scenario) => {
  8   |     const response = await fetch('/api/demo/scenario', {
  9   |       method: 'POST',
  10  |       headers: { 'Content-Type': 'application/json' },
  11  |       body: JSON.stringify({ scenario }),
  12  |     });
  13  |     if (!response.ok) throw new Error('Cannot prepare the demonstration scenario.');
  14  |   }, value);
  15  | }
  16  | test.beforeEach(async ({ page }) => {
  17  |   await page.goto('/');
  18  |   await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  19  |   await expect(page.getByLabel(emailLabel, { exact: true })).toBeEnabled();
  20  | });
  21  | 
  22  | test('newsletter confirms a real simulated POST and deduplicates repeated subscriptions', async ({
  23  |   page,
  24  | }) => {
  25  |   const form = page.getByRole('form', { name: 'Inscrição de novidades', exact: true });
  26  |   const input = form.getByLabel(emailLabel, { exact: true });
  27  |   const button = form.getByRole('button', { name: submitLabel, exact: true });
  28  |   await scenario(page, 'slow');
  29  |   await input.fill('updates@example.test');
> 30  |   const firstResponse = page.waitForResponse((response) =>
      |                              ^ Error: page.waitForResponse: Test ended.
  31  |     response.url().endsWith('/api/newsletter/subscriptions'),
  32  |   );
  33  |   await button.click();
  34  |   await expect(button).toHaveAttribute('aria-busy', 'true');
  35  |   await expect(form.getByRole('status')).toHaveCount(0);
  36  |   const first = await (await firstResponse).json();
  37  |   expect(first.simulated).toBe(true);
  38  |   expect(first.alreadySubscribed).toBe(false);
  39  |   await expect(form.getByRole('status')).toHaveText(confirmation);
  40  |   await expect(input).toHaveValue('');
  41  |   await scenario(page, 'default');
  42  |   await input.fill('UPDATES@example.test');
  43  |   const secondResponse = page.waitForResponse((response) =>
  44  |     response.url().endsWith('/api/newsletter/subscriptions'),
  45  |   );
  46  |   await button.click();
  47  |   const second = await (await secondResponse).json();
  48  |   expect(second.id).toBe(first.id);
  49  |   expect(second.createdAt).toBe(first.createdAt);
  50  |   expect(second.alreadySubscribed).toBe(true);
  51  |   await expect(form.getByRole('status')).toHaveText(confirmation);
  52  | });
  53  | 
  54  | test('newsletter rejects invalid input and preserves the draft after a server failure', async ({
  55  |   page,
  56  | }) => {
  57  |   const form = page.getByRole('form', { name: 'Inscrição de novidades', exact: true });
  58  |   const input = form.getByLabel(emailLabel, { exact: true });
  59  |   const button = form.getByRole('button', { name: submitLabel, exact: true });
  60  |   await input.fill('invalid');
  61  |   await button.click();
  62  |   await expect(form.getByRole('alert')).toContainText('Digite um e-mail válido');
  63  |   await expect(input).toHaveAttribute('aria-invalid', 'true');
  64  |   await scenario(page, 'server-error');
  65  |   await input.fill('retry@example.test');
  66  |   const failed = page.waitForResponse((response) =>
  67  |     response.url().endsWith('/api/newsletter/subscriptions'),
  68  |   );
  69  |   await button.click();
  70  |   expect((await failed).status()).toBe(503);
  71  |   await expect(form.getByRole('alert')).toContainText('Não foi possível confirmar');
  72  |   await expect(form.getByRole('status')).toHaveCount(0);
  73  |   await expect(input).toHaveValue('retry@example.test');
  74  |   await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  75  |   await scenario(page, 'default');
  76  |   await button.click();
  77  |   await expect(form.getByRole('status')).toHaveText(confirmation);
  78  | });
  79  | 
  80  | test('footer social icons are explicit platform links and open an independent tab', async ({
  81  |   page,
  82  |   context,
  83  | }) => {
  84  |   const group = page.getByRole('group', { name: 'Redes sociais ilustrativas', exact: true });
  85  |   for (const [name, href] of [
  86  |     ['Facebook', 'https://www.facebook.com/'],
  87  |     ['Instagram', 'https://www.instagram.com/'],
  88  |     ['X', 'https://x.com/'],
  89  |     ['LinkedIn', 'https://www.linkedin.com/'],
  90  |     ['YouTube', 'https://www.youtube.com/'],
  91  |   ]) {
  92  |     const link = group.getByRole('link', { name: `Abrir ${name} em nova aba`, exact: true });
  93  |     await expect(link).toHaveAttribute('href', href);
  94  |     await expect(link).toHaveAttribute('target', '_blank');
  95  |     await expect(link).toHaveAttribute('rel', /noopener/);
  96  |   }
  97  |   await expect(page.getByText('Links ilustrativos do protótipo.', { exact: true })).toBeVisible();
  98  |   await context.route('https://www.facebook.com/**', (route) =>
  99  |     route.fulfill({ contentType: 'text/html', body: '<title>Platform link test</title>' }),
  100 |   );
  101 |   const opened = context.waitForEvent('page');
  102 |   await group.getByRole('link', { name: 'Abrir Facebook em nova aba', exact: true }).click();
  103 |   const popup = await opened;
  104 |   await popup.waitForLoadState('domcontentloaded');
  105 |   expect(popup.url()).toBe('https://www.facebook.com/');
  106 |   expect(await popup.evaluate(() => window.opener)).toBeNull();
  107 |   await popup.close();
  108 | });
  109 | 
  110 | test('newsletter drafts are cleared when guest navigation signs into another identity', async ({
  111 |   page,
  112 | }) => {
  113 |   const input = page.getByLabel(emailLabel, { exact: true });
  114 |   await input.fill('guest-draft@example.test');
  115 |   await page
  116 |     .getByRole('contentinfo')
  117 |     .getByRole('link', { name: 'Meu perfil', exact: true })
  118 |     .click();
  119 |   await expect(input).toHaveValue('guest-draft@example.test');
  120 |   await page.getByRole('link', { name: 'Entrar para continuar', exact: true }).click();
  121 |   const dialog = page.getByRole('dialog');
  122 |   await dialog.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  123 |   await dialog.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  124 |   await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  125 |   await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue('Alex Collector');
  126 |   await expect(input).toHaveValue('');
  127 |   await expect(
  128 |     page.getByRole('form', { name: 'Inscrição de novidades' }).getByRole('status'),
  129 |   ).toHaveCount(0);
  130 | });
```