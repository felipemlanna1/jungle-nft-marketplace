import type { Page } from '@playwright/test';

export async function prepareVisualPage(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const height = document.documentElement.scrollHeight;
    const step = Math.max(200, innerHeight - 100);
    for (let top = 0; top < height; top += step) {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const images = [...document.images].filter((image) => {
        if (image.closest('.carousel-slide[aria-hidden="true"]')) return false;
        const rect = image.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.top < innerHeight &&
          rect.left >= 0 &&
          rect.right <= innerWidth
        );
      });
      await Promise.all(images.map((image) => image.decode()));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}
