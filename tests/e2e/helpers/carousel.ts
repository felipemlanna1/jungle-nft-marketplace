import type { Locator, Page } from '@playwright/test';

export async function dragLeft(page: Page, viewport: Locator, touch: boolean) {
  await viewport.scrollIntoViewIfNeeded();
  const box = await viewport.boundingBox();
  if (!box) throw new Error('The carousel viewport is not visible.');
  const start = { x: box.x + box.width * 0.83, y: box.y + box.height * 0.6 };
  const end = { x: box.x + box.width * 0.16, y: start.y };
  if (touch) {
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
      for (let step = 1; step <= 12; step++) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: start.x + ((end.x - start.x) * step) / 12, y: start.y }],
        });
        await page.waitForTimeout(16);
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } finally {
      await client.detach();
    }
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let step = 1; step <= 12; step++) {
      await page.mouse.move(start.x + ((end.x - start.x) * step) / 12, start.y);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
  }
}
