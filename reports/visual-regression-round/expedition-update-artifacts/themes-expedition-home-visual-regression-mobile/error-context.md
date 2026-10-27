# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: themes.spec.ts >> expedition home visual regression
- Location: tests/e2e/themes.spec.ts:180:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('html')
Expected: "expedition"
Received: "kurio"
Timeout:  8000ms

Call log:
  - Expect "toHaveAttribute" locator('html') with timeout 8000ms
  - waiting for locator('html')
    20 × locator resolved to <html lang="pt-BR" data-theme="kurio">…</html>
       - unexpected value "kurio"

```

```yaml
- document:
  - link "Pular para o conteúdo":
    - /url: "#main-content"
  - main
  - navigation "Navegação móvel"
```

# Test source

```ts
  84  |   ).toBe(0);
  85  |   await selectTheme(page, 'Jungle');
  86  |   await page.getByRole('button', { name: 'Editar dados', exact: true }).click();
  87  |   await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue(
  88  |     'Unsaved checkout theme draft',
  89  |   );
  90  |   await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('draft@example.test');
  91  | });
  92  | 
  93  | test('an invalid saved theme falls back safely and remains switchable', async ({ page }) => {
  94  |   await page.addInitScript((key) => localStorage.setItem(key, 'not-a-supported-theme'), THEME_KEY);
  95  |   const errors: string[] = [];
  96  |   page.on('pageerror', (error) => errors.push(error.message));
  97  |   await page.goto('/');
  98  |   await ready(page);
  99  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'kurio');
  100 |   await selectTheme(page, 'Jungle');
  101 |   expect(errors).toEqual([]);
  102 | });
  103 | 
  104 | test('blocked preference storage does not crash the catalog or in-memory theme changes', async ({
  105 |   page,
  106 | }) => {
  107 |   await page.addInitScript((key) => {
  108 |     const get = Storage.prototype.getItem;
  109 |     const set = Storage.prototype.setItem;
  110 |     Storage.prototype.getItem = function (name: string) {
  111 |       if (name === key) throw new DOMException('Theme preference storage blocked', 'SecurityError');
  112 |       return get.call(this, name);
  113 |     };
  114 |     Storage.prototype.setItem = function (name: string, value: string) {
  115 |       if (name === key) throw new DOMException('Theme preference storage blocked', 'SecurityError');
  116 |       return set.call(this, name, value);
  117 |     };
  118 |   }, THEME_KEY);
  119 |   const errors: string[] = [];
  120 |   page.on('pageerror', (error) => errors.push(error.message));
  121 |   await page.goto('/');
  122 |   await ready(page);
  123 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  124 |   await selectTheme(page, 'Kurio');
  125 |   await selectTheme(page, 'Jungle');
  126 |   expect(errors).toEqual([]);
  127 | });
  128 | 
  129 | test('both themes keep critical controls within 320, 390, 768 and 1440 pixels', async ({
  130 |   page,
  131 | }) => {
  132 |   await page.goto('/');
  133 |   await ready(page);
  134 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  135 |   for (const width of [320, 390, 768, 1440]) {
  136 |     await page.setViewportSize({ width, height: 1000 });
  137 |     for (const theme of ['Jungle', 'Kurio'] as const) {
  138 |       await selectTheme(page, theme);
  139 |       const bounds = await page.evaluate(() => {
  140 |         const selectors = [
  141 |           '.header-inner',
  142 |           '.header-actions',
  143 |           '.cart-link',
  144 |           '.mobile-catalog-tools',
  145 |           '.catalog-toolbar',
  146 |           '#hero-title',
  147 |         ];
  148 |         return {
  149 |           viewport: innerWidth,
  150 |           scroll: document.documentElement.scrollWidth,
  151 |           controls: selectors.map((selector) => {
  152 |             const node = document.querySelector(selector);
  153 |             const rect = node?.getBoundingClientRect();
  154 |             return {
  155 |               selector,
  156 |               left: rect?.left ?? 0,
  157 |               right: rect?.right ?? 0,
  158 |               width: rect?.width ?? 0,
  159 |             };
  160 |           }),
  161 |         };
  162 |       });
  163 |       expect(bounds.scroll, `${theme} overflow at ${width}px`).toBeLessThanOrEqual(
  164 |         bounds.viewport + 1,
  165 |       );
  166 |       for (const control of bounds.controls) {
  167 |         expect(
  168 |           control.left,
  169 |           `${theme} ${control.selector} left edge at ${width}px`,
  170 |         ).toBeGreaterThanOrEqual(-1);
  171 |         expect(
  172 |           control.right,
  173 |           `${theme} ${control.selector} right edge at ${width}px`,
  174 |         ).toBeLessThanOrEqual(width + 1);
  175 |       }
  176 |     }
  177 |   }
  178 | });
  179 | 
  180 | test('expedition home visual regression', async ({ page }) => {
  181 |   await page.addInitScript((key) => localStorage.setItem(key, 'expedition'), THEME_KEY);
  182 |   await page.goto('/');
  183 |   await ready(page);
> 184 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'expedition');
      |                                      ^ Error: expect(locator).toHaveAttribute(expected) failed
  185 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  186 |   await expect(page.locator('.game-hero-background')).toBeVisible();
  187 |   await expect
  188 |     .poll(() =>
  189 |       page
  190 |         .locator('.game-hero-background')
  191 |         .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
  192 |     )
  193 |     .toBe(true);
  194 |   await page.evaluate(() => document.fonts.ready);
  195 |   await expect(page).toHaveScreenshot('expedition-home.png', {
  196 |     fullPage: true,
  197 |     animations: 'disabled',
  198 |     maxDiffPixelRatio: 0.02,
  199 |   });
  200 | });
  201 | 
```