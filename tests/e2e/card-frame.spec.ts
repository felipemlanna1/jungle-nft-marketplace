import { expect, test } from '@playwright/test';

test('catalog artwork frame has rounded corners and a visible border on larger screens', async ({
  page,
}, testInfo) => {
  for (const width of [1440, 768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/?q=Southbound');
    const frame = page.locator('.nft-card-image');
    await expect(frame).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    if (width === 1440)
      await testInfo.attach('card-frame', {
        body: await frame.screenshot(),
        contentType: 'image/png',
      });
    const layout = await frame.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const artwork = element.querySelector('img')!.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        radius: Number.parseFloat(style.borderTopLeftRadius),
        border: Number.parseFloat(style.borderTopWidth),
        borderStyle: style.borderTopStyle,
        borderColor: style.borderTopColor,
        height: frame.height,
        artworkWidth: artwork.width,
        artworkHeight: artwork.height,
        artworkFits:
          artwork.left >= frame.left &&
          artwork.right <= frame.right &&
          artwork.top >= frame.top &&
          artwork.bottom <= frame.bottom,
      };
    });
    expect(layout.radius).toBeGreaterThan(0);
    expect(layout.border).toBeGreaterThan(0);
    expect(layout.border).toBeLessThanOrEqual(2);
    expect(layout.borderStyle).toBe('solid');
    expect(layout.borderColor).not.toBe('rgba(0, 0, 0, 0)');
    if (width === 1440) expect(layout.height).toBe(300);
    else expect(layout.height).toBeGreaterThan(layout.artworkHeight);
    expect(layout.artworkWidth).toBeCloseTo(layout.artworkHeight, 1);
    expect(layout.artworkFits).toBe(true);
  }
});
