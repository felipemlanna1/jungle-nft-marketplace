import { test, expect, type Page } from '@playwright/test';
import { DEMO_LOGIN } from '../../src/config/demo';
import { openOptions, closeOptions } from './helpers/interface';

const THEME_KEY = 'jungle.marketplace.theme';
const VERSION_KEY = 'jungle.marketplace.theme.version';

async function expectKurio(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'kurio');
  await expect(page.getByRole('group', { name: 'Tema visual', exact: true })).toHaveCount(0);
}
async function addCollectible(page: Page) {
  await page.goto('/nft/nft-1');
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click();
  await expect(page.getByText('A obra está no seu carrinho.')).toBeVisible();
}
async function login(page: Page, redirect: string) {
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectKurio(page);
  await page.getByLabel('E-mail', { exact: true }).fill(DEMO_LOGIN.email);
  await page.getByLabel('Senha', { exact: true }).fill(DEMO_LOGIN.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${redirect}$`));
}

test('Kurio is the only appearance across public, account, checkout and receipt routes', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expectKurio(page);
  await openOptions(page);
  await expect(page.getByRole('button', { name: /^(Jungle|Kurio)$/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lista de interesse', exact: true })).toBeVisible();
  await closeOptions(page);
  await addCollectible(page);
  await expectKurio(page);
  await page.goto('/cart');
  await expect(
    page.getByRole('region', { name: 'Itens no seu carrinho', exact: true }),
  ).toBeVisible();
  await expectKurio(page);
  await login(page, '/checkout');
  await expect(page.getByRole('heading', { name: 'Pagamento seguro', exact: true })).toBeVisible();
  await expectKurio(page);
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar compra', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Compra confirmada!', exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/orders\//);
  await expectKurio(page);
  await page.getByRole('button', { name: 'Fechar comprovante', exact: true }).click();
  await page.goto('/profile');
  await expect(
    page.getByRole('heading', { name: 'Perfil do colecionador', exact: true }),
  ).toBeVisible();
  await expectKurio(page);
  await page.goto('/wallets');
  await expect(
    page.getByRole('heading', { name: 'Carteira principal', exact: true }),
  ).toBeVisible();
  await expectKurio(page);
  await page.goto('/register');
  await expect(page.getByRole('dialog', { name: 'Criar perfil de colecionador' })).toBeVisible();
  await expectKurio(page);
  await page.goto('/not-a-route');
  await expect(
    page.getByRole('heading', { name: 'Página não encontrada', exact: true }),
  ).toBeVisible();
  await expectKurio(page);
});

for (const preference of ['expedition', 'unsupported'] as const) {
  test(`a saved ${preference} preference migrates to Kurio without a switcher`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, version, preference }) => {
        const seeded = 'test:legacy-appearance-seeded';
        if (sessionStorage.getItem(seeded)) return;
        localStorage.setItem(key, preference);
        localStorage.setItem(version, '2');
        sessionStorage.setItem(seeded, 'true');
      },
      { key: THEME_KEY, version: VERSION_KEY, preference },
    );
    await page.goto('/');
    await expect(page.locator('#hero-title')).toBeVisible();
    await expectKurio(page);
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), THEME_KEY))
      .toBe('kurio');
    expect(await page.evaluate((key) => localStorage.getItem(key), VERSION_KEY)).toBe('3');
    await page.reload();
    await expect(page.locator('#hero-title')).toBeVisible();
    await expectKurio(page);
    await openOptions(page);
    await expect(page.getByRole('button', { name: /^(Jungle|Kurio)$/ })).toHaveCount(0);
  });
}

test('blocked appearance storage still renders Kurio and an accessible menu', async ({ page }) => {
  await page.addInitScript(
    ({ key, version }) => {
      const get = Storage.prototype.getItem;
      const set = Storage.prototype.setItem;
      Storage.prototype.getItem = function (name: string) {
        if (name === key || name === version)
          throw new DOMException('Appearance storage blocked', 'SecurityError');
        return get.call(this, name);
      };
      Storage.prototype.setItem = function (name: string, value: string) {
        if (name === key || name === version)
          throw new DOMException('Appearance storage blocked', 'SecurityError');
        return set.call(this, name, value);
      };
    },
    { key: THEME_KEY, version: VERSION_KEY },
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.nft-card').first()).toBeVisible();
  await expectKurio(page);
  await openOptions(page);
  await closeOptions(page);
  expect(errors).toEqual([]);
});

test('opening the menu preserves URL filters and cart through refresh', async ({ page }) => {
  await addCollectible(page);
  await page.goto('/?q=Sage&category=Photography&sort=price-asc');
  await expect(page.getByRole('link', { name: 'Ver Sage Nomad #009', exact: true })).toBeVisible();
  const original = page.url();
  await openOptions(page);
  await closeOptions(page);
  expect(page.url()).toBe(original);
  await expect(page.getByRole('link', { name: 'Carrinho, 1 itens', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.nft-card').first()).toBeVisible();
  expect(page.url()).toBe(original);
  expect(new URL(page.url()).searchParams.get('q')).toBe('Sage');
  await expect(page.getByRole('link', { name: 'Carrinho, 1 itens', exact: true })).toBeVisible();
  await expectKurio(page);
});

test('menu keyboard navigation preserves an unsaved profile and restores trigger focus', async ({
  page,
}) => {
  await login(page, '/profile');
  const name = page.getByLabel('Nome de exibição', { exact: true });
  await expect(name).toHaveValue('Alex Collector');
  await name.fill('Unsaved profile menu draft');
  await openOptions(page);
  const menu = page.getByRole('dialog', { name: 'Sua conta', exact: true });
  const profile = menu.getByRole('link', { name: 'Perfil', exact: true });
  await profile.focus();
  await page.keyboard.press('Tab');
  await expect(menu.getByRole('link', { name: 'Carteiras', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(name).toHaveValue('Unsaved profile menu draft');
  const footer = page.getByRole('button', { name: 'Opções da demonstração', exact: true });
  if (await footer.isVisible()) await expect(footer).toBeFocused();
  else
    await expect(
      page.getByRole('button', { name: 'Abrir navegação', exact: true }).first(),
    ).toBeFocused();
  await expectKurio(page);
});

test('opening the menu preserves a checkout draft and review without creating an order', async ({
  page,
}) => {
  await addCollectible(page);
  await login(page, '/checkout');
  await page.getByLabel('Nome completo', { exact: true }).fill('Unsaved checkout menu draft');
  await page.getByLabel('E-mail', { exact: true }).fill('draft@example.test');
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar compra', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Revisão do pedido' })).toBeVisible();
  await openOptions(page);
  await closeOptions(page);
  await expect(page.getByText('Unsaved checkout menu draft', { exact: true })).toBeVisible();
  await expect(page.getByText('draft@example.test', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => Object.keys(JSON.parse(localStorage.getItem('jungle.demo.database.v1')!).orders).length,
    ),
  ).toBe(0);
  await page.getByRole('button', { name: 'Editar dados', exact: true }).click();
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue(
    'Unsaved checkout menu draft',
  );
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('draft@example.test');
  await expectKurio(page);
});

test('Kurio critical controls stay within 320, 390, 768 and 1440 pixel viewports', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.nft-card').first()).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const bounds = await page.evaluate(() => ({
      viewport: innerWidth,
      scroll: document.documentElement.scrollWidth,
      controls: [
        '.header-inner',
        '.header-actions',
        '.cart-link',
        '.mobile-catalog-tools',
        '.catalog-toolbar',
        '#hero-title',
      ].map((selector) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect();
        return { selector, left: rect?.left ?? 0, right: rect?.right ?? 0 };
      }),
    }));
    expect(bounds.scroll, `overflow at ${width}px`).toBeLessThanOrEqual(bounds.viewport + 1);
    for (const control of bounds.controls) {
      expect(control.left, `${control.selector} left at ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(control.right, `${control.selector} right at ${width}px`).toBeLessThanOrEqual(
        width + 1,
      );
    }
    await expectKurio(page);
  }
});
