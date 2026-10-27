import { expect, test, type Locator } from '@playwright/test';

async function expectReadableStatus(card: Locator) {
  const layout = await card.evaluate((element) => {
    const image = element.querySelector('.nft-card-image')!;
    const status = image.querySelector<HTMLElement>('.edition-badge.is-sold-out')!;
    const favorite = image.querySelector('.card-action-favorite')!;
    const rarity = image.querySelector('.rarity-badge');
    const box = (node: Element) => {
      const { left, top, right, bottom, width, height } = node.getBoundingClientRect();
      return { left, top, right, bottom, width, height };
    };
    const overlap = (first: Element, second: Element) => {
      const a = box(first);
      const b = box(second);
      return (
        Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
        Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
      );
    };
    return {
      image: box(image),
      status: box(status),
      contentWidth: status.scrollWidth,
      visibleWidth: status.clientWidth,
      favoriteOverlap: overlap(status, favorite),
      rarityOverlap: rarity ? overlap(status, rarity) : 0,
    };
  });
  expect(layout.status.height).toBeLessThanOrEqual(32);
  expect(layout.status.height).toBeGreaterThanOrEqual(20);
  expect(layout.status.left).toBeGreaterThanOrEqual(layout.image.left);
  expect(layout.status.top).toBeGreaterThanOrEqual(layout.image.top);
  expect(layout.status.right).toBeLessThanOrEqual(layout.image.right);
  expect(layout.status.bottom).toBeLessThanOrEqual(layout.image.bottom);
  expect(layout.contentWidth).toBeLessThanOrEqual(layout.visibleWidth);
  expect(layout.favoriteOverlap).toBe(0);
  expect(layout.rarityOverlap).toBe(0);
}

for (const rare of [false, true]) {
  test(`sold-out ${rare ? 'rare' : 'regular'} card keeps readable labels and a working favorite`, async ({
    page,
  }, testInfo) => {
    const id = rare ? 'nft-3' : 'nft-18';
    const query = rare ? 'Neon' : 'Last Light';
    await page.goto('/?q=' + encodeURIComponent(query));
    const card = page.locator('.nft-card').filter({ has: page.locator(`a[href="/nft/${id}"]`) });
    await expect(card).toBeVisible();
    if (rare) {
      const status = await page.evaluate(async (id) => {
        const response = await fetch('/api/demo/nft-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, soldOut: true }),
        });
        return response.status;
      }, id);
      expect(status).toBe(200);
    }
    for (const width of [440, 320, 375, 390, 414, 1440]) {
      await page.setViewportSize({ width, height: 956 });
      await page.goto('/?q=' + encodeURIComponent(query));
      await expect(card.locator('.edition-badge.is-sold-out')).toHaveText('Esgotado');
      if (rare) await expect(card.locator('.rarity-badge')).toHaveText('RARO');
      await page.evaluate(() => document.fonts.ready);
      await card.hover();
      if (width === 440)
        await testInfo.attach('card-status', {
          body: await card.screenshot(),
          contentType: 'image/png',
        });
      await expectReadableStatus(card);
      await card.locator('.card-action-favorite').click();
      await expect(page).toHaveURL(/\/login\?/);
      expect(new URL(page.url()).searchParams.get('favorite')).toBe(id);
    }
  });
}
