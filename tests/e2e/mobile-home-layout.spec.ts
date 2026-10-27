import { expect, test } from '@playwright/test';

for (const width of [320, 375, 390, 414, 440]) {
  test(`mobile catalog preserves artwork and usable navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 440 ? 956 : 896 });
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
        cards: [...document.querySelectorAll('.nft-card')]
          .filter((element) => element.querySelector('.nft-card-image > a'))
          .map((element) => {
            const card = element.getBoundingClientRect();
            const image = element.querySelector('.nft-card-image')!.getBoundingClientRect();
            const title = element.querySelector('h3')!.getBoundingClientRect();
            const price = element.querySelector('.eth-price')!.getBoundingClientRect();
            return {
              left: card.left,
              right: card.right,
              top: card.top,
              bottom: card.bottom,
              width: card.width,
              imageTop: image.top,
              imageBottom: image.bottom,
              titleTop: title.top,
              titleBottom: title.bottom,
              priceTop: price.top,
              priceBottom: price.bottom,
            };
          }),
      };
    });
    expect(geometry.documentWidth).toBe(width);
    expect(geometry.hero).toMatchObject({ x: 24, y: 101 });
    expect(geometry.hero.width).toBe(width - 48);
    expect(geometry.hero.height).toBeGreaterThanOrEqual(208);
    expect(geometry.artwork.width).toBeCloseTo(geometry.artwork.height, 1);
    expect(geometry.artwork.y - geometry.card.y).toBeCloseTo(12, 1);
    expect(geometry.favorite.y).toBe(geometry.artwork.y);
    expect(geometry.favorite.width).toBe(28);
    expect(geometry.cards.length).toBeGreaterThanOrEqual(4);
    for (let index = 0; index < geometry.cards.length; index++) {
      const card = geometry.cards[index];
      expect(card.width).toBeCloseTo((width - 64) / 2, 1);
      expect(card.priceTop).toBeGreaterThanOrEqual(card.titleBottom);
      expect(card.priceBottom).toBeLessThanOrEqual(card.bottom + 1);
      if (index % 2 === 0 && geometry.cards[index + 1]) {
        const neighbor = geometry.cards[index + 1];
        expect(card.left).toBeCloseTo(24, 1);
        expect(neighbor.right).toBeCloseTo(width - 24, 1);
        expect(neighbor.left - card.right).toBeCloseTo(16, 1);
        for (const edge of [
          'top',
          'bottom',
          'imageTop',
          'imageBottom',
          'titleTop',
          'titleBottom',
          'priceTop',
          'priceBottom',
        ] as const) {
          expect(
            Math.abs(card[edge] - neighbor[edge]),
            `Card row ${index / 2 + 1}: ${edge}`,
          ).toBeLessThanOrEqual(1);
        }
      }
    }
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
    const navigationGeometry = await opener.evaluate((button) => {
      const navigation = button.closest('.mobile-bottom-nav')!;
      const rect = (element: Element) => {
        const { left, top, right, bottom, width, height } = element.getBoundingClientRect();
        return { left, top, right, bottom, width, height };
      };
      const bounds = rect(button);
      const notch = getComputedStyle(button, '::before');
      const notchLeft = bounds.left + Number.parseFloat(notch.left);
      const notchTop = bounds.top + Number.parseFloat(notch.top);
      const notchWidth = Number.parseFloat(notch.width);
      const notchHeight = Number.parseFloat(notch.height);
      return {
        navigation: rect(navigation),
        button: bounds,
        disc: rect(button.querySelector('.mobile-nav-disc')!),
        symbol: rect(button.querySelector('.mobile-menu-symbol')!),
        notch: {
          left: notchLeft,
          top: notchTop,
          right: notchLeft + notchWidth,
          bottom: notchTop + notchHeight,
          width: notchWidth,
          height: notchHeight,
        },
        hitTargets: [...navigation.children].map((element) => rect(element)),
      };
    });
    const centerX = width / 2;
    const centerY = navigationGeometry.button.top + navigationGeometry.button.height / 2;
    expect(navigationGeometry.navigation.left).toBe(0);
    expect(navigationGeometry.navigation.right).toBe(width);
    expect(navigationGeometry.button.width).toBe(65);
    expect(navigationGeometry.button.height).toBe(65);
    expect(navigationGeometry.notch.width).toBe(81);
    expect(navigationGeometry.notch.height).toBe(81);
    for (const element of [
      navigationGeometry.button,
      navigationGeometry.disc,
      navigationGeometry.symbol,
      navigationGeometry.notch,
    ]) {
      expect(element.left + element.width / 2).toBeCloseTo(centerX, 1);
      expect(element.top + element.height / 2).toBeCloseTo(centerY, 1);
      expect(element.left).toBeGreaterThanOrEqual(0);
      expect(element.right).toBeLessThanOrEqual(width);
      expect(element.top).toBeGreaterThanOrEqual(0);
      expect(element.bottom).toBeLessThanOrEqual(navigationGeometry.navigation.bottom);
    }
    for (const target of navigationGeometry.hitTargets) {
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
    }
    await opener.hover();
    const hoveredBounds = await opener.boundingBox();
    expect(hoveredBounds?.width).toBe(navigationGeometry.button.width);
    expect(hoveredBounds?.height).toBe(navigationGeometry.button.height);
    expect(hoveredBounds?.x).toBe(navigationGeometry.button.left);
    expect(hoveredBounds?.y).toBe(navigationGeometry.button.top);
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
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(opener).toHaveCSS('outline-style', 'solid');
    await expect(opener).toHaveCSS('outline-width', '3px');
    for (const count of [1, 2, 9, 10, 99, 100]) {
      const badgeGeometry = await page.evaluate((value) => {
        const cart = document.querySelector('.mobile-bottom-nav a[href="/cart"]')!;
        let badge = cart.querySelector<HTMLSpanElement>('.mobile-cart-count');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'mobile-cart-count';
          cart.append(badge);
        }
        badge.textContent = String(value);
        const range = document.createRange();
        range.selectNodeContents(badge);
        const text = range.getBoundingClientRect();
        const bounds = badge.getBoundingClientRect();
        const target = cart.getBoundingClientRect();
        return {
          text: { left: text.left, right: text.right, top: text.top, bottom: text.bottom },
          badge: {
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
            bottom: bounds.bottom,
            width: bounds.width,
            height: bounds.height,
          },
          target: {
            left: target.left,
            right: target.right,
            top: target.top,
            bottom: target.bottom,
          },
          scrollWidth: badge.scrollWidth,
          clientWidth: badge.clientWidth,
          scrollHeight: badge.scrollHeight,
          clientHeight: badge.clientHeight,
        };
      }, count);
      expect(badgeGeometry.badge.width, `Badge ${count} width`).toBeGreaterThanOrEqual(16);
      expect(badgeGeometry.badge.height, `Badge ${count} height`).toBeGreaterThanOrEqual(16);
      for (const edge of ['left', 'top'] as const) {
        expect(badgeGeometry.text[edge], `Badge ${count} text ${edge}`).toBeGreaterThanOrEqual(
          badgeGeometry.badge[edge],
        );
        expect(badgeGeometry.badge[edge], `Badge ${count} target ${edge}`).toBeGreaterThanOrEqual(
          badgeGeometry.target[edge],
        );
      }
      for (const edge of ['right', 'bottom'] as const) {
        expect(badgeGeometry.text[edge], `Badge ${count} text ${edge}`).toBeLessThanOrEqual(
          badgeGeometry.badge[edge],
        );
        expect(badgeGeometry.badge[edge], `Badge ${count} target ${edge}`).toBeLessThanOrEqual(
          badgeGeometry.target[edge],
        );
      }
      expect(badgeGeometry.scrollWidth).toBeLessThanOrEqual(badgeGeometry.clientWidth);
      expect(badgeGeometry.scrollHeight).toBeLessThanOrEqual(badgeGeometry.clientHeight);
    }
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
