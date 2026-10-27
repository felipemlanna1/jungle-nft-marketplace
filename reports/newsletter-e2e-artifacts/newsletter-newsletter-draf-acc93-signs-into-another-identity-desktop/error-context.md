# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: newsletter.spec.ts >> newsletter drafts are cleared when guest navigation signs into another identity
- Location: tests/e2e/newsletter.spec.ts:108:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByLabel('E-mail', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Pular para o conteúdo" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Página inicial da Kurio" [ref=e6] [cursor=pointer]:
        - /url: /
        - text: kurio
      - navigation "Navegação principal" [ref=e7]:
        - link "Início" [ref=e8] [cursor=pointer]:
          - /url: /
        - link "Mercado" [ref=e9] [cursor=pointer]:
          - /url: /#marketplace
        - generic "Conteúdo editorial fora desta demonstração" [ref=e10]: Criadores
        - generic "Conteúdo editorial fora desta demonstração" [ref=e11]: Aprenda
      - generic [ref=e12]:
        - button "Buscar obras ou criadores" [ref=e13] [cursor=pointer]
        - link "Carrinho, 0 itens" [ref=e14] [cursor=pointer]:
          - /url: /cart
        - link "Entrar" [ref=e15] [cursor=pointer]:
          - /url: /login
  - main [ref=e16]:
    - status "Socket conectado" [ref=e17]
    - generic [ref=e18]:
      - heading "Continue com sua conta de colecionador" [level=1] [ref=e19]
      - paragraph [ref=e20]: Entre para acessar suas carteiras e acompanhar seus pedidos.
      - link "Entrar para continuar" [ref=e21] [cursor=pointer]:
        - /url: /login?redirect=%2Fprofile
  - contentinfo "Rodapé" [ref=e22]:
    - generic [ref=e23]:
      - generic [ref=e24]:
        - heading "Segurança da carteira" [level=3] [ref=e29]
        - paragraph [ref=e30]: Proteja sua carteira e colecione arte digital com confiança.
      - generic [ref=e31]:
        - heading "Criadores em destaque" [level=3] [ref=e39]
        - paragraph [ref=e40]: Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
      - generic [ref=e41]:
        - heading "Alertas de lançamentos" [level=3] [ref=e46]
        - paragraph [ref=e47]: Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
      - generic [ref=e48]:
        - heading "Antecipe-se ao próximo lançamento" [level=3] [ref=e49]
        - form "Inscrição de novidades" [ref=e50]:
          - generic [ref=e51]: E-mail da newsletter
          - generic [ref=e52]:
            - textbox "E-mail da newsletter" [ref=e53]:
              - /placeholder: Digite seu e-mail
              - text: guest-draft@example.test
            - button "Inscrever na newsletter" [ref=e54] [cursor=pointer]: Enviar
        - paragraph [ref=e55]: Novidades das coleções em uma inscrição demonstrativa.
    - generic [ref=e56]:
      - link "KURIO" [ref=e57] [cursor=pointer]:
        - /url: /
      - paragraph [ref=e58]: Feito para colecionadores,criadores e cultura
      - generic [ref=e59]: Contato demonstrativo
      - generic [ref=e60]: Sem transações reais
    - generic [ref=e61]:
      - generic [ref=e62]:
        - heading "Meu perfil" [level=3] [ref=e63]
        - link "Meu perfil" [active] [ref=e64] [cursor=pointer]:
          - /url: /profile
        - generic [ref=e65]: Minha coleção
        - generic [ref=e66]: Atividade
        - generic [ref=e67]: Estúdio do criador
        - button "Lista de interesse" [ref=e68] [cursor=pointer]
      - generic [ref=e69]:
        - heading "Central de ajuda" [level=3] [ref=e70]
        - generic [ref=e71]: Central de ajuda
        - generic [ref=e72]: Como comprar NFTs
        - generic [ref=e73]: Carteira e segurança
        - generic [ref=e74]: Política do mercado
        - generic [ref=e75]: Denunciar item
      - generic [ref=e76]:
        - heading "Coleções" [level=3] [ref=e77]
        - link "Arte digital" [ref=e78] [cursor=pointer]:
          - /url: /?category=Art
        - link "Fotografia" [ref=e79] [cursor=pointer]:
          - /url: /?category=Photography
        - link "Música" [ref=e80] [cursor=pointer]:
          - /url: /?category=Music
        - link "Arte 3D" [ref=e81] [cursor=pointer]:
          - /url: /?category=3D
        - link "Utilidade" [ref=e82] [cursor=pointer]:
          - /url: /?category=Utility
      - generic [ref=e83]:
        - heading "Redes sociais" [level=3] [ref=e84]
        - group "Redes sociais ilustrativas" [ref=e85]:
          - link "Abrir Facebook em nova aba" [ref=e86] [cursor=pointer]:
            - /url: https://www.facebook.com/
          - link "Abrir Instagram em nova aba" [ref=e87] [cursor=pointer]:
            - /url: https://www.instagram.com/
          - link "Abrir X em nova aba" [ref=e88] [cursor=pointer]:
            - /url: https://x.com/
          - link "Abrir LinkedIn em nova aba" [ref=e89] [cursor=pointer]:
            - /url: https://www.linkedin.com/
          - link "Abrir YouTube em nova aba" [ref=e90] [cursor=pointer]:
            - /url: https://www.youtube.com/
        - generic [ref=e91]: Links ilustrativos do protótipo.
        - heading "Carteiras compatíveis" [level=3] [ref=e92]
        - paragraph [ref=e93]: METAMASK · WALLETCONNECT · COINBASE
        - generic [ref=e94]: Interface demonstrativa. Sem conexão a carteiras reais.
    - paragraph [ref=e95]: © 2026 Kurio. Propriedade digital para todos.
    - button "Opções da demonstração" [ref=e96] [cursor=pointer]: Demonstração
```

# Test source

```ts
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
  30  |   const firstResponse = page.waitForResponse((response) =>
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
  63  |   await scenario(page, 'server-error');
  64  |   await input.fill('retry@example.test');
  65  |   const failed = page.waitForResponse((response) =>
  66  |     response.url().endsWith('/api/newsletter/subscriptions'),
  67  |   );
  68  |   await button.click();
  69  |   expect((await failed).status()).toBe(503);
  70  |   await expect(form.getByRole('alert')).toContainText('Não foi possível confirmar');
  71  |   await expect(form.getByRole('status')).toHaveCount(0);
  72  |   await expect(input).toHaveValue('retry@example.test');
  73  |   await scenario(page, 'default');
  74  |   await button.click();
  75  |   await expect(form.getByRole('status')).toHaveText(confirmation);
  76  | });
  77  | 
  78  | test('footer social icons are explicit platform links and open an independent tab', async ({
  79  |   page,
  80  |   context,
  81  | }) => {
  82  |   const group = page.getByRole('group', { name: 'Redes sociais ilustrativas', exact: true });
  83  |   for (const [name, href] of [
  84  |     ['Facebook', 'https://www.facebook.com/'],
  85  |     ['Instagram', 'https://www.instagram.com/'],
  86  |     ['X', 'https://x.com/'],
  87  |     ['LinkedIn', 'https://www.linkedin.com/'],
  88  |     ['YouTube', 'https://www.youtube.com/'],
  89  |   ]) {
  90  |     const link = group.getByRole('link', { name: `Abrir ${name} em nova aba`, exact: true });
  91  |     await expect(link).toHaveAttribute('href', href);
  92  |     await expect(link).toHaveAttribute('target', '_blank');
  93  |     await expect(link).toHaveAttribute('rel', /noopener/);
  94  |   }
  95  |   await expect(page.getByText('Links ilustrativos do protótipo.', { exact: true })).toBeVisible();
  96  |   await context.route('https://www.facebook.com/**', (route) =>
  97  |     route.fulfill({ contentType: 'text/html', body: '<title>Platform link test</title>' }),
  98  |   );
  99  |   const opened = context.waitForEvent('page');
  100 |   await group.getByRole('link', { name: 'Abrir Facebook em nova aba', exact: true }).click();
  101 |   const popup = await opened;
  102 |   await popup.waitForLoadState('domcontentloaded');
  103 |   expect(popup.url()).toBe('https://www.facebook.com/');
  104 |   expect(await popup.evaluate(() => window.opener)).toBeNull();
  105 |   await popup.close();
  106 | });
  107 | 
  108 | test('newsletter drafts are cleared when guest navigation signs into another identity', async ({
  109 |   page,
  110 | }) => {
  111 |   const input = page.getByLabel(emailLabel, { exact: true });
  112 |   await input.fill('guest-draft@example.test');
  113 |   await page
  114 |     .getByRole('contentinfo')
  115 |     .getByRole('link', { name: 'Meu perfil', exact: true })
  116 |     .click();
  117 |   const dialog = page.getByRole('dialog');
> 118 |   await dialog.getByLabel('E-mail', { exact: true }).fill('collector@example.test');
      |                                                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  119 |   await dialog.getByLabel('Senha', { exact: true }).fill('Collect0r!Demo');
  120 |   await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  121 |   await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue('Alex Collector');
  122 |   await expect(input).toHaveValue('');
  123 |   await expect(
  124 |     page.getByRole('form', { name: 'Inscrição de novidades' }).getByRole('status'),
  125 |   ).toHaveCount(0);
  126 | });
  127 | 
```