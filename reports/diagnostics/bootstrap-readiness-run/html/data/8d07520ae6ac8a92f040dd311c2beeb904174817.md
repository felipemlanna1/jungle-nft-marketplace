# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: favorites-navigation.spec.ts >> guest favorites navigate to a single usable login dialog without reopening the menu
- Location: tests/e2e/favorites-navigation.spec.ts:43:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator: getByRole('button', { name: 'Abrir navegação', exact: true }).first()
Expected: focused
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeFocused" getByRole('button', { name: 'Abrir navegação', exact: true }).first() with timeout 8000ms
  - waiting for getByRole('button', { name: 'Abrir navegação', exact: true }).first()

```

```yaml
- link "Pular para o conteúdo":
  - /url: "#main-content"
- banner:
  - link "Página inicial da Kurio":
    - /url: /
    - text: kurio
  - navigation "Navegação principal":
    - link "Início":
      - /url: /
    - link "Mercado":
      - /url: /#marketplace
    - text: Criadores Aprenda
  - button "Buscar obras ou criadores"
  - link "Carrinho, 0 itens":
    - /url: /cart
  - link "Entrar":
    - /url: /login
- main:
  - status "Socket conectado"
  - region "SEJA DONO DO FUTURO DA ARTE DIGITAL":
    - region "Destaques do marketplace":
      - group "1 de 3":
        - paragraph: Bem-vindo à Kurio
        - heading "SEJA DONO DO FUTURO DA ARTE DIGITAL" [level=1]
        - paragraph: Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
        - link "EXPLORAR":
          - /url: "#marketplace"
        - img "Emerald Ape, personagem de arte digital em verde esmeralda"
      - group "Selecionar destaque":
        - button "Ir para destaque 1"
        - button "Ir para destaque 2"
        - button "Ir para destaque 3"
  - region "Marketplace":
    - heading "Marketplace" [level=2]
    - complementary:
      - heading "Coleções" [level=3]
      - navigation "Filtrar coleção":
        - button "Arte digital (5)"
        - button "Fotografia (2)"
        - button "Música (1)"
        - button "Arte 3D (2)"
        - button "Colecionáveis (2)"
        - button "Generativa (2)"
        - button "Jogos (1)"
        - button "Assinaturas (1)"
        - button "Utilidade (2)"
      - heading "Faixa de preço" [level=3]
      - slider "Preço mínimo em ETH": "0.02"
      - slider "Preço máximo em ETH": "12.3"
      - text: "Preço: Preço mínimo"
      - textbox "Preço mínimo": "0.02"
      - text: "- Preço máximo"
      - textbox "Preço máximo": "12.30"
      - text: ETH
      - button "Aplicar"
      - heading "Rede" [level=3]
      - navigation "Filtrar rede":
        - button "Ethereum (12)"
        - button "Polygon (6)"
        - button "Solana (0)"
      - link "NFT EM DESTAQUE OFERTA LIMITADA Sage Nomad, personagem com chapéu e moletom roxo":
        - /url: /nft/nft-2
        - strong: NFT EM DESTAQUE
        - text: OFERTA LIMITADA
        - img "Sage Nomad, personagem com chapéu e moletom roxo"
    - navigation "Seleção do catálogo":
      - button "Todos os NFTs" [pressed]
      - button "Novos lançamentos"
      - button "Em alta"
    - text: "Ordenar por:"
    - combobox "Ordenar por:": Listados recentemente
    - article:
      - 'link "Ver Emerald Ape #042"':
        - /url: /nft/nft-1
        - 'img "Emerald Ape #042"'
      - 'group "Ações de Emerald Ape #042"':
        - 'button "Adicionar Emerald Ape #042 ao carrinho"'
        - 'button "Adicionar Emerald Ape #042 aos favoritos"'
        - 'button "Ampliar Emerald Ape #042"'
      - 'link "Emerald Ape #042"':
        - /url: /nft/nft-1
        - 'heading "Emerald Ape #042" [level=3]'
      - strong: 1.19 ETH
    - article:
      - 'link "Ver Sage Nomad #009"':
        - /url: /nft/nft-2
        - 'img "Sage Nomad #009"'
      - 'group "Ações de Sage Nomad #009"':
        - 'button "Adicionar Sage Nomad #009 ao carrinho"'
        - 'button "Adicionar Sage Nomad #009 aos favoritos"'
        - 'button "Ampliar Sage Nomad #009"'
      - 'link "Sage Nomad #009"':
        - /url: /nft/nft-2
        - 'heading "Sage Nomad #009" [level=3]'
      - strong: 1.69 ETH
    - article:
      - 'link "Ver Neon Vessel #552"':
        - /url: /nft/nft-3
        - 'img "Neon Vessel #552"'
      - 'group "Ações de Neon Vessel #552"':
        - 'button "Adicionar Neon Vessel #552 ao carrinho"'
        - 'button "Adicionar Neon Vessel #552 aos favoritos"'
        - 'button "Ampliar Neon Vessel #552"'
      - text: RARO
      - 'link "Neon Vessel #552"':
        - /url: /nft/nft-3
        - 'heading "Neon Vessel #552" [level=3]'
      - strong: 1.99 ETH
      - text: 2.29 ETH
    - article:
      - 'link "Ver Cosmic Bloom #118"':
        - /url: /nft/nft-4
        - 'img "Cosmic Bloom #118"'
      - 'group "Ações de Cosmic Bloom #118"':
        - 'button "Adicionar Cosmic Bloom #118 ao carrinho"'
        - 'button "Adicionar Cosmic Bloom #118 aos favoritos"'
        - 'button "Ampliar Cosmic Bloom #118"'
      - 'link "Cosmic Bloom #118"':
        - /url: /nft/nft-4
        - 'heading "Cosmic Bloom #118" [level=3]'
      - strong: 1.29 ETH
    - article:
      - 'link "Ver Violet Nomad #314"':
        - /url: /nft/nft-5
        - 'img "Violet Nomad #314"'
      - 'group "Ações de Violet Nomad #314"':
        - 'button "Adicionar Violet Nomad #314 ao carrinho"'
        - 'button "Adicionar Violet Nomad #314 aos favoritos"'
        - 'button "Ampliar Violet Nomad #314"'
      - 'link "Violet Nomad #314"':
        - /url: /nft/nft-5
        - 'heading "Violet Nomad #314" [level=3]'
      - strong: 1.39 ETH
    - article:
      - 'link "Ver Ivory Baron #088"':
        - /url: /nft/nft-6
        - 'img "Ivory Baron #088"'
      - 'group "Ações de Ivory Baron #088"':
        - 'button "Adicionar Ivory Baron #088 ao carrinho"'
        - 'button "Adicionar Ivory Baron #088 aos favoritos"'
        - 'button "Ampliar Ivory Baron #088"'
      - 'link "Ivory Baron #088"':
        - /url: /nft/nft-6
        - 'heading "Ivory Baron #088" [level=3]'
      - strong: 1.79 ETH
    - article:
      - 'link "Ver Golden Beat #207"':
        - /url: /nft/nft-7
        - 'img "Golden Beat #207"'
      - 'group "Ações de Golden Beat #207"':
        - 'button "Adicionar Golden Beat #207 ao carrinho"'
        - 'button "Adicionar Golden Beat #207 aos favoritos"'
        - 'button "Ampliar Golden Beat #207"'
      - 'link "Golden Beat #207"':
        - /url: /nft/nft-7
        - 'heading "Golden Beat #207" [level=3]'
      - strong: 0.99 ETH
    - article:
      - 'link "Ver Golden Pulse #099"':
        - /url: /nft/nft-8
        - 'img "Golden Pulse #099"'
      - 'group "Ações de Golden Pulse #099"':
        - 'button "Adicionar Golden Pulse #099 ao carrinho"'
        - 'button "Adicionar Golden Pulse #099 aos favoritos"'
        - 'button "Ampliar Golden Pulse #099"'
      - 'link "Golden Pulse #099"':
        - /url: /nft/nft-8
        - 'heading "Golden Pulse #099" [level=3]'
      - strong: 0.79 ETH
    - article:
      - 'link "Ver Golden Signal #160"':
        - /url: /nft/nft-9
        - 'img "Golden Signal #160"'
      - 'group "Ações de Golden Signal #160"':
        - 'button "Adicionar Golden Signal #160 ao carrinho"'
        - 'button "Adicionar Golden Signal #160 aos favoritos"'
        - 'button "Ampliar Golden Signal #160"'
      - 'link "Golden Signal #160"':
        - /url: /nft/nft-9
        - 'heading "Golden Signal #160" [level=3]'
      - strong: 0.39 ETH
    - navigation "Paginação do catálogo":
      - button "Página anterior" [disabled]:
        - img
      - text: Página 1 de 2
      - button "Ir para página 1": "1"
      - button "Ir para página 2": "2"
      - button "Próxima página":
        - img
  - region "Coleções em destaque":
    - article:
      - img "Emerald Ape"
      - heading "Lançamentos gênesis de edição limitada" [level=2]
      - paragraph: Colecione edições escassas diretamente dos criadores antes da revelação pública.
      - link "Explorar":
        - /url: /nft/nft-1
    - article:
      - img "Neon Vessel"
      - heading "Arte digital selecionada e muito mais" [level=2]
      - paragraph: Explore novos artistas, coleções e obras digitais que definem a cultura.
      - link "Explorar":
        - /url: /nft/nft-3
  - region "Diário da Cunhagem":
    - heading "Diário da Cunhagem" [level=2]
    - paragraph: Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
    - article:
      - paragraph:
        - time: 12 de setembro
        - text: "| Leitura de 6 min"
      - heading "Como funciona a propriedade de NFTs" [level=3]
      - paragraph: Aprenda a colecionar, negociar e verificar ativos digitais.
      - 'button "Ler mais: Como funciona a propriedade de NFTs"': Ler mais
    - article:
      - paragraph:
        - time: 13 de setembro
        - text: "| Leitura de 2 min"
      - heading "10 artistas digitais para acompanhar" [level=3]
      - paragraph: Conheça criadores que moldam a cultura digital.
      - 'button "Ler mais: 10 artistas digitais para acompanhar"': Ler mais
    - article:
      - paragraph:
        - time: 15 de setembro
        - text: "| Leitura de 3 min"
      - heading "Raridade, atributos e procedência" [level=3]
      - paragraph: Entenda raridade, procedência, direitos autorais e utilidade.
      - 'button "Ler mais: Raridade, atributos e procedência"': Ler mais
    - article:
      - paragraph:
        - time: 15 de setembro
        - text: "| Leitura de 2 min"
      - heading "Como proteger sua carteira" [level=3]
      - paragraph: Proteja sua carteira, seus ativos e sua identidade.
      - 'button "Ler mais: Como proteger sua carteira"': Ler mais
- contentinfo "Rodapé":
  - heading "Segurança da carteira" [level=3]
  - paragraph: Proteja sua carteira e colecione arte digital com confiança.
  - heading "Criadores em destaque" [level=3]
  - paragraph: Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
  - heading "Alertas de lançamentos" [level=3]
  - paragraph: Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
  - heading "Antecipe-se ao próximo lançamento" [level=3]
  - form "Inscrição de novidades":
    - text: E-mail da newsletter
    - textbox "E-mail da newsletter":
      - /placeholder: Digite seu e-mail
    - button "Inscrever na newsletter": Enviar
  - paragraph: Novidades das coleções em uma inscrição demonstrativa.
  - link "KURIO":
    - /url: /
  - paragraph: Feito para colecionadores, criadores e cultura
  - text: Contato demonstrativo Sem transações reais
  - heading "Meu perfil" [level=3]
  - link "Meu perfil":
    - /url: /profile
  - text: Minha coleção Atividade Estúdio do criador
  - button "Lista de interesse"
  - heading "Central de ajuda" [level=3]
  - text: Central de ajuda Como comprar NFTs Carteira e segurança Política do mercado Denunciar item
  - heading "Coleções" [level=3]
  - link "Arte digital":
    - /url: /?category=Art
  - link "Fotografia":
    - /url: /?category=Photography
  - link "Música":
    - /url: /?category=Music
  - link "Arte 3D":
    - /url: /?category=3D
  - link "Utilidade":
    - /url: /?category=Utility
  - heading "Redes sociais" [level=3]
  - group "Redes sociais ilustrativas":
    - link "Abrir Facebook em nova aba":
      - /url: https://www.facebook.com/
    - link "Abrir Instagram em nova aba":
      - /url: https://www.instagram.com/
    - link "Abrir X em nova aba":
      - /url: https://x.com/
    - link "Abrir LinkedIn em nova aba":
      - /url: https://www.linkedin.com/
    - link "Abrir YouTube em nova aba":
      - /url: https://www.youtube.com/
  - text: Links ilustrativos do protótipo.
  - heading "Carteiras compatíveis" [level=3]
  - paragraph: METAMASK · WALLETCONNECT · COINBASE
  - text: Interface demonstrativa. Sem conexão a carteiras reais.
  - paragraph: © 2026 Kurio. Propriedade digital para todos.
  - button "Opções da demonstração": Demonstração
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { openOptions } from './helpers/interface';
  3  | 
  4  | test('account menu hands favorites to the detail route and restores the outer trigger on close', async ({
  5  |   page,
  6  |   isMobile,
  7  | }) => {
  8  |   await page.goto('/login?redirect=%2F');
  9  |   await page.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  10 |   await page.getByLabel('Senha', { exact: true }).press('Enter');
  11 |   const favorite = page.getByRole('button', {
  12 |     name: 'Adicionar Sage Nomad #009 aos favoritos',
  13 |     exact: true,
  14 |   });
  15 |   await favorite.click();
  16 |   await expect(
  17 |     page.getByRole('button', { name: 'Remover Sage Nomad #009 dos favoritos', exact: true }),
  18 |   ).toHaveAttribute('aria-pressed', 'true');
  19 |   const trigger = isMobile
  20 |     ? page
  21 |         .locator('.mobile-bottom-nav')
  22 |         .getByRole('button', { name: 'Abrir navegação', exact: true })
  23 |     : page.locator('.header-actions').getByRole('button', { name: /Alex Collector/ });
  24 |   await trigger.click();
  25 |   const menu = page.getByRole('dialog', { name: 'Sua conta', exact: true });
  26 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  27 |   const list = page.getByRole('dialog', { name: 'Lista de interesse', exact: true });
  28 |   await expect(list).toBeVisible();
  29 |   await expect(menu).toHaveCount(0);
  30 |   await list.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
  31 |   await expect(list).toHaveCount(0);
  32 |   await expect(trigger).toBeFocused();
  33 |   await trigger.click();
  34 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  35 |   await list.getByRole('link', { name: /Sage Nomad #009/ }).click();
  36 |   await expect(page).toHaveURL(/\/nft\/nft-2$/);
  37 |   await expect(page.getByRole('heading', { name: 'Sage Nomad #009', exact: true })).toBeVisible();
  38 |   await expect(menu).toHaveCount(0);
  39 |   await expect(list).toHaveCount(0);
  40 |   await expect(page.getByRole('button', { name: 'Comprar NFT', exact: true })).toBeEnabled();
  41 | });
  42 | 
  43 | test('guest favorites navigate to a single usable login dialog without reopening the menu', async ({
  44 |   page,
  45 | }) => {
  46 |   await page.goto('/');
  47 |   await expect(page.locator('.nft-card').first()).toBeVisible();
  48 |   const footer = page.getByRole('button', { name: 'Opções da demonstração', exact: true });
  49 |   const trigger = (await footer.isVisible())
  50 |     ? footer
  51 |     : page.getByRole('button', { name: 'Abrir navegação', exact: true }).first();
  52 |   await openOptions(page);
  53 |   const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
  54 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  55 |   const list = page.getByRole('dialog', { name: 'Lista de interesse', exact: true });
  56 |   await expect(list).toBeVisible();
  57 |   await expect(menu).toHaveCount(0);
  58 |   await list.getByRole('button', { name: 'Fechar diálogo', exact: true }).click();
> 59 |   await expect(trigger).toBeFocused();
     |                         ^ Error: expect(locator).toBeFocused() failed
  60 |   await openOptions(page);
  61 |   await menu.getByRole('button', { name: 'Lista de interesse', exact: true }).click();
  62 |   await list.getByRole('link', { name: 'Entrar', exact: true }).click();
  63 |   await expect(page).toHaveURL(/\/login\?/);
  64 |   const login = page.getByRole('dialog', { name: 'Entrar', exact: true });
  65 |   await expect(login).toBeVisible();
  66 |   await expect(page.getByRole('dialog')).toHaveCount(1);
  67 |   await expect(menu).toHaveCount(0);
  68 |   await expect(list).toHaveCount(0);
  69 |   await expect
  70 |     .poll(() => login.evaluate((node) => node.contains(document.activeElement)))
  71 |     .toBe(true);
  72 |   await login.getByRole('button', { name: 'Usar conta de demonstração', exact: true }).click();
  73 |   await login.getByLabel('Senha', { exact: true }).press('Enter');
  74 |   await expect(page.locator('#hero-title')).toBeVisible();
  75 |   await expect(menu).toHaveCount(0);
  76 |   await expect(list).toHaveCount(0);
  77 | });
  78 | 
```