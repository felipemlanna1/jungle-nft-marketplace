# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: newsletter.spec.ts >> newsletter confirms a real simulated POST and deduplicates repeated subscriptions
- Location: tests/e2e/newsletter.spec.ts:22:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForResponse: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f2e2]:
  - link "Pular para o conteúdo" [ref=f2e3] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=f2e4]:
    - status "Socket conectado" [ref=f2e5]
    - generic [ref=f2e6]:
      - search [ref=f2e7]:
        - searchbox "Buscar obras ou criadores" [ref=f2e8]
        - button "Buscar" [ref=f2e9] [cursor=pointer]
      - button "Abrir filtros" [ref=f2e10] [cursor=pointer]
    - region [ref=f2e11]:
      - region "Destaques do marketplace" [ref=f2e12]:
        - generic [ref=f2e14]:
          - group "1 de 3" [ref=f2e15]:
            - generic [ref=f2e16]:
              - paragraph [ref=f2e17]: Bem-vindo à Kurio
              - heading [level=1] [ref=f2e18]:
                - generic [ref=f2e19]: SEJA DONO DACULTURA DIGITAL
              - paragraph [ref=f2e20]: Descubra NFTs selecionados de criadores do mundo todo.
              - link "EXPLORAR" [ref=f2e21] [cursor=pointer]:
                - /url: "#marketplace"
            - img "Emerald Ape, personagem de arte digital em verde esmeralda" [ref=f2e26]
          - group [aria-hidden] [ref=f2e27]:
            - generic [ref=f2e28]:
              - paragraph [ref=f2e29]: Coleções em destaque
              - heading [level=1] [ref=f2e30]:
                - generic [ref=f2e31]: LANÇAMENTOS GÊNESIS
              - paragraph [ref=f2e32]: Colecione edições escassas diretamente dos criadores.
              - link [ref=f2e33] [cursor=pointer]:
                - /url: /nft/nft-1
                - text: EXPLORAR
          - group [aria-hidden] [ref=f2e39]:
            - generic [ref=f2e40]:
              - paragraph [ref=f2e41]: Coleções em destaque
              - heading [level=1] [ref=f2e42]:
                - generic [ref=f2e43]: ARTE DIGITAL SELECIONADA
              - paragraph [ref=f2e44]: Explore novos artistas, coleções e obras digitais.
              - link [ref=f2e45] [cursor=pointer]:
                - /url: /nft/nft-3
                - text: EXPLORAR
        - group "Selecionar destaque" [ref=f2e51]:
          - button "Ir para destaque 1" [ref=f2e52] [cursor=pointer]
          - button "Ir para destaque 2" [ref=f2e54] [cursor=pointer]
          - button "Ir para destaque 3" [ref=f2e56] [cursor=pointer]
    - region "Marketplace" [ref=f2e58]:
      - heading "Marketplace" [level=2] [ref=f2e59]
      - generic [ref=f2e61]:
        - navigation "Seleção do catálogo" [ref=f2e63]:
          - button "Todos os NFTs" [pressed] [ref=f2e64] [cursor=pointer]
          - button "Novos lançamentos" [ref=f2e65] [cursor=pointer]
          - button "Em alta" [ref=f2e66] [cursor=pointer]
        - generic [ref=f2e67]:
          - article [ref=f2e68]:
            - generic [ref=f2e69]:
              - 'link "Ver Emerald Ape #042" [ref=f2e70] [cursor=pointer]':
                - /url: /nft/nft-1
                - 'img "Emerald Ape #042" [ref=f2e71]'
              - 'group "Ações de Emerald Ape #042" [ref=f2e72]':
                - 'button "Adicionar Emerald Ape #042 aos favoritos" [ref=f2e73] [cursor=pointer]'
            - generic [ref=f2e76]:
              - link [ref=f2e78] [cursor=pointer]:
                - /url: /nft/nft-1
                - 'heading "Emerald Ape #042" [level=3] [ref=f2e79]'
              - strong [ref=f2e82]: 1.19 ETH
          - article [ref=f2e83]:
            - generic [ref=f2e84]:
              - 'link "Ver Sage Nomad #009" [ref=f2e85] [cursor=pointer]':
                - /url: /nft/nft-2
                - 'img "Sage Nomad #009" [ref=f2e86]'
              - 'group "Ações de Sage Nomad #009" [ref=f2e87]':
                - 'button "Adicionar Sage Nomad #009 aos favoritos" [ref=f2e88] [cursor=pointer]'
            - generic [ref=f2e91]:
              - link [ref=f2e93] [cursor=pointer]:
                - /url: /nft/nft-2
                - 'heading "Sage Nomad #009" [level=3] [ref=f2e94]'
              - strong [ref=f2e97]: 1.69 ETH
          - article [ref=f2e98]:
            - generic [ref=f2e99]:
              - 'link "Ver Neon Vessel #552" [ref=f2e100] [cursor=pointer]':
                - /url: /nft/nft-3
                - 'img "Neon Vessel #552" [ref=f2e101]'
              - 'group "Ações de Neon Vessel #552" [ref=f2e102]':
                - 'button "Adicionar Neon Vessel #552 aos favoritos" [ref=f2e103] [cursor=pointer]'
              - generic [ref=f2e106]: RARO
            - generic [ref=f2e107]:
              - link [ref=f2e109] [cursor=pointer]:
                - /url: /nft/nft-3
                - 'heading "Neon Vessel #552" [level=3] [ref=f2e110]'
              - strong [ref=f2e113]: 1.99 ETH
          - article [ref=f2e114]:
            - generic [ref=f2e115]:
              - 'link "Ver Cosmic Bloom #118" [ref=f2e116] [cursor=pointer]':
                - /url: /nft/nft-4
                - 'img "Cosmic Bloom #118" [ref=f2e117]'
              - 'group "Ações de Cosmic Bloom #118" [ref=f2e118]':
                - 'button "Adicionar Cosmic Bloom #118 aos favoritos" [ref=f2e119] [cursor=pointer]'
            - generic [ref=f2e122]:
              - link [ref=f2e124] [cursor=pointer]:
                - /url: /nft/nft-4
                - 'heading "Cosmic Bloom #118" [level=3] [ref=f2e125]'
              - strong [ref=f2e128]: 1.29 ETH
          - article [ref=f2e129]:
            - generic [ref=f2e130]:
              - 'link "Ver Violet Nomad #314" [ref=f2e131] [cursor=pointer]':
                - /url: /nft/nft-5
                - 'img "Violet Nomad #314" [ref=f2e132]'
              - 'group "Ações de Violet Nomad #314" [ref=f2e133]':
                - 'button "Adicionar Violet Nomad #314 aos favoritos" [ref=f2e134] [cursor=pointer]'
            - generic [ref=f2e137]:
              - link [ref=f2e139] [cursor=pointer]:
                - /url: /nft/nft-5
                - 'heading "Violet Nomad #314" [level=3] [ref=f2e140]'
              - strong [ref=f2e143]: 1.39 ETH
          - article [ref=f2e144]:
            - generic [ref=f2e145]:
              - 'link "Ver Ivory Baron #088" [ref=f2e146] [cursor=pointer]':
                - /url: /nft/nft-6
                - 'img "Ivory Baron #088" [ref=f2e147]'
              - 'group "Ações de Ivory Baron #088" [ref=f2e148]':
                - 'button "Adicionar Ivory Baron #088 aos favoritos" [ref=f2e149] [cursor=pointer]'
            - generic [ref=f2e152]:
              - link [ref=f2e154] [cursor=pointer]:
                - /url: /nft/nft-6
                - 'heading "Ivory Baron #088" [level=3] [ref=f2e155]'
              - strong [ref=f2e158]: 1.79 ETH
          - article [ref=f2e159]:
            - generic [ref=f2e160]:
              - 'link "Ver Golden Beat #207" [ref=f2e161] [cursor=pointer]':
                - /url: /nft/nft-7
                - 'img "Golden Beat #207" [ref=f2e162]'
              - 'group "Ações de Golden Beat #207" [ref=f2e163]':
                - 'button "Adicionar Golden Beat #207 aos favoritos" [ref=f2e164] [cursor=pointer]'
            - generic [ref=f2e167]:
              - link [ref=f2e169] [cursor=pointer]:
                - /url: /nft/nft-7
                - 'heading "Golden Beat #207" [level=3] [ref=f2e170]'
              - strong [ref=f2e173]: 0.99 ETH
          - article [ref=f2e174]:
            - generic [ref=f2e175]:
              - 'link "Ver Golden Pulse #099" [ref=f2e176] [cursor=pointer]':
                - /url: /nft/nft-8
                - 'img "Golden Pulse #099" [ref=f2e177]'
              - 'group "Ações de Golden Pulse #099" [ref=f2e178]':
                - 'button "Adicionar Golden Pulse #099 aos favoritos" [ref=f2e179] [cursor=pointer]'
            - generic [ref=f2e182]:
              - link [ref=f2e184] [cursor=pointer]:
                - /url: /nft/nft-8
                - 'heading "Golden Pulse #099" [level=3] [ref=f2e185]'
              - strong [ref=f2e188]: 0.79 ETH
          - article [ref=f2e189]:
            - generic [ref=f2e190]:
              - 'link "Ver Golden Signal #160" [ref=f2e191] [cursor=pointer]':
                - /url: /nft/nft-9
                - 'img "Golden Signal #160" [ref=f2e192]'
              - 'group "Ações de Golden Signal #160" [ref=f2e193]':
                - 'button "Adicionar Golden Signal #160 aos favoritos" [ref=f2e194] [cursor=pointer]'
            - generic [ref=f2e197]:
              - link [ref=f2e199] [cursor=pointer]:
                - /url: /nft/nft-9
                - 'heading "Golden Signal #160" [level=3] [ref=f2e200]'
              - strong [ref=f2e203]: 0.39 ETH
        - navigation "Paginação do catálogo" [ref=f2e204]:
          - button "Página anterior" [disabled] [ref=f2e205]
          - generic [ref=f2e208]: Página 1 de 2
          - button "Ir para página 1" [ref=f2e209] [cursor=pointer]: "1"
          - button "Ir para página 2" [ref=f2e210] [cursor=pointer]: "2"
          - button "Próxima página" [ref=f2e211] [cursor=pointer]
    - region [ref=f2e214]:
      - generic [ref=f2e215]:
        - heading "Diário da Cunhagem" [level=2] [ref=f2e216]
        - paragraph [ref=f2e217]: Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
      - generic [ref=f2e218]:
        - article [ref=f2e219]:
          - generic [ref=f2e220]:
            - paragraph [ref=f2e221]:
              - time [ref=f2e222]: 12 de setembro
              - text: "| Leitura de 6 min"
            - heading "Como funciona a propriedade de NFTs" [level=3] [ref=f2e223]
            - paragraph [ref=f2e224]: Aprenda a colecionar, negociar e verificar ativos digitais.
            - 'button "Ler mais: Como funciona a propriedade de NFTs" [ref=f2e225] [cursor=pointer]': Ler mais
        - article [ref=f2e228]:
          - generic [ref=f2e229]:
            - paragraph [ref=f2e230]:
              - time [ref=f2e231]: 13 de setembro
              - text: "| Leitura de 2 min"
            - heading "10 artistas digitais para acompanhar" [level=3] [ref=f2e232]
            - paragraph [ref=f2e233]: Conheça criadores que moldam a cultura digital.
            - 'button "Ler mais: 10 artistas digitais para acompanhar" [ref=f2e234] [cursor=pointer]': Ler mais
        - article [ref=f2e237]:
          - generic [ref=f2e238]:
            - paragraph [ref=f2e239]:
              - time [ref=f2e240]: 15 de setembro
              - text: "| Leitura de 3 min"
            - heading "Raridade, atributos e procedência" [level=3] [ref=f2e241]
            - paragraph [ref=f2e242]: Entenda raridade, procedência, direitos autorais e utilidade.
            - 'button "Ler mais: Raridade, atributos e procedência" [ref=f2e243] [cursor=pointer]': Ler mais
        - article [ref=f2e246]:
          - generic [ref=f2e247]:
            - paragraph [ref=f2e248]:
              - time [ref=f2e249]: 15 de setembro
              - text: "| Leitura de 2 min"
            - heading "Como proteger sua carteira" [level=3] [ref=f2e250]
            - paragraph [ref=f2e251]: Proteja sua carteira, seus ativos e sua identidade.
            - 'button "Ler mais: Como proteger sua carteira" [ref=f2e252] [cursor=pointer]': Ler mais
  - contentinfo "Rodapé" [ref=f2e255]:
    - generic [ref=f2e256]:
      - generic [ref=f2e257]:
        - heading "Segurança da carteira" [level=3] [ref=f2e262]
        - paragraph [ref=f2e263]: Proteja sua carteira e colecione arte digital com confiança.
      - generic [ref=f2e264]:
        - heading "Criadores em destaque" [level=3] [ref=f2e272]
        - paragraph [ref=f2e273]: Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
      - generic [ref=f2e274]:
        - heading "Alertas de lançamentos" [level=3] [ref=f2e279]
        - paragraph [ref=f2e280]: Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
      - generic [ref=f2e281]:
        - heading "Antecipe-se ao próximo lançamento" [level=3] [ref=f2e282]
        - form "Inscrição de novidades" [ref=f2e283]:
          - generic [ref=f2e284]: E-mail da newsletter
          - generic [ref=f2e285]:
            - textbox "E-mail da newsletter" [ref=f2e286]:
              - /placeholder: Digite seu e-mail
            - button "Enviar inscrição na newsletter" [ref=f2e287] [cursor=pointer]: Enviar
        - paragraph [ref=f2e288]: Novidades das coleções em uma inscrição demonstrativa.
    - generic [ref=f2e289]:
      - link "KURIO" [ref=f2e290] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f2e291]: Feito para colecionadores,criadores e cultura
      - generic [ref=f2e292]: Contato demonstrativo
      - generic [ref=f2e293]: Sem transações reais
    - generic [ref=f2e294]:
      - generic [ref=f2e295]:
        - heading "Meu perfil" [level=3] [ref=f2e296]
        - link "Meu perfil" [ref=f2e297] [cursor=pointer]:
          - /url: /profile
        - generic [ref=f2e298]: Minha coleção
        - generic [ref=f2e299]: Atividade
        - generic [ref=f2e300]: Estúdio do criador
        - button "Lista de interesse" [ref=f2e301] [cursor=pointer]
      - generic [ref=f2e302]:
        - heading "Central de ajuda" [level=3] [ref=f2e303]
        - generic [ref=f2e304]: Central de ajuda
        - generic [ref=f2e305]: Como comprar NFTs
        - generic [ref=f2e306]: Carteira e segurança
        - generic [ref=f2e307]: Política do mercado
        - generic [ref=f2e308]: Denunciar item
      - generic [ref=f2e309]:
        - heading "Coleções" [level=3] [ref=f2e310]
        - link "Arte digital" [ref=f2e311] [cursor=pointer]:
          - /url: /?category=Art
        - link "Fotografia" [ref=f2e312] [cursor=pointer]:
          - /url: /?category=Photography
        - link "Música" [ref=f2e313] [cursor=pointer]:
          - /url: /?category=Music
        - link "Arte 3D" [ref=f2e314] [cursor=pointer]:
          - /url: /?category=3D
        - link "Utilidade" [ref=f2e315] [cursor=pointer]:
          - /url: /?category=Utility
      - generic [ref=f2e316]:
        - heading "Redes sociais" [level=3] [ref=f2e317]
        - group "Redes sociais ilustrativas" [ref=f2e318]:
          - link "Abrir Facebook em nova aba" [ref=f2e319] [cursor=pointer]:
            - /url: https://www.facebook.com/
          - link "Abrir Instagram em nova aba" [ref=f2e320] [cursor=pointer]:
            - /url: https://www.instagram.com/
          - link "Abrir X em nova aba" [ref=f2e321] [cursor=pointer]:
            - /url: https://x.com/
          - link "Abrir LinkedIn em nova aba" [ref=f2e322] [cursor=pointer]:
            - /url: https://www.linkedin.com/
          - link "Abrir YouTube em nova aba" [ref=f2e323] [cursor=pointer]:
            - /url: https://www.youtube.com/
        - generic [ref=f2e324]: Links ilustrativos do protótipo.
        - heading "Carteiras compatíveis" [level=3] [ref=f2e325]
        - paragraph [ref=f2e326]: METAMASK · WALLETCONNECT · COINBASE
        - generic [ref=f2e327]: Interface demonstrativa. Sem conexão a carteiras reais.
    - paragraph [ref=f2e328]: © 2026 Kurio. Propriedade digital para todos.
    - button "Opções da demonstração" [ref=f2e329] [cursor=pointer]: Demonstração
  - navigation "Navegação móvel" [ref=f2e330]:
    - link "Início" [ref=f2e331] [cursor=pointer]:
      - /url: /
    - button "Lista de interesse" [ref=f2e332] [cursor=pointer]
    - button "Abrir navegação" [ref=f2e333] [cursor=pointer]
    - link "Carrinho, 0 itens" [ref=f2e335] [cursor=pointer]:
      - /url: /cart
    - link "Entrar" [ref=f2e336] [cursor=pointer]:
      - /url: /login
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const emailLabel = 'E-mail da newsletter';
  4   | const submitLabel = 'Enviar inscrição na newsletter';
  5   | const confirmation = 'Inscrição simulada confirmada. Nenhum e-mail real será enviado.';
  6   | async function scenario(page: Page, value: 'default' | 'slow' | 'server-error') {
  7   |   await page.evaluate(async (scenario) => {
  8   |     const response = await fetch('/api/demo/scenario', {
  9   |       method: 'POST',
  10  |       headers: { 'Content-Type': 'application/json' },
  11  |       body: JSON.stringify({ scenario }),
  12  |     });
  13  |     if (!response.ok) throw new Error('Cannot prepare the demonstration scenario.');
  14  |   }, value);
  15  | }
  16  | test.beforeEach(async ({ page }) => {
  17  |   await page.goto('/');
  18  |   await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  19  |   await expect(page.getByLabel(emailLabel, { exact: true })).toBeEnabled();
  20  | });
  21  | 
  22  | test('newsletter confirms a real simulated POST and deduplicates repeated subscriptions', async ({
  23  |   page,
  24  | }) => {
  25  |   const form = page.getByRole('form', { name: 'Inscrição de novidades', exact: true });
  26  |   const input = form.getByLabel(emailLabel, { exact: true });
  27  |   const button = form.getByRole('button', { name: submitLabel, exact: true });
  28  |   await scenario(page, 'slow');
  29  |   await input.fill('updates@example.test');
> 30  |   const firstResponse = page.waitForResponse((response) =>
      |                              ^ Error: page.waitForResponse: Test timeout of 30000ms exceeded.
  31  |     response.url().endsWith('/api/newsletter/subscriptions'),
  32  |   );
  33  |   await button.click();
  34  |   await expect(button).toHaveAttribute('aria-busy', 'true');
  35  |   await expect(form.getByRole('status')).toHaveCount(0);
  36  |   const first = await (await firstResponse).json();
  37  |   expect(first.simulated).toBe(true);
  38  |   expect(first.alreadySubscribed).toBe(false);
  39  |   await expect(form.getByRole('status')).toHaveText(confirmation);
  40  |   await expect(input).toHaveValue('');
  41  |   await scenario(page, 'default');
  42  |   await input.fill('UPDATES@example.test');
  43  |   const secondResponse = page.waitForResponse((response) =>
  44  |     response.url().endsWith('/api/newsletter/subscriptions'),
  45  |   );
  46  |   await button.click();
  47  |   const second = await (await secondResponse).json();
  48  |   expect(second.id).toBe(first.id);
  49  |   expect(second.createdAt).toBe(first.createdAt);
  50  |   expect(second.alreadySubscribed).toBe(true);
  51  |   await expect(form.getByRole('status')).toHaveText(confirmation);
  52  | });
  53  | 
  54  | test('newsletter rejects invalid input and preserves the draft after a server failure', async ({
  55  |   page,
  56  | }) => {
  57  |   const form = page.getByRole('form', { name: 'Inscrição de novidades', exact: true });
  58  |   const input = form.getByLabel(emailLabel, { exact: true });
  59  |   const button = form.getByRole('button', { name: submitLabel, exact: true });
  60  |   await input.fill('invalid');
  61  |   await button.click();
  62  |   await expect(form.getByRole('alert')).toContainText('Digite um e-mail válido');
  63  |   await expect(input).toHaveAttribute('aria-invalid', 'true');
  64  |   await scenario(page, 'server-error');
  65  |   await input.fill('retry@example.test');
  66  |   const failed = page.waitForResponse((response) =>
  67  |     response.url().endsWith('/api/newsletter/subscriptions'),
  68  |   );
  69  |   await button.click();
  70  |   expect((await failed).status()).toBe(503);
  71  |   await expect(form.getByRole('alert')).toContainText('Não foi possível confirmar');
  72  |   await expect(form.getByRole('status')).toHaveCount(0);
  73  |   await expect(input).toHaveValue('retry@example.test');
  74  |   await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  75  |   await scenario(page, 'default');
  76  |   await button.click();
  77  |   await expect(form.getByRole('status')).toHaveText(confirmation);
  78  | });
  79  | 
  80  | test('footer social icons are explicit platform links and open an independent tab', async ({
  81  |   page,
  82  |   context,
  83  | }) => {
  84  |   const group = page.getByRole('group', { name: 'Redes sociais ilustrativas', exact: true });
  85  |   for (const [name, href] of [
  86  |     ['Facebook', 'https://www.facebook.com/'],
  87  |     ['Instagram', 'https://www.instagram.com/'],
  88  |     ['X', 'https://x.com/'],
  89  |     ['LinkedIn', 'https://www.linkedin.com/'],
  90  |     ['YouTube', 'https://www.youtube.com/'],
  91  |   ]) {
  92  |     const link = group.getByRole('link', { name: `Abrir ${name} em nova aba`, exact: true });
  93  |     await expect(link).toHaveAttribute('href', href);
  94  |     await expect(link).toHaveAttribute('target', '_blank');
  95  |     await expect(link).toHaveAttribute('rel', /noopener/);
  96  |   }
  97  |   await expect(page.getByText('Links ilustrativos do protótipo.', { exact: true })).toBeVisible();
  98  |   await context.route('https://www.facebook.com/**', (route) =>
  99  |     route.fulfill({ contentType: 'text/html', body: '<title>Platform link test</title>' }),
  100 |   );
  101 |   const opened = context.waitForEvent('page');
  102 |   await group.getByRole('link', { name: 'Abrir Facebook em nova aba', exact: true }).click();
  103 |   const popup = await opened;
  104 |   await popup.waitForLoadState('domcontentloaded');
  105 |   expect(popup.url()).toBe('https://www.facebook.com/');
  106 |   expect(await popup.evaluate(() => window.opener)).toBeNull();
  107 |   await popup.close();
  108 | });
  109 | 
  110 | test('newsletter drafts are cleared when guest navigation signs into another identity', async ({
  111 |   page,
  112 | }) => {
  113 |   const input = page.getByLabel(emailLabel, { exact: true });
  114 |   await input.fill('guest-draft@example.test');
  115 |   await page
  116 |     .getByRole('contentinfo')
  117 |     .getByRole('link', { name: 'Meu perfil', exact: true })
  118 |     .click();
  119 |   await expect(input).toHaveValue('guest-draft@example.test');
  120 |   await page.getByRole('link', { name: 'Entrar para continuar', exact: true }).click();
  121 |   const dialog = page.getByRole('dialog');
  122 |   await dialog.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
  123 |   await dialog.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  124 |   await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  125 |   await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue('Alex Collector');
  126 |   await expect(input).toHaveValue('');
  127 |   await expect(
  128 |     page.getByRole('form', { name: 'Inscrição de novidades' }).getByRole('status'),
  129 |   ).toHaveCount(0);
  130 | });
```