# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hero-geometry.spec.ts >> hero geometry stays contained at 390px
- Location: tests/e2e/hero-geometry.spec.ts:50:3

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1
Received:    8

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Pular para o conteúdo" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e4]:
    - status "Socket conectado" [ref=e5]
    - generic [ref=e6]:
      - search [ref=e7]:
        - searchbox "Buscar obras ou criadores" [ref=e8]
        - button "Buscar" [ref=e9] [cursor=pointer]
      - button "Abrir filtros" [ref=e10] [cursor=pointer]
    - region [ref=e11]:
      - region "Destaques do marketplace" [ref=e12]:
        - generic [ref=e14]:
          - group "1 de 3" [ref=e15]:
            - generic [ref=e16]:
              - paragraph [ref=e17]: Bem-vindo à Kurio
              - heading [level=1] [ref=e18]:
                - generic [ref=e19]: SEJA DONO DACULTURA DIGITAL
              - paragraph [ref=e20]: Descubra NFTs selecionados de criadores do mundo todo.
              - link "EXPLORAR" [ref=e21] [cursor=pointer]:
                - /url: "#marketplace"
            - img "Emerald Ape, personagem de arte digital em verde esmeralda" [ref=e26]
          - group [aria-hidden] [ref=e27]:
            - generic [ref=e28]:
              - paragraph [ref=e29]: Coleções em destaque
              - heading [level=1] [ref=e30]:
                - generic [ref=e31]: LANÇAMENTOS GÊNESIS
              - paragraph [ref=e32]: Colecione edições escassas diretamente dos criadores.
              - link [ref=e33] [cursor=pointer]:
                - /url: /nft/nft-1
                - text: EXPLORAR
          - group [aria-hidden] [ref=e39]:
            - generic [ref=e40]:
              - paragraph [ref=e41]: Coleções em destaque
              - heading [level=1] [ref=e42]:
                - generic [ref=e43]: ARTE DIGITAL SELECIONADA
              - paragraph [ref=e44]: Explore novos artistas, coleções e obras digitais.
              - link [ref=e45] [cursor=pointer]:
                - /url: /nft/nft-3
                - text: EXPLORAR
        - group "Selecionar destaque" [ref=e51]:
          - button "Ir para destaque 1" [ref=e52] [cursor=pointer]
          - button "Ir para destaque 2" [ref=e54] [cursor=pointer]
          - button "Ir para destaque 3" [ref=e56] [cursor=pointer]
    - region "Marketplace" [ref=e58]:
      - heading "Marketplace" [level=2] [ref=e59]
      - generic [ref=e61]:
        - navigation "Seleção do catálogo" [ref=e63]:
          - button "Todos os NFTs" [pressed] [ref=e64] [cursor=pointer]
          - button "Novos lançamentos" [ref=e65] [cursor=pointer]
          - button "Em alta" [ref=e66] [cursor=pointer]
        - generic [ref=e67]:
          - article [ref=e68]:
            - generic [ref=e69]:
              - 'link "Ver Emerald Ape #042" [ref=e70] [cursor=pointer]':
                - /url: /nft/nft-1
                - 'img "Emerald Ape #042" [ref=e71]'
              - 'button "Adicionar Emerald Ape #042 aos favoritos" [ref=e72] [cursor=pointer]'
            - generic [ref=e75]:
              - link [ref=e77] [cursor=pointer]:
                - /url: /nft/nft-1
                - 'heading "Emerald Ape #042" [level=3] [ref=e78]'
              - strong [ref=e81]: 1.19 ETH
          - article [ref=e82]:
            - generic [ref=e83]:
              - 'link "Ver Sage Nomad #009" [ref=e84] [cursor=pointer]':
                - /url: /nft/nft-2
                - 'img "Sage Nomad #009" [ref=e85]'
              - 'button "Adicionar Sage Nomad #009 aos favoritos" [ref=e86] [cursor=pointer]'
            - generic [ref=e89]:
              - link [ref=e91] [cursor=pointer]:
                - /url: /nft/nft-2
                - 'heading "Sage Nomad #009" [level=3] [ref=e92]'
              - strong [ref=e95]: 1.69 ETH
          - article [ref=e96]:
            - generic [ref=e97]:
              - 'link "Ver Neon Vessel #552" [ref=e98] [cursor=pointer]':
                - /url: /nft/nft-3
                - 'img "Neon Vessel #552" [ref=e99]'
              - 'button "Adicionar Neon Vessel #552 aos favoritos" [ref=e100] [cursor=pointer]'
              - generic [ref=e103]: RARO
            - generic [ref=e104]:
              - link [ref=e106] [cursor=pointer]:
                - /url: /nft/nft-3
                - 'heading "Neon Vessel #552" [level=3] [ref=e107]'
              - strong [ref=e110]: 1.99 ETH
          - article [ref=e111]:
            - generic [ref=e112]:
              - 'link "Ver Cosmic Bloom #118" [ref=e113] [cursor=pointer]':
                - /url: /nft/nft-4
                - 'img "Cosmic Bloom #118" [ref=e114]'
              - 'button "Adicionar Cosmic Bloom #118 aos favoritos" [ref=e115] [cursor=pointer]'
            - generic [ref=e118]:
              - link [ref=e120] [cursor=pointer]:
                - /url: /nft/nft-4
                - 'heading "Cosmic Bloom #118" [level=3] [ref=e121]'
              - strong [ref=e124]: 1.29 ETH
          - article [ref=e125]:
            - generic [ref=e126]:
              - 'link "Ver Violet Nomad #314" [ref=e127] [cursor=pointer]':
                - /url: /nft/nft-5
                - 'img "Violet Nomad #314" [ref=e128]'
              - 'button "Adicionar Violet Nomad #314 aos favoritos" [ref=e129] [cursor=pointer]'
            - generic [ref=e132]:
              - link [ref=e134] [cursor=pointer]:
                - /url: /nft/nft-5
                - 'heading "Violet Nomad #314" [level=3] [ref=e135]'
              - strong [ref=e138]: 1.39 ETH
          - article [ref=e139]:
            - generic [ref=e140]:
              - 'link "Ver Ivory Baron #088" [ref=e141] [cursor=pointer]':
                - /url: /nft/nft-6
                - 'img "Ivory Baron #088" [ref=e142]'
              - 'button "Adicionar Ivory Baron #088 aos favoritos" [ref=e143] [cursor=pointer]'
            - generic [ref=e146]:
              - link [ref=e148] [cursor=pointer]:
                - /url: /nft/nft-6
                - 'heading "Ivory Baron #088" [level=3] [ref=e149]'
              - strong [ref=e152]: 1.79 ETH
          - article [ref=e153]:
            - generic [ref=e154]:
              - 'link "Ver Golden Beat #207" [ref=e155] [cursor=pointer]':
                - /url: /nft/nft-7
                - 'img "Golden Beat #207" [ref=e156]'
              - 'button "Adicionar Golden Beat #207 aos favoritos" [ref=e157] [cursor=pointer]'
            - generic [ref=e160]:
              - link [ref=e162] [cursor=pointer]:
                - /url: /nft/nft-7
                - 'heading "Golden Beat #207" [level=3] [ref=e163]'
              - strong [ref=e166]: 0.99 ETH
          - article [ref=e167]:
            - generic [ref=e168]:
              - 'link "Ver Golden Pulse #099" [ref=e169] [cursor=pointer]':
                - /url: /nft/nft-8
                - 'img "Golden Pulse #099" [ref=e170]'
              - 'button "Adicionar Golden Pulse #099 aos favoritos" [ref=e171] [cursor=pointer]'
            - generic [ref=e174]:
              - link [ref=e176] [cursor=pointer]:
                - /url: /nft/nft-8
                - 'heading "Golden Pulse #099" [level=3] [ref=e177]'
              - strong [ref=e180]: 0.79 ETH
          - article [ref=e181]:
            - generic [ref=e182]:
              - 'link "Ver Golden Signal #160" [ref=e183] [cursor=pointer]':
                - /url: /nft/nft-9
                - 'img "Golden Signal #160" [ref=e184]'
              - 'button "Adicionar Golden Signal #160 aos favoritos" [ref=e185] [cursor=pointer]'
            - generic [ref=e188]:
              - link [ref=e190] [cursor=pointer]:
                - /url: /nft/nft-9
                - 'heading "Golden Signal #160" [level=3] [ref=e191]'
              - strong [ref=e194]: 0.39 ETH
        - navigation "Paginação do catálogo" [ref=e195]:
          - button "Página anterior" [disabled] [ref=e196]
          - generic [ref=e199]: Página 1 de 2
          - button "Ir para página 1" [ref=e200] [cursor=pointer]: "1"
          - button "Ir para página 2" [ref=e201] [cursor=pointer]: "2"
          - button "Próxima página" [ref=e202] [cursor=pointer]
  - navigation "Navegação móvel" [ref=e205]:
    - link "Início" [ref=e206] [cursor=pointer]:
      - /url: /
    - button "Lista de interesse" [ref=e207] [cursor=pointer]
    - button "Abrir navegação" [ref=e208] [cursor=pointer]
    - link "Carrinho, 0 itens" [ref=e211] [cursor=pointer]:
      - /url: /cart
    - link "Entrar" [ref=e212] [cursor=pointer]:
      - /url: /login
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
> 36 |     .toBeLessThanOrEqual(1);
     |      ^ Error: expect(received).toBeLessThanOrEqual(expected)
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
  67 |     await expectContainedSlide(region);
  68 |     await testInfo.attach('second-slide', {
  69 |       body: await region.screenshot(),
  70 |       contentType: 'image/png',
  71 |     });
  72 |     await dragLeft(page, region.locator('.carousel-viewport'), isMobile);
  73 |     await expect(
  74 |       region.getByRole('button', { name: 'Ir para destaque 3', exact: true }),
  75 |     ).toHaveAttribute('aria-current', 'true');
  76 |     await expectContainedSlide(region);
  77 |     await region.focus();
  78 |     await page.keyboard.press('ArrowRight');
  79 |     await expect(
  80 |       region.getByRole('button', { name: 'Ir para destaque 1', exact: true }),
  81 |     ).toHaveAttribute('aria-current', 'true');
  82 |     await expectContainedSlide(region);
  83 |     await expect
  84 |       .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
  85 |       .toBeLessThanOrEqual(scenario.width);
  86 |   });
  87 | }
  88 | 
```