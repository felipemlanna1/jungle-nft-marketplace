import { test, expect, type Locator } from '@playwright/test';
import { dragLeft } from './helpers/carousel';

async function expectContainedSlide(region: Locator) {
  await expect
    .poll(async () =>
      region.evaluate((node) => {
        const viewport = node.querySelector<HTMLElement>('.carousel-viewport');
        const active = node.querySelector<HTMLElement>('.carousel-slide[aria-hidden="false"]');
        if (!viewport || !active) return Infinity;
        const bounds = viewport.getBoundingClientRect();
        const slide = active.getBoundingClientRect();
        const violations = [
          Math.abs(slide.left - bounds.left),
          Math.abs(slide.width - bounds.width),
        ];
        for (const element of active.querySelectorAll(
          '.hero-copy, .hero-art, h1, .hero-description',
        )) {
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          violations.push(
            bounds.left - rect.left,
            rect.right - bounds.right,
            bounds.top - rect.top,
            rect.bottom - bounds.bottom,
          );
        }
        const copy = active.querySelector('.hero-copy')?.getBoundingClientRect();
        const artwork = active.querySelector('.hero-art')?.getBoundingClientRect();
        if (copy && artwork) violations.push(copy.right - artwork.left);
        for (const title of active.querySelectorAll('h1 span')) {
          if (!title.getBoundingClientRect().width) continue;
          const range = document.createRange();
          range.selectNodeContents(title);
          for (const rect of range.getClientRects()) {
            violations.push(bounds.left - rect.left, rect.right - bounds.right);
            if (artwork) violations.push(rect.right - artwork.left);
          }
        }
        for (const element of node.querySelectorAll('.carousel-slide[aria-hidden="true"]')) {
          const rect = element.getBoundingClientRect();
          violations.push(Math.min(bounds.right, rect.right) - Math.max(bounds.left, rect.left));
        }
        return Math.max(...violations);
      }),
    )
    .toBeLessThanOrEqual(1);
  await expect(region.locator('.carousel-viewport')).toHaveCSS('overflow-x', 'hidden');
}

for (const scenario of [
  { width: 320 },
  { width: 375 },
  { width: 390 },
  { width: 412 },
  { width: 414 },
  { width: 768 },
  { width: 1024 },
  { width: 1440 },
  { width: 1920 },
  { width: 1440, zoom: 1.25 },
]) {
  test(`hero geometry stays contained at ${scenario.width}px${scenario.zoom ? ' with 125% content scaling' : ''}`, async ({
    page,
    isMobile,
  }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: 1000 });
    await page.goto('/');
    if (scenario.zoom)
      await page.evaluate((zoom) => {
        document.documentElement.style.zoom = String(zoom);
      }, scenario.zoom);
    if (scenario.zoom) await expect(page.locator('html')).toHaveCSS('zoom', String(scenario.zoom));
    const region = page.getByRole('region', { name: 'Destaques do marketplace', exact: true });
    await expect(
      region.getByRole('button', { name: 'Ir para destaque 1', exact: true }),
    ).toHaveAttribute('aria-current', 'true');
    await page.evaluate(() => document.fonts.ready);
    await expectContainedSlide(region);
    await region.getByRole('button', { name: 'Ir para destaque 2', exact: true }).click();
    await expect(
      region.getByRole('button', { name: 'Ir para destaque 2', exact: true }),
    ).toHaveAttribute('aria-current', 'true');
    await expectContainedSlide(region);
    await testInfo.attach('second-slide', {
      body: await region.screenshot(),
      contentType: 'image/png',
    });
    await dragLeft(page, region.locator('.carousel-viewport'), isMobile);
    await expect(
      region.getByRole('button', { name: 'Ir para destaque 3', exact: true }),
    ).toHaveAttribute('aria-current', 'true');
    await expectContainedSlide(region);
    await region.focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      region.getByRole('button', { name: 'Ir para destaque 1', exact: true }),
    ).toHaveAttribute('aria-current', 'true');
    await expectContainedSlide(region);
    if (scenario.zoom) await expect(page.locator('html')).toHaveCSS('zoom', String(scenario.zoom));
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(scenario.width);
  });
}
