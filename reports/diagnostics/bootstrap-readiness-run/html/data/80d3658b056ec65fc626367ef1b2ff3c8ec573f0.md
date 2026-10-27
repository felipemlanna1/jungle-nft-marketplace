# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: favorites-navigation.spec.ts >> guest favorites navigate to a single usable login dialog without reopening the menu
- Location: tests/e2e/favorites-navigation.spec.ts:43:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('button', { name: 'Abrir navegação', exact: true }).first()
Expected: focused
Received: inactive
Timeout:  8000ms

Call log:
  - Expect "toBeFocused" getByRole('button', { name: 'Abrir navegação', exact: true }).first() with timeout 8000ms
  - waiting for getByRole('button', { name: 'Abrir navegação', exact: true }).first()
    20 × locator resolved to <button type="button" class="mobile-nav-center" aria-label="Abrir navegação">…</button>
       - unexpected value "inactive"

```

```yaml
- button "Abrir navegação":
  - img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { openOptions } from './helpers/interface';
  3  | 
  4  | test('account menu hands favorites to the detail route and restores the outer trigger on close', async ({
  5  |   page,
  6  |   isMobile,
  7  | }) => {
  8  |   await page.goto('/login?redirect=%2F');
  9  |   await page.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  10 |   await page.getByLabel('Senha', { exact: true }).press('Enter');
  11 |   const favorite = page.getByRole('button', {
  12 |     name: 'Adicionar Sage Nomad #009 aos favoritos',
  13 |     exact: true,
  14 |   });
  15 |   await favorite.click();
  16 |   await expect(
  17 |     page.getByRole('button', { name: 'Remover Sage Nomad #009 dos favoritos', exact: true }),
  18 |   ).toHaveAttribute('aria-pressed', 'true');
  19 |   const trigger = isMobile
  20 |     ? page
  21 |         .locator('.mobile-bottom-nav')
  22 |         .getByRole('button', { name: 'Abrir navegação', exact: true })
  23 |     : page.locator('.header-actions').getByRole('button', { name: /Alex Collector/ });
  24 |   await trigger.click();
  25 |   const menu = page.getByRole('dialog', { name: 'Sua conta', exact: true });
  26 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  27 |   const list = page.getByRole('dialog', { name: 'Lista de interesse', exact: true });
  28 |   await expect(list).toBeVisible();
  29 |   await expect(menu).toHaveCount(0);
  30 |   await list.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
  31 |   await expect(list).toHaveCount(0);
  32 |   await expect(trigger).toBeFocused();
  33 |   await trigger.click();
  34 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  35 |   await list.getByRole('link', { name: /Sage Nomad #009/ }).click();
  36 |   await expect(page).toHaveURL(/\/nft\/nft-2$/);
  37 |   await expect(page.getByRole('heading', { name: 'Sage Nomad #009', exact: true })).toBeVisible();
  38 |   await expect(menu).toHaveCount(0);
  39 |   await expect(list).toHaveCount(0);
  40 |   await expect(page.getByRole('button', { name: 'Comprar NFT', exact: true })).toBeEnabled();
  41 | });
  42 | 
  43 | test('guest favorites navigate to a single usable login dialog without reopening the menu', async ({
  44 |   page,
  45 | }) => {
  46 |   await page.goto('/');
  47 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  48 |   const footer = page.getByRole('button', { name: 'Opções da demonstração', exact: true });
  49 |   const trigger = (await footer.isVisible())
  50 |     ? footer
  51 |     : page.getByRole('button', { name: 'Abrir navegação', exact: true }).first();
  52 |   await openOptions(page);
  53 |   const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
  54 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  55 |   const list = page.getByRole('dialog', { name: 'Lista de interesse', exact: true });
  56 |   await expect(list).toBeVisible();
  57 |   await expect(menu).toHaveCount(0);
  58 |   await list.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
> 59 |   await expect(trigger).toBeFocused();
     |                         ^ Error: expect(locator).toBeFocused() failed
  60 |   await openOptions(page);
  61 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  62 |   await list.getByRole('link', { name: 'Entrar', exact: true }).click();
  63 |   await expect(page).toHaveURL(/\/login\?/);
  64 |   const login = page.getByRole('dialog', { name: 'Entrar', exact: true });
  65 |   await expect(login).toBeVisible();
  66 |   await expect(page.getByRole('dialog')).toHaveCount(1);
  67 |   await expect(menu).toHaveCount(0);
  68 |   await expect(list).toHaveCount(0);
  69 |   await expect
  70 |     .poll(() => login.evaluate((node) => node.contains(document.activeElement)))
  71 |     .toBe(true);
  72 |   await login.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  73 |   await login.getByLabel('Senha', { exact: true }).press('Enter');
  74 |   await expect(page.locator('#hero-title')).toBeVisible();
  75 |   await expect(menu).toHaveCount(0);
  76 |   await expect(list).toHaveCount(0);
  77 | });
  78 | 
```