import { expect, test } from '@playwright/test';

for (const width of [320, 375, 390, 414, 440]) {
  test(`mobile catalog preserves artwork and usable navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 896 });
    await page.goto('/');
    const firstCard = page
      .locator('.nft-card')
      .filter({ has: page.locator('.nft-card-image') })
      .first();
    await expect(firstCard.locator('.nft-card-image')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      };
      return {
        documentWidth: document.documentElement.scrollWidth,
        hero: rect('.kurio-hero'),
        card: rect('.nft-card-image'),
        artwork: rect('.nft-card-image > a'),
        favorite: rect('.card-action-favorite'),
        tabs: [...document.querySelectorAll('.catalog-tabs button')].map((element) => {
          const { left, right, height } = element.getBoundingClientRect();
          return { left, right, height };
        }),
      };
    });
    expect(geometry.documentWidth).toBe(width);
    expect(geometry.hero).toMatchObject({ x: 24, y: 101, height: 190 });
    expect(geometry.artwork.width).toBeCloseTo(geometry.artwork.height, 1);
    expect(geometry.artwork.y - geometry.card.y).toBeCloseTo(12, 1);
    expect(geometry.favorite.y).toBe(geometry.artwork.y);
    expect(geometry.favorite.width).toBe(28);
    for (let index = 0; index < geometry.tabs.length; index++) {
      expect(geometry.tabs[index].height).toBeGreaterThanOrEqual(24);
      if (index)
        expect(geometry.tabs[index].left - geometry.tabs[index - 1].right).toBeGreaterThanOrEqual(
          16,
        );
    }
    await expect(firstCard.locator('.card-action-add')).toBeHidden();
    await expect(firstCard.locator('.card-action-preview')).toBeHidden();
    await expect(firstCard.locator('.card-action-favorite')).toBeVisible();
    await page.getByRole('button', { name: 'Em alta', exact: true }).click();
    await expect(page).toHaveURL(/tab=trending/);
    await expect(page.getByRole('button', { name: 'Em alta', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Em alta', exact: true })).toHaveCSS(
      'font-weight',
      '700',
    );
    await expect(page.getByRole('button', { name: 'Todos os NFTs', exact: true })).toHaveCSS(
      'font-weight',
      '400',
    );
    const opener = page.getByRole('button', { name: 'Abrir navegação', exact: true }).last();
    await opener.click();
    const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
    await expect(menu).toBeVisible();
    const menuBounds = await menu.boundingBox();
    expect(menuBounds?.x).toBeGreaterThanOrEqual(0);
    expect((menuBounds?.x ?? Infinity) + (menuBounds?.width ?? Infinity)).toBeLessThanOrEqual(
      width,
    );
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(opener).toBeFocused();
    await page
      .getByRole('textbox', { name: 'E-mail da newsletter', exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole('button', { name: 'Enviar inscrição na newsletter', exact: true }),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const finalGeometry = await page.evaluate(() => {
      const options = document.querySelector('.demo-options-link')?.getBoundingClientRect();
      const navigation = document.querySelector('.mobile-bottom-nav')?.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.scrollWidth,
        optionsBottom: options?.bottom,
        navigationTop: navigation?.top,
      };
    });
    expect(finalGeometry.documentWidth).toBe(width);
    expect(finalGeometry.optionsBottom).toBeLessThanOrEqual(finalGeometry.navigationTop ?? 0);
  });
}
