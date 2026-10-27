# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kurio.spec.ts >> opening the menu preserves URL filters and cart through refresh
- Location: tests/e2e/kurio.spec.ts:133:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "http://127.0.0.1:4173/?q=Sage&category=Photography&sort=price-asc"
Received: "http://127.0.0.1:4173/?q=Sage&category=Photography&sort=price-asc&page=1&tab=all"
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - link "Pular para o conteúdo" [ref=f1e3] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=f1e4]:
    - status "Socket conectado" [ref=f1e5]
    - generic [ref=f1e6]:
      - search [ref=f1e7]:
        - searchbox "Buscar obras ou criadores" [ref=f1e8]: Sage
        - button "Buscar" [ref=f1e9] [cursor=pointer]
      - button "Abrir filtros" [ref=f1e10] [cursor=pointer]
    - region [ref=f1e11]:
      - region "Destaques do marketplace" [ref=f1e12]:
        - generic [ref=f1e14]:
          - group "1 de 3" [ref=f1e15]:
            - generic [ref=f1e16]:
              - paragraph [ref=f1e17]: Bem-vindo à Kurio
              - heading [level=1] [ref=f1e18]:
                - generic [ref=f1e19]: SEJA DONO DACULTURA DIGITAL
              - paragraph [ref=f1e20]: Descubra NFTs selecionados de criadores do mundo todo.
              - link "EXPLORAR" [ref=f1e21] [cursor=pointer]:
                - /url: "#marketplace"
            - img "Emerald Ape, personagem de arte digital em verde esmeralda" [ref=f1e26]
          - group [aria-hidden] [ref=f1e27]:
            - generic [ref=f1e28]:
              - paragraph [ref=f1e29]: Coleções em destaque
              - heading [level=1] [ref=f1e30]:
                - generic [ref=f1e31]: LANÇAMENTOS GÊNESIS
              - paragraph [ref=f1e32]: Colecione edições escassas diretamente dos criadores.
              - link [ref=f1e33] [cursor=pointer]:
                - /url: /nft/nft-1
                - text: EXPLORAR
          - group [aria-hidden] [ref=f1e39]:
            - generic [ref=f1e40]:
              - paragraph [ref=f1e41]: Coleções em destaque
              - heading [level=1] [ref=f1e42]:
                - generic [ref=f1e43]: ARTE DIGITAL SELECIONADA
              - paragraph [ref=f1e44]: Explore novos artistas, coleções e obras digitais.
              - link [ref=f1e45] [cursor=pointer]:
                - /url: /nft/nft-3
                - text: EXPLORAR
        - group "Selecionar destaque" [ref=f1e51]:
          - button "Ir para destaque 1" [ref=f1e52] [cursor=pointer]
          - button "Ir para destaque 2" [ref=f1e54] [cursor=pointer]
          - button "Ir para destaque 3" [ref=f1e56] [cursor=pointer]
    - region "Marketplace" [ref=f1e58]:
      - heading "Marketplace" [level=2] [ref=f1e59]
      - generic [ref=f1e61]:
        - navigation "Seleção do catálogo" [ref=f1e63]:
          - button "Todos os NFTs" [pressed] [ref=f1e64] [cursor=pointer]
          - button "Novos lançamentos" [ref=f1e65] [cursor=pointer]
          - button "Em alta" [ref=f1e66] [cursor=pointer]
        - generic [ref=f1e67]:
          - generic [ref=f1e68]: 1 resultados para “Sage”
          - button "Limpar filtros" [ref=f1e69] [cursor=pointer]
        - article [ref=f1e71]:
          - generic [ref=f1e72]:
            - 'link "Ver Sage Nomad #009" [ref=f1e73] [cursor=pointer]':
              - /url: /nft/nft-2
              - 'img "Sage Nomad #009" [ref=f1e74]'
            - 'group "Ações de Sage Nomad #009" [ref=f1e75]':
              - 'button "Adicionar Sage Nomad #009 ao carrinho" [ref=f1e76] [cursor=pointer]'
              - 'button "Adicionar Sage Nomad #009 aos favoritos" [ref=f1e81] [cursor=pointer]'
              - 'button "Ampliar Sage Nomad #009" [ref=f1e84] [cursor=pointer]'
          - generic [ref=f1e88]:
            - link [ref=f1e90] [cursor=pointer]:
              - /url: /nft/nft-2
              - 'heading "Sage Nomad #009" [level=3] [ref=f1e91]'
            - strong [ref=f1e94]: 1.69 ETH
        - navigation "Paginação do catálogo" [ref=f1e95]:
          - button "Página anterior" [disabled] [ref=f1e96]
          - generic [ref=f1e99]: Página 1 de 1
          - button "Ir para página 1" [ref=f1e100] [cursor=pointer]: "1"
          - button "Próxima página" [disabled] [ref=f1e101]
    - region [ref=f1e104]:
      - generic [ref=f1e105]:
        - heading "Diário da Cunhagem" [level=2] [ref=f1e106]
        - paragraph [ref=f1e107]: Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
      - generic [ref=f1e108]:
        - article [ref=f1e109]:
          - generic [ref=f1e110]:
            - paragraph [ref=f1e111]:
              - time [ref=f1e112]: 12 de setembro
              - text: "| Leitura de 6 min"
            - heading "Como funciona a propriedade de NFTs" [level=3] [ref=f1e113]
            - paragraph [ref=f1e114]: Aprenda a colecionar, negociar e verificar ativos digitais.
            - 'button "Ler mais: Como funciona a propriedade de NFTs" [ref=f1e115] [cursor=pointer]': Ler mais
        - article [ref=f1e118]:
          - generic [ref=f1e119]:
            - paragraph [ref=f1e120]:
              - time [ref=f1e121]: 13 de setembro
              - text: "| Leitura de 2 min"
            - heading "10 artistas digitais para acompanhar" [level=3] [ref=f1e122]
            - paragraph [ref=f1e123]: Conheça criadores que moldam a cultura digital.
            - 'button "Ler mais: 10 artistas digitais para acompanhar" [ref=f1e124] [cursor=pointer]': Ler mais
        - article [ref=f1e127]:
          - generic [ref=f1e128]:
            - paragraph [ref=f1e129]:
              - time [ref=f1e130]: 15 de setembro
              - text: "| Leitura de 3 min"
            - heading "Raridade, atributos e procedência" [level=3] [ref=f1e131]
            - paragraph [ref=f1e132]: Entenda raridade, procedência, direitos autorais e utilidade.
            - 'button "Ler mais: Raridade, atributos e procedência" [ref=f1e133] [cursor=pointer]': Ler mais
        - article [ref=f1e136]:
          - generic [ref=f1e137]:
            - paragraph [ref=f1e138]:
              - time [ref=f1e139]: 15 de setembro
              - text: "| Leitura de 2 min"
            - heading "Como proteger sua carteira" [level=3] [ref=f1e140]
            - paragraph [ref=f1e141]: Proteja sua carteira, seus ativos e sua identidade.
            - 'button "Ler mais: Como proteger sua carteira" [ref=f1e142] [cursor=pointer]': Ler mais
  - contentinfo "Rodapé" [ref=f1e145]:
    - generic [ref=f1e146]:
      - generic [ref=f1e147]:
        - heading "Segurança da carteira" [level=3] [ref=f1e152]
        - paragraph [ref=f1e153]: Proteja sua carteira e colecione arte digital com confiança.
      - generic [ref=f1e154]:
        - heading "Criadores em destaque" [level=3] [ref=f1e162]
        - paragraph [ref=f1e163]: Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
      - generic [ref=f1e164]:
        - heading "Alertas de lançamentos" [level=3] [ref=f1e169]
        - paragraph [ref=f1e170]: Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
      - generic [ref=f1e171]:
        - heading "Antecipe-se ao próximo lançamento" [level=3] [ref=f1e172]
        - form "Inscrição de novidades" [ref=f1e173]:
          - generic [ref=f1e174]: E-mail da newsletter
          - generic [ref=f1e175]:
            - textbox "E-mail da newsletter" [ref=f1e176]:
              - /placeholder: Digite seu e-mail
            - button "Inscrever na newsletter" [ref=f1e177] [cursor=pointer]: Enviar
        - paragraph [ref=f1e178]: Novidades das coleções em uma inscrição demonstrativa.
    - generic [ref=f1e179]:
      - link "KURIO" [ref=f1e180] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f1e181]: Feito para colecionadores,criadores e cultura
      - generic [ref=f1e182]: Contato demonstrativo
      - generic [ref=f1e183]: Sem transações reais
    - generic [ref=f1e184]:
      - generic [ref=f1e185]:
        - heading "Meu perfil" [level=3] [ref=f1e186]
        - link "Meu perfil" [ref=f1e187] [cursor=pointer]:
          - /url: /profile
        - generic [ref=f1e188]: Minha coleção
        - generic [ref=f1e189]: Atividade
        - generic [ref=f1e190]: Estúdio do criador
        - button "Lista de interesse" [ref=f1e191] [cursor=pointer]
      - generic [ref=f1e192]:
        - heading "Central de ajuda" [level=3] [ref=f1e193]
        - generic [ref=f1e194]: Central de ajuda
        - generic [ref=f1e195]: Como comprar NFTs
        - generic [ref=f1e196]: Carteira e segurança
        - generic [ref=f1e197]: Política do mercado
        - generic [ref=f1e198]: Denunciar item
      - generic [ref=f1e199]:
        - heading "Coleções" [level=3] [ref=f1e200]
        - link "Arte digital" [ref=f1e201] [cursor=pointer]:
          - /url: /?category=Art
        - link "Fotografia" [ref=f1e202] [cursor=pointer]:
          - /url: /?category=Photography
        - link "Música" [ref=f1e203] [cursor=pointer]:
          - /url: /?category=Music
        - link "Arte 3D" [ref=f1e204] [cursor=pointer]:
          - /url: /?category=3D
        - link "Utilidade" [ref=f1e205] [cursor=pointer]:
          - /url: /?category=Utility
      - generic [ref=f1e206]:
        - heading "Redes sociais" [level=3] [ref=f1e207]
        - group "Redes sociais ilustrativas" [ref=f1e208]:
          - link "Abrir Facebook em nova aba" [ref=f1e209] [cursor=pointer]:
            - /url: https://www.facebook.com/
          - link "Abrir Instagram em nova aba" [ref=f1e210] [cursor=pointer]:
            - /url: https://www.instagram.com/
          - link "Abrir X em nova aba" [ref=f1e211] [cursor=pointer]:
            - /url: https://x.com/
          - link "Abrir LinkedIn em nova aba" [ref=f1e212] [cursor=pointer]:
            - /url: https://www.linkedin.com/
          - link "Abrir YouTube em nova aba" [ref=f1e213] [cursor=pointer]:
            - /url: https://www.youtube.com/
        - generic [ref=f1e214]: Links ilustrativos do protótipo.
        - heading "Carteiras compatíveis" [level=3] [ref=f1e215]
        - paragraph [ref=f1e216]: METAMASK · WALLETCONNECT · COINBASE
        - generic [ref=f1e217]: Interface demonstrativa. Sem conexão a carteiras reais.
    - paragraph [ref=f1e218]: © 2026 Kurio. Propriedade digital para todos.
    - button "Opções da demonstração" [active] [ref=f1e219] [cursor=pointer]: Demonstração
  - navigation "Navegação móvel" [ref=f1e220]:
    - link "Início" [ref=f1e221] [cursor=pointer]:
      - /url: /
    - button "Lista de interesse" [ref=f1e222] [cursor=pointer]
    - button "Abrir navegação" [ref=f1e223] [cursor=pointer]
    - link "Carrinho, 1 itens" [ref=f1e226] [cursor=pointer]:
      - /url: /cart
      - generic [ref=f1e227]: "1"
    - link "Entrar" [ref=f1e228] [cursor=pointer]:
      - /url: /login
```

# Test source

```ts
  40  |   await expect(
  41  |     page.getByRole('region', { name: 'Itens no seu carrinho', exact: true }),
  42  |   ).toBeVisible();
  43  |   await expectKurio(page);
  44  |   await login(page, '/checkout');
  45  |   await expect(page.getByRole('heading', { name: 'Pagamento seguro', exact: true })).toBeVisible();
  46  |   await expectKurio(page);
  47  |   await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  48  |   await page.getByRole('button', { name: 'Revisar compra', exact: true }).click();
  49  |   await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  50  |   await expect(
  51  |     page.getByRole('heading', { name: 'Compra confirmada!', exact: true }),
  52  |   ).toBeVisible();
  53  |   await expect(page).toHaveURL(/\/orders\//);
  54  |   await expectKurio(page);
  55  |   await page.getByRole('button', { name: 'Fechar comprovante', exact: true }).click();
  56  |   await page.goto('/profile');
  57  |   await expect(
  58  |     page.getByRole('heading', { name: 'Perfil do colecionador', exact: true }),
  59  |   ).toBeVisible();
  60  |   await expectKurio(page);
  61  |   await page.goto('/wallets');
  62  |   await expect(
  63  |     page.getByRole('heading', { name: 'Carteira principal', exact: true }),
  64  |   ).toBeVisible();
  65  |   await expectKurio(page);
  66  |   await page.goto('/register');
  67  |   await expect(page.getByRole('dialog', { name: 'Criar perfil de colecionador' })).toBeVisible();
  68  |   await expectKurio(page);
  69  |   await page.goto('/not-a-route');
  70  |   await expect(
  71  |     page.getByRole('heading', { name: 'Página não encontrada', exact: true }),
  72  |   ).toBeVisible();
  73  |   await expectKurio(page);
  74  | });
  75  | 
  76  | for (const preference of ['expedition', 'unsupported'] as const) {
  77  |   test(`a saved ${preference} preference migrates to Kurio without a switcher`, async ({
  78  |     page,
  79  |   }) => {
  80  |     await page.addInitScript(
  81  |       ({ key, version, preference }) => {
  82  |         const seeded = 'test:legacy-appearance-seeded';
  83  |         if (sessionStorage.getItem(seeded)) return;
  84  |         localStorage.setItem(key, preference);
  85  |         localStorage.setItem(version, '2');
  86  |         sessionStorage.setItem(seeded, 'true');
  87  |       },
  88  |       { key: THEME_KEY, version: VERSION_KEY, preference },
  89  |     );
  90  |     await page.goto('/');
  91  |     await expect(page.locator('#hero-title')).toBeVisible();
  92  |     await expectKurio(page);
  93  |     await expect
  94  |       .poll(() => page.evaluate((key) => localStorage.getItem(key), THEME_KEY))
  95  |       .toBe('kurio');
  96  |     expect(await page.evaluate((key) => localStorage.getItem(key), VERSION_KEY)).toBe('3');
  97  |     await page.reload();
  98  |     await expect(page.locator('#hero-title')).toBeVisible();
  99  |     await expectKurio(page);
  100 |     await openOptions(page);
  101 |     await expect(page.getByRole('button', { name: /^(Jungle|Kurio)$/ })).toHaveCount(0);
  102 |   });
  103 | }
  104 | 
  105 | test('blocked appearance storage still renders Kurio and an accessible menu', async ({ page }) => {
  106 |   await page.addInitScript(
  107 |     ({ key, version }) => {
  108 |       const get = Storage.prototype.getItem;
  109 |       const set = Storage.prototype.setItem;
  110 |       Storage.prototype.getItem = function (name: string) {
  111 |         if (name === key || name === version)
  112 |           throw new DOMException('Appearance storage blocked', 'SecurityError');
  113 |         return get.call(this, name);
  114 |       };
  115 |       Storage.prototype.setItem = function (name: string, value: string) {
  116 |         if (name === key || name === version)
  117 |           throw new DOMException('Appearance storage blocked', 'SecurityError');
  118 |         return set.call(this, name, value);
  119 |       };
  120 |     },
  121 |     { key: THEME_KEY, version: VERSION_KEY },
  122 |   );
  123 |   const errors: string[] = [];
  124 |   page.on('pageerror', (error) => errors.push(error.message));
  125 |   await page.goto('/');
  126 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  127 |   await expectKurio(page);
  128 |   await openOptions(page);
  129 |   await closeOptions(page);
  130 |   expect(errors).toEqual([]);
  131 | });
  132 | 
  133 | test('opening the menu preserves URL filters and cart through refresh', async ({ page }) => {
  134 |   await addCollectible(page);
  135 |   await page.goto('/?q=Sage&category=Photography&sort=price-asc');
  136 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  137 |   const original = page.url();
  138 |   await openOptions(page);
  139 |   await closeOptions(page);
> 140 |   expect(page.url()).toBe(original);
      |                      ^ Error: expect(received).toBe(expected) // Object.is equality
  141 |   await expect(page.getByRole('link', { name: 'Carrinho, 1 itens', exact: true })).toBeVisible();
  142 |   await page.reload();
  143 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  144 |   expect(page.url()).toBe(original);
  145 |   expect(new URL(page.url()).searchParams.get('q')).toBe('Sage');
  146 |   await expect(page.getByRole('link', { name: 'Carrinho, 1 itens', exact: true })).toBeVisible();
  147 |   await expectKurio(page);
  148 | });
  149 | 
  150 | test('menu keyboard navigation preserves an unsaved profile and restores trigger focus', async ({
  151 |   page,
  152 | }) => {
  153 |   await login(page, '/profile');
  154 |   const name = page.getByLabel('Nome de exibição', { exact: true });
  155 |   await expect(name).toHaveValue('Alex Collector');
  156 |   await name.fill('Unsaved profile menu draft');
  157 |   await openOptions(page);
  158 |   const menu = page.getByRole('dialog', { name: 'Sua conta', exact: true });
  159 |   const profile = menu.getByRole('link', { name: 'Perfil', exact: true });
  160 |   await profile.focus();
  161 |   await page.keyboard.press('Tab');
  162 |   await expect(menu.getByRole('link', { name: 'Carteiras', exact: true })).toBeFocused();
  163 |   await page.keyboard.press('Escape');
  164 |   await expect(menu).toBeHidden();
  165 |   await expect(name).toHaveValue('Unsaved profile menu draft');
  166 |   const footer = page.getByRole('button', { name: 'Opções da demonstração', exact: true });
  167 |   if (await footer.isVisible()) await expect(footer).toBeFocused();
  168 |   else
  169 |     await expect(
  170 |       page.getByRole('button', { name: 'Abrir navegação', exact: true }).first(),
  171 |     ).toBeFocused();
  172 |   await expectKurio(page);
  173 | });
  174 | 
  175 | test('opening the menu preserves a checkout draft and review without creating an order', async ({
  176 |   page,
  177 | }) => {
  178 |   await addCollectible(page);
  179 |   await login(page, '/checkout');
  180 |   await page.getByLabel('Nome completo', { exact: true }).fill('Unsaved checkout menu draft');
  181 |   await page.getByLabel('E-mail', { exact: true }).fill('draft@example.test');
  182 |   await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  183 |   await page.getByRole('button', { name: 'Revisar compra', exact: true }).click();
  184 |   await expect(page.getByRole('region', { name: 'Revisão do pedido' })).toBeVisible();
  185 |   await openOptions(page);
  186 |   await closeOptions(page);
  187 |   await expect(page.getByText('Unsaved checkout menu draft', { exact: true })).toBeVisible();
  188 |   await expect(page.getByText('draft@example.test', { exact: true })).toBeVisible();
  189 |   expect(
  190 |     await page.evaluate(
  191 |       () => Object.keys(JSON.parse(localStorage.getItem('jungle.demo.database.v1')!).orders).length,
  192 |     ),
  193 |   ).toBe(0);
  194 |   await page.getByRole('button', { name: 'Editar dados', exact: true }).click();
  195 |   await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue(
  196 |     'Unsaved checkout menu draft',
  197 |   );
  198 |   await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('draft@example.test');
  199 |   await expectKurio(page);
  200 | });
  201 | 
  202 | test('Kurio critical controls stay within 320, 390, 768 and 1440 pixel viewports', async ({
  203 |   page,
  204 | }) => {
  205 |   await page.goto('/');
  206 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  207 |   for (const width of [320, 390, 768, 1440]) {
  208 |     await page.setViewportSize({ width, height: 1000 });
  209 |     const bounds = await page.evaluate(() => ({
  210 |       viewport: innerWidth,
  211 |       scroll: document.documentElement.scrollWidth,
  212 |       controls: [
  213 |         '.header-inner',
  214 |         '.header-actions',
  215 |         '.cart-link',
  216 |         '.mobile-catalog-tools',
  217 |         '.catalog-toolbar',
  218 |         '#hero-title',
  219 |       ].map((selector) => {
  220 |         const rect = document.querySelector(selector)?.getBoundingClientRect();
  221 |         return { selector, left: rect?.left ?? 0, right: rect?.right ?? 0 };
  222 |       }),
  223 |     }));
  224 |     expect(bounds.scroll, `overflow at ${width}px`).toBeLessThanOrEqual(bounds.viewport + 1);
  225 |     for (const control of bounds.controls) {
  226 |       expect(control.left, `${control.selector} left at ${width}px`).toBeGreaterThanOrEqual(-1);
  227 |       expect(control.right, `${control.selector} right at ${width}px`).toBeLessThanOrEqual(
  228 |         width + 1,
  229 |       );
  230 |     }
  231 |     await expectKurio(page);
  232 |   }
  233 | });
  234 | 
```