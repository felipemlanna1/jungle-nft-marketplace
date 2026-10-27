import type { Locator, Page } from '@playwright/test';

export async function dragLeft(page: Page, viewport: Locator, touch: boolean) {
  await viewport.scrollIntoViewIfNeeded();
  await viewport.evaluate(
    (node) =>
      new Promise<void>((resolve, reject) => {
        const track = node.querySelector('.carousel-track');
        if (!track) return reject(new Error('The carousel track is missing.'));
        let previous = track.getBoundingClientRect().left;
        let stable = 0;
        let frames = 0;
        function sample() {
          const position = track!.getBoundingClientRect().left;
          stable = Math.abs(position - previous) <= 0.1 ? stable + 1 : 0;
          previous = position;
          if (stable >= 6) return resolve();
          if (++frames >= 180)
            return reject(new Error('The carousel did not settle before dragging.'));
          requestAnimationFrame(sample);
        }
        requestAnimationFrame(sample);
      }),
  );
  const box = await viewport.boundingBox();
  if (!box) throw new Error('The carousel viewport is not visible.');
  const start = { x: box.x + box.width * 0.83, y: box.y + box.height * 0.6 };
  const end = { x: box.x + box.width * 0.16, y: start.y };
  if (touch) {
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Input.synthesizeScrollGesture', {
        x: start.x,
        y: start.y,
        xDistance: end.x - start.x,
        yDistance: 0,
        gestureSourceType: 'touch',
        speed: 800,
        preventFling: true,
      });
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
