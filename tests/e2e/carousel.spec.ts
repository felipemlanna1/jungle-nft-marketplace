import { dragLeft } from './helpers/carousel';
import { test, expect, type Page } from '@playwright/test';

const heroName = 'Destaques do marketplace';

async function hero(page: Page) {
  await page.goto('/');
  const region = page.getByRole('region', { name: heroName, exact: true });
  await expect(region).toBeVisible();
  await expect(region.getByRole('button', { name: /^Ir para destaque / })).toHaveCount(3);
  return region;
}

test('hero highlights support dots, keyboard navigation and real pointer dragging', async ({
  page,
}, testInfo) => {
  const region = await hero(page);
  const first = region.getByRole('button', { name: 'Ir para destaque 1', exact: true });
  const second = region.getByRole('button', { name: 'Ir para destaque 2', exact: true });
  const third = region.getByRole('button', { name: 'Ir para destaque 3', exact: true });
  await expect(first).toHaveAttribute('aria-current', 'true');
  await second.click();
  await expect(second).toHaveAttribute('aria-current', 'true');
  await region.focus();
  await page.keyboard.press('End');
  await expect(third).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('Home');
  await expect(first).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(second).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(first).toHaveAttribute('aria-current', 'true');
  await expect
    .poll(() =>
      region.evaluate((node) => {
        const viewport = node.querySelector('.carousel-viewport');
        const slide = node.querySelector('.carousel-slide');
        if (!viewport || !slide) return Infinity;
        return Math.abs(viewport.getBoundingClientRect().left - slide.getBoundingClientRect().left);
      }),
    )
    .toBeLessThanOrEqual(1);
  await dragLeft(
    page,
    region.locator('.carousel-viewport').first(),
    testInfo.project.name === 'mobile',
  );
  await expect(first).not.toHaveAttribute('aria-current', 'true');
  await expect(page).toHaveURL(/\/(?:\?.*)?$/);
});

test('reduced motion changes are honored by immediate highlight positioning', async ({ page }) => {
  const region = await hero(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await region.getByRole('button', { name: 'Ir para destaque 3', exact: true }).click();
  const distance = await region.evaluate((node) => {
    const viewport = node.querySelector('.carousel-viewport');
    const slide = node.querySelectorAll('.carousel-slide')[2];
    if (!viewport || !slide) throw new Error('The highlight slide is missing.');
    return Math.abs(viewport.getBoundingClientRect().left - slide.getBoundingClientRect().left);
  });
  expect(distance).toBeLessThanOrEqual(1);
  await expect(
    region.getByRole('button', { name: 'Ir para destaque 3', exact: true }),
  ).toHaveAttribute('aria-current', 'true');
});

test('related collectibles navigate actual slides without leaving the current artwork', async ({
  page,
}) => {
  await page.goto('/nft/nft-1');
  const region = page.getByRole('region', { name: 'Mais desta coleção', exact: true });
  await expect(region.getByRole('link', { name: /^Ver / }).first()).toBeVisible();
  const next = region.getByRole('button', { name: 'Próximo destaque', exact: true });
  const previous = region.getByRole('button', { name: 'Destaque anterior', exact: true });
  await expect(next).toBeEnabled();
  await expect(previous).toBeDisabled();
  const track = region.locator('.carousel-track');
  const before = await track.getAttribute('style');
  await next.click();
  await expect(
    region.getByRole('button', { name: 'Ir para destaque 2', exact: true }),
  ).toHaveAttribute('aria-current', 'true');
  await expect.poll(() => track.getAttribute('style')).not.toBe(before);
  await previous.click();
  await expect(
    region.getByRole('button', { name: 'Ir para destaque 1', exact: true }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(page).toHaveURL(/\/nft\/nft-1$/);
});
