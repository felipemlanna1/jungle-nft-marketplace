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
  - banner [ref=f1e4]:
    - generic [ref=f1e5]:
      - link "Página inicial da Kurio" [ref=f1e6] [cursor=pointer]:
        - /url: /
        - text: kurio
      - navigation "Navegação principal" [ref=f1e7]:
        - link "Início" [ref=f1e8] [cursor=pointer]:
          - /url: /
        - link "Mercado" [ref=f1e9] [cursor=pointer]:
          - /url: /#marketplace
        - generic "Conteúdo editorial fora desta demonstração" [ref=f1e10]: Criadores
        - generic "Conteúdo editorial fora desta demonstração" [ref=f1e11]: Aprenda
      - generic [ref=f1e12]:
        - button "Buscar obras ou criadores" [ref=f1e13] [cursor=pointer]
        - link "Carrinho, 1 itens" [ref=f1e14] [cursor=pointer]:
          - /url: /cart
          - generic [ref=f1e15]: "1"
        - link "Entrar" [ref=f1e16] [cursor=pointer]:
          - /url: /login
  - main [ref=f1e17]:
    - status "Socket conectado" [ref=f1e18]
    - region [ref=f1e19]:
      - region "Destaques do marketplace" [ref=f1e20]:
        - generic [ref=f1e22]:
          - group "1 de 3" [ref=f1e23]:
            - generic [ref=f1e24]:
              - paragraph [ref=f1e25]: Bem-vindo à Kurio
              - heading [level=1] [ref=f1e26]:
                - generic [ref=f1e27]: SEJA DONO DO FUTURODA ARTE DIGITAL
              - paragraph [ref=f1e28]: Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
              - link "EXPLORAR" [ref=f1e29] [cursor=pointer]:
                - /url: "#marketplace"
            - img "Emerald Ape, personagem de arte digital em verde esmeralda" [ref=f1e33]
          - group [aria-hidden] [ref=f1e34]:
            - generic [ref=f1e35]:
              - paragraph [ref=f1e36]: Coleções em destaque
              - heading [level=1] [ref=f1e37]:
                - generic [ref=f1e38]: LANÇAMENTOS GÊNESIS DE EDIÇÃO LIMITADA
              - paragraph [ref=f1e39]: Colecione edições escassas diretamente dos criadores antes da revelação pública.
              - link [ref=f1e40] [cursor=pointer]:
                - /url: /nft/nft-1
                - text: EXPLORAR
          - group [aria-hidden] [ref=f1e45]:
            - generic [ref=f1e46]:
              - paragraph [ref=f1e47]: Coleções em destaque
              - heading [level=1] [ref=f1e48]:
                - generic [ref=f1e49]: ARTE DIGITAL SELECIONADA E MUITO MAIS
              - paragraph [ref=f1e50]: Explore novos artistas, coleções e obras digitais que definem a cultura.
              - link [ref=f1e51] [cursor=pointer]:
                - /url: /nft/nft-3
                - text: EXPLORAR
        - group "Selecionar destaque" [ref=f1e56]:
          - button "Ir para destaque 1" [ref=f1e57] [cursor=pointer]
          - button "Ir para destaque 2" [ref=f1e59] [cursor=pointer]
          - button "Ir para destaque 3" [ref=f1e61] [cursor=pointer]
    - region "Marketplace" [ref=f1e63]:
      - heading "Marketplace" [level=2] [ref=f1e64]
      - generic [ref=f1e65]:
        - complementary [ref=f1e66]:
          - generic [ref=f1e67]:
            - generic [ref=f1e68]:
              - heading "Coleções" [level=3] [ref=f1e69]
              - navigation "Filtrar coleção" [ref=f1e70]:
                - button "Arte digital (5)" [ref=f1e71] [cursor=pointer]:
                  - generic [ref=f1e72]: Arte digital
                  - generic [ref=f1e73]: (5)
                - button "Fotografia (2)" [pressed] [ref=f1e74] [cursor=pointer]:
                  - generic [ref=f1e75]: Fotografia
                  - generic [ref=f1e76]: (2)
                - button "Música (1)" [ref=f1e77] [cursor=pointer]:
                  - generic [ref=f1e78]: Música
                  - generic [ref=f1e79]: (1)
                - button "Arte 3D (2)" [ref=f1e80] [cursor=pointer]:
                  - generic [ref=f1e81]: Arte 3D
                  - generic [ref=f1e82]: (2)
                - button "Colecionáveis (2)" [ref=f1e83] [cursor=pointer]:
                  - generic [ref=f1e84]: Colecionáveis
                  - generic [ref=f1e85]: (2)
                - button "Generativa (2)" [ref=f1e86] [cursor=pointer]:
                  - generic [ref=f1e87]: Generativa
                  - generic [ref=f1e88]: (2)
                - button "Jogos (1)" [ref=f1e89] [cursor=pointer]:
                  - generic [ref=f1e90]: Jogos
                  - generic [ref=f1e91]: (1)
                - button "Assinaturas (1)" [ref=f1e92] [cursor=pointer]:
                  - generic [ref=f1e93]: Assinaturas
                  - generic [ref=f1e94]: (1)
                - button "Utilidade (2)" [ref=f1e95] [cursor=pointer]:
                  - generic [ref=f1e96]: Utilidade
                  - generic [ref=f1e97]: (2)
            - generic [ref=f1e98]:
              - heading "Faixa de preço" [level=3] [ref=f1e99]
              - generic [ref=f1e100]:
                - generic [ref=f1e101]:
                  - slider "Preço mínimo em ETH": "0.02"
                  - slider "Preço máximo em ETH": "12.3"
                - generic [ref=f1e102]:
                  - generic [ref=f1e103]: "Preço:"
                  - generic [ref=f1e104]: Preço mínimo
                  - textbox "Preço mínimo" [ref=f1e105]: "0.02"
                  - generic [ref=f1e106]: "-"
                  - generic [ref=f1e107]: Preço máximo
                  - textbox "Preço máximo" [ref=f1e108]: "12.30"
                  - generic [ref=f1e109]: ETH
                - button "Aplicar" [ref=f1e110] [cursor=pointer]
            - generic [ref=f1e111]:
              - heading "Rede" [level=3] [ref=f1e112]
              - navigation "Filtrar rede" [ref=f1e113]:
                - button "Ethereum (12)" [ref=f1e114] [cursor=pointer]:
                  - generic [ref=f1e115]: Ethereum
                  - generic [ref=f1e116]: (12)
                - button "Polygon (6)" [ref=f1e117] [cursor=pointer]:
                  - generic [ref=f1e118]: Polygon
                  - generic [ref=f1e119]: (6)
                - button "Solana (0)" [ref=f1e120] [cursor=pointer]:
                  - generic [ref=f1e121]: Solana
                  - generic [ref=f1e122]: (0)
          - link "NFT EM DESTAQUE OFERTA LIMITADA Sage Nomad, personagem com chapéu e moletom roxo" [ref=f1e123] [cursor=pointer]:
            - /url: /nft/nft-2
            - strong [ref=f1e124]: NFT EM DESTAQUE
            - generic [ref=f1e125]: OFERTA LIMITADA
            - img "Sage Nomad, personagem com chapéu e moletom roxo" [ref=f1e126]
        - generic [ref=f1e127]:
          - generic [ref=f1e128]:
            - navigation "Seleção do catálogo" [ref=f1e129]:
              - button "Todos os NFTs" [pressed] [ref=f1e130] [cursor=pointer]
              - button "Novos lançamentos" [ref=f1e131] [cursor=pointer]
              - button "Em alta" [ref=f1e132] [cursor=pointer]
            - generic [ref=f1e133]:
              - generic [ref=f1e134]: "Ordenar por:"
              - combobox "Ordenar por:" [ref=f1e135] [cursor=pointer]:
                - generic: Menor preço
          - generic [ref=f1e138]:
            - generic [ref=f1e139]: 1 resultados para “Sage”
            - button "Limpar filtros" [ref=f1e140] [cursor=pointer]
          - article [ref=f1e142]:
            - generic [ref=f1e143]:
              - 'link "Ver Sage Nomad #009" [ref=f1e144] [cursor=pointer]':
                - /url: /nft/nft-2
                - 'img "Sage Nomad #009" [ref=f1e145]'
              - 'group "Ações de Sage Nomad #009" [ref=f1e146]':
                - 'button "Adicionar Sage Nomad #009 ao carrinho" [ref=f1e147] [cursor=pointer]'
                - 'button "Adicionar Sage Nomad #009 aos favoritos" [ref=f1e152] [cursor=pointer]'
                - 'button "Ampliar Sage Nomad #009" [ref=f1e155] [cursor=pointer]'
            - generic [ref=f1e159]:
              - link [ref=f1e161] [cursor=pointer]:
                - /url: /nft/nft-2
                - 'heading "Sage Nomad #009" [level=3] [ref=f1e162]'
              - strong [ref=f1e165]: 1.69 ETH
          - navigation "Paginação do catálogo" [ref=f1e166]:
            - button "Página anterior" [disabled] [ref=f1e167]
            - generic [ref=f1e170]: Página 1 de 1
            - button "Ir para página 1" [ref=f1e171] [cursor=pointer]: "1"
            - button "Próxima página" [disabled] [ref=f1e172]
    - region "Coleções em destaque" [ref=f1e175]:
      - article [ref=f1e176]:
        - img "Emerald Ape" [ref=f1e177]
        - generic [ref=f1e178]:
          - heading "Lançamentos gênesis de edição limitada" [level=2] [ref=f1e179]: Lançamentos gênesisde edição limitada
          - paragraph [ref=f1e180]: Colecione edições escassas diretamente dos criadores antes da revelação pública.
          - link "Explorar" [ref=f1e181] [cursor=pointer]:
            - /url: /nft/nft-1
      - article [ref=f1e184]:
        - img "Neon Vessel" [ref=f1e185]
        - generic [ref=f1e186]:
          - heading "Arte digital selecionada e muito mais" [level=2] [ref=f1e187]: Arte digital selecionadae muito mais
          - paragraph [ref=f1e188]: Explore novos artistas, coleções e obras digitais que definem a cultura.
          - link "Explorar" [ref=f1e189] [cursor=pointer]:
            - /url: /nft/nft-3
    - region [ref=f1e192]:
      - generic [ref=f1e193]:
        - heading "Diário da Cunhagem" [level=2] [ref=f1e194]
        - paragraph [ref=f1e195]: Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
      - generic [ref=f1e196]:
        - article [ref=f1e197]:
          - generic [ref=f1e198]:
            - paragraph [ref=f1e199]:
              - time [ref=f1e200]: 12 de setembro
              - text: "| Leitura de 6 min"
            - heading "Como funciona a propriedade de NFTs" [level=3] [ref=f1e201]
            - paragraph [ref=f1e202]: Aprenda a colecionar, negociar e verificar ativos digitais.
            - 'button "Ler mais: Como funciona a propriedade de NFTs" [ref=f1e203] [cursor=pointer]': Ler mais
        - article [ref=f1e206]:
          - generic [ref=f1e207]:
            - paragraph [ref=f1e208]:
              - time [ref=f1e209]: 13 de setembro
              - text: "| Leitura de 2 min"
            - heading "10 artistas digitais para acompanhar" [level=3] [ref=f1e210]
            - paragraph [ref=f1e211]: Conheça criadores que moldam a cultura digital.
            - 'button "Ler mais: 10 artistas digitais para acompanhar" [ref=f1e212] [cursor=pointer]': Ler mais
        - article [ref=f1e215]:
          - generic [ref=f1e216]:
            - paragraph [ref=f1e217]:
              - time [ref=f1e218]: 15 de setembro
              - text: "| Leitura de 3 min"
            - heading "Raridade, atributos e procedência" [level=3] [ref=f1e219]
            - paragraph [ref=f1e220]: Entenda raridade, procedência, direitos autorais e utilidade.
            - 'button "Ler mais: Raridade, atributos e procedência" [ref=f1e221] [cursor=pointer]': Ler mais
        - article [ref=f1e224]:
          - generic [ref=f1e225]:
            - paragraph [ref=f1e226]:
              - time [ref=f1e227]: 15 de setembro
              - text: "| Leitura de 2 min"
            - heading "Como proteger sua carteira" [level=3] [ref=f1e228]
            - paragraph [ref=f1e229]: Proteja sua carteira, seus ativos e sua identidade.
            - 'button "Ler mais: Como proteger sua carteira" [ref=f1e230] [cursor=pointer]': Ler mais
  - contentinfo "Rodapé" [ref=f1e233]:
    - generic [ref=f1e234]:
      - generic [ref=f1e235]:
        - heading "Segurança da carteira" [level=3] [ref=f1e240]
        - paragraph [ref=f1e241]: Proteja sua carteira e colecione arte digital com confiança.
      - generic [ref=f1e242]:
        - heading "Criadores em destaque" [level=3] [ref=f1e250]
        - paragraph [ref=f1e251]: Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
      - generic [ref=f1e252]:
        - heading "Alertas de lançamentos" [level=3] [ref=f1e257]
        - paragraph [ref=f1e258]: Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
      - generic [ref=f1e259]:
        - heading "Antecipe-se ao próximo lançamento" [level=3] [ref=f1e260]
        - form "Inscrição de novidades" [ref=f1e261]:
          - generic [ref=f1e262]: E-mail da newsletter
          - generic [ref=f1e263]:
            - textbox "E-mail da newsletter" [ref=f1e264]:
              - /placeholder: Digite seu e-mail
            - button "Inscrever na newsletter" [ref=f1e265] [cursor=pointer]: Enviar
        - paragraph [ref=f1e266]: Novidades das coleções em uma inscrição demonstrativa.
    - generic [ref=f1e267]:
      - link "KURIO" [ref=f1e268] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f1e269]: Feito para colecionadores,criadores e cultura
      - generic [ref=f1e270]: Contato demonstrativo
      - generic [ref=f1e271]: Sem transações reais
    - generic [ref=f1e272]:
      - generic [ref=f1e273]:
        - heading "Meu perfil" [level=3] [ref=f1e274]
        - link "Meu perfil" [ref=f1e275] [cursor=pointer]:
          - /url: /profile
        - generic [ref=f1e276]: Minha coleção
        - generic [ref=f1e277]: Atividade
        - generic [ref=f1e278]: Estúdio do criador
        - button "Lista de interesse" [ref=f1e279] [cursor=pointer]
      - generic [ref=f1e280]:
        - heading "Central de ajuda" [level=3] [ref=f1e281]
        - generic [ref=f1e282]: Central de ajuda
        - generic [ref=f1e283]: Como comprar NFTs
        - generic [ref=f1e284]: Carteira e segurança
        - generic [ref=f1e285]: Política do mercado
        - generic [ref=f1e286]: Denunciar item
      - generic [ref=f1e287]:
        - heading "Coleções" [level=3] [ref=f1e288]
        - link "Arte digital" [ref=f1e289] [cursor=pointer]:
          - /url: /?category=Art
        - link "Fotografia" [ref=f1e290] [cursor=pointer]:
          - /url: /?category=Photography
        - link "Música" [ref=f1e291] [cursor=pointer]:
          - /url: /?category=Music
        - link "Arte 3D" [ref=f1e292] [cursor=pointer]:
          - /url: /?category=3D
        - link "Utilidade" [ref=f1e293] [cursor=pointer]:
          - /url: /?category=Utility
      - generic [ref=f1e294]:
        - heading "Redes sociais" [level=3] [ref=f1e295]
        - group "Redes sociais ilustrativas" [ref=f1e296]:
          - link "Abrir Facebook em nova aba" [ref=f1e297] [cursor=pointer]:
            - /url: https://www.facebook.com/
          - link "Abrir Instagram em nova aba" [ref=f1e298] [cursor=pointer]:
            - /url: https://www.instagram.com/
          - link "Abrir X em nova aba" [ref=f1e299] [cursor=pointer]:
            - /url: https://x.com/
          - link "Abrir LinkedIn em nova aba" [ref=f1e300] [cursor=pointer]:
            - /url: https://www.linkedin.com/
          - link "Abrir YouTube em nova aba" [ref=f1e301] [cursor=pointer]:
            - /url: https://www.youtube.com/
        - generic [ref=f1e302]: Links ilustrativos do protótipo.
        - heading "Carteiras compatíveis" [level=3] [ref=f1e303]
        - paragraph [ref=f1e304]: METAMASK · WALLETCONNECT · COINBASE
        - generic [ref=f1e305]: Interface demonstrativa. Sem conexão a carteiras reais.
    - paragraph [ref=f1e306]: © 2026 Kurio. Propriedade digital para todos.
    - button "Opções da demonstração" [active] [ref=f1e307] [cursor=pointer]: Demonstração
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