# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hero-geometry.spec.ts >> hero geometry stays contained at 1440px with 125% content scaling
- Location: tests/e2e/hero-geometry.spec.ts:50:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('region', { name: 'Destaques do marketplace', exact: true }).getByRole('button', { name: 'Ir para destaque 3', exact: true })
Expected: "true"
Received: ""
Timeout:  8000ms

Call log:
  - Expect "toHaveAttribute" getByRole('region', { name: 'Destaques do marketplace', exact: true }).getByRole('button', { name: 'Ir para destaque 3', exact: true }) with timeout 8000ms
  - waiting for getByRole('region', { name: 'Destaques do marketplace', exact: true }).getByRole('button', { name: 'Ir para destaque 3', exact: true })
    20 × locator resolved to <button type="button" aria-label="Ir para destaque 3">…</button>
       - unexpected value "null"

```

```yaml
- button "Ir para destaque 3"
```

# Test source

```ts
  1  | import { test, expect, type Locator } from '@playwright/test';
  2  | import { dragLeft } from './helpers/carousel';
  3  | 
  4  | async function expectContainedSlide(region: Locator) {
  5  |   await expect
  6  |     .poll(async () =>
  7  |       region.evaluate((node) => {
  8  |         const viewport = node.querySelector<HTMLElement>('.carousel-viewport');
  9  |         const active = node.querySelector<HTMLElement>('.carousel-slide[aria-hidden="false"]');
  10 |         if (!viewport || !active) return Infinity;
  11 |         const bounds = viewport.getBoundingClientRect();
  12 |         const slide = active.getBoundingClientRect();
  13 |         const violations = [
  14 |           Math.abs(slide.left - bounds.left),
  15 |           Math.abs(slide.width - bounds.width),
  16 |         ];
  17 |         for (const element of active.querySelectorAll(
  18 |           '.hero-copy, .hero-art, h1, .hero-description',
  19 |         )) {
  20 |           const rect = element.getBoundingClientRect();
  21 |           if (!rect.width || !rect.height) continue;
  22 |           violations.push(
  23 |             bounds.left - rect.left,
  24 |             rect.right - bounds.right,
  25 |             bounds.top - rect.top,
  26 |             rect.bottom - bounds.bottom,
  27 |           );
  28 |         }
  29 |         for (const element of node.querySelectorAll('.carousel-slide[aria-hidden="true"]')) {
  30 |           const rect = element.getBoundingClientRect();
  31 |           violations.push(Math.min(bounds.right, rect.right) - Math.max(bounds.left, rect.left));
  32 |         }
  33 |         return Math.max(...violations);
  34 |       }),
  35 |     )
  36 |     .toBeLessThanOrEqual(1);
  37 |   await expect(region.locator('.carousel-viewport')).toHaveCSS('overflow-x', 'hidden');
  38 | }
  39 | 
  40 | for (const scenario of [
  41 |   { width: 320 },
  42 |   { width: 390 },
  43 |   { width: 414 },
  44 |   { width: 768 },
  45 |   { width: 1024 },
  46 |   { width: 1440 },
  47 |   { width: 1920 },
  48 |   { width: 1440, zoom: 1.25 },
  49 | ]) {
  50 |   test(`hero geometry stays contained at ${scenario.width}px${scenario.zoom ? ' with 125% content scaling' : ''}`, async ({
  51 |     page,
  52 |     isMobile,
  53 |   }, testInfo) => {
  54 |     await page.setViewportSize({ width: scenario.width, height: 1000 });
  55 |     await page.goto('/');
  56 |     if (scenario.zoom)
  57 |       await page.evaluate((zoom) => {
  58 |         document.documentElement.style.zoom = String(zoom);
  59 |       }, scenario.zoom);
  60 |     const region = page.getByRole('region', { name: 'Destaques do marketplace', exact: true });
  61 |     await expect(
  62 |       region.getByRole('button', { name: 'Ir para destaque 1', exact: true }),
  63 |     ).toHaveAttribute('aria-current', 'true');
  64 |     await page.evaluate(() => document.fonts.ready);
  65 |     await expectContainedSlide(region);
  66 |     await region.getByRole('button', { name: 'Ir para destaque 2', exact: true }).click();
  67 |     await expect(
  68 |       region.getByRole('button', { name: 'Ir para destaque 2', exact: true }),
  69 |     ).toHaveAttribute('aria-current', 'true');
  70 |     await expectContainedSlide(region);
  71 |     await testInfo.attach('second-slide', {
  72 |       body: await region.screenshot(),
  73 |       contentType: 'image/png',
  74 |     });
  75 |     await dragLeft(page, region.locator('.carousel-viewport'), isMobile);
  76 |     await expect(
  77 |       region.getByRole('button', { name: 'Ir para destaque 3', exact: true }),
> 78 |     ).toHaveAttribute('aria-current', 'true');
     |       ^ Error: expect(locator).toHaveAttribute(expected) failed
  79 |     await expectContainedSlide(region);
  80 |     await region.focus();
  81 |     await page.keyboard.press('ArrowRight');
  82 |     await expect(
  83 |       region.getByRole('button', { name: 'Ir para destaque 1', exact: true }),
  84 |     ).toHaveAttribute('aria-current', 'true');
  85 |     await expectContainedSlide(region);
  86 |     await expect
  87 |       .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
  88 |       .toBeLessThanOrEqual(scenario.width);
  89 |   });
  90 | }
  91 | 
```