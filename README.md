# KURIO | NFT Marketplace

[Abrir marketplace](https://kurio-jungle-marketplace-felipe.lanna-it.chatgpt.site) · [Código](https://github.com/felipemlanna1/jungle-nft-marketplace)

Aplicação React e TypeScript para o desafio de Frontend da Jungle Gaming. Catálogo, conta, carrinho, cotação, compra e recibo usam uma API simulada na rede. Nenhuma compra, carteira ou transação de blockchain é real.

O projeto foi escrito do zero para esta entrega. Não inclui código, histórico Git, bancos, credenciais ou dados de projetos anteriores.

## Executar a partir de um checkout limpo

Requisitos: Node.js 22 ou superior, npm e navegador com Service Worker. Use localhost em desenvolvimento e HTTPS no ambiente publicado.

```bash
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173`. Os mocks são iniciados antes da aplicação. Não é necessário cadastrar chave de API, banco ou serviço externo.

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

A prévia do build fica em `http://127.0.0.1:4173`. O build e o desenvolvimento geram automaticamente o CSS do tema. Para gerar o tema isoladamente, use `npm run theme:generate`.

### Contas inteiramente fictícias

| E-mail                   | Senha            |
| ------------------------ | ---------------- |
| `collector@example.test` | `Collect0r!Demo` |
| `second@example.test`    | `Collect0r!Demo` |

As duas contas começam com uma carteira simulada Ethereum. Use a segunda para conferir o isolamento de favoritos, perfil, carteiras e pedidos. Também é possível cadastrar uma conta fictícia nova. Não use dados ou senhas reais nesta demonstração.

O navegador mantém o cenário em armazenamento local para permitir refresh e recuperação. As senhas são representadas por hashes, não por texto puro. Essa autenticação é uma simulação local e não constitui um serviço de autenticação de produção.

## Fluxos principais

1. Explore o catálogo, combine busca e coleção e escolha a ordenação. Os parâmetros ficam na URL e sobrevivem a refresh e histórico.
2. Abra uma obra e escolha a quantidade disponível. Adicione ao carrinho como visitante ou como usuário autenticado.
3. No carrinho, altere quantidades, remova itens e aplique um cupom. `JUNGLE10` concede desconto simulado de 10%; `EXPIRED` exercita a mensagem de cupom expirado.
4. Entre na conta. Os itens do visitante são combinados com os itens da conta, respeitando o estoque.
5. No pagamento, confira os dados fictícios, selecione a carteira e sua rede e simule a conexão. É possível recusar ou desconectar a carteira.
6. Revise a cotação e confirme. Mudanças de preço exigem nova revisão. Um pedido pendente só exibe recibo após confirmação da simulação.
7. Atualize a página durante o pedido. A tentativa persistida e sua chave de idempotência permitem recuperar o mesmo pedido.

Perfil, senha e carteiras têm formulários próprios. Os pedidos pertencem ao usuário autenticado. Logout e troca de conta cancelam consultas e removem o cache privado.

## Cenários reproduzíveis

Abra o botão **Cenários da demonstração**, disponível na interface. Ele configura os mocks da rede; os componentes não recebem dados de demonstração por caminhos alternativos.

| Cenário                   | O que observar                                                       |
| ------------------------- | -------------------------------------------------------------------- |
| Rede normal               | Fluxos completos com latência curta                                  |
| Rede lenta                | Skeletons, dimensões reservadas e carregamento com latência variável |
| Catálogo vazio            | Busca sem resultados e recuperação pela interface                    |
| Sem conexão               | Falha de rede e tentativa novamente                                  |
| Erro da API (503)         | Erro transitório e feedback de recuperação                           |
| Sessão expirada           | Retorno à autenticação preservando o contexto do fluxo               |
| Pagamento recusado        | Pedido recusado e carrinho preservado                                |
| Timeout após criar pedido | Resultado incerto, refresh e recuperação da mesma tentativa          |

**Alterar preço de uma obra** altera a primeira obra e emite `nft.updated` pelo protocolo Socket.IO. Coloque essa obra no carrinho antes de acionar o controle para observar o preço e a cotação atualizados. O evento não chama setters dos componentes.

**Redefinir todos os dados** restaura as contas, obras, estoque, carrinhos, pedidos e cenário. Use o reset antes de comparar execuções manuais.

## Testes

```bash
npx playwright install chromium
npm run test:e2e
```

O Playwright inicia o servidor local quando necessário. Os projetos desktop e mobile usam Chromium. Há testes de interface, proteção de rotas, contrato de compra e tempo real. `tests/e2e/realtime.spec.ts` exige uma conexão efetiva de `socket.io-client`, altera o preço pela rede e verifica o carrinho visível. O viewport de 768 px também é verificado.

As comparações visuais usam baselines versionadas. Atualize-as somente após revisar a mudança:

```bash
npm run test:e2e:update
```

O relatório HTML fica em `playwright-report/`; traces e capturas de falha ficam em `test-results/`. Esses diretórios são gerados e não contêm evidência de uma execução bem-sucedida por si só. Os resultados finais devem ser lidos junto aos relatórios da entrega, sem inferir cobertura apenas pela presença da configuração.

## Lighthouse

Com o build otimizado em execução:

```bash
npm run build
npm run preview
```

Em outro terminal:

```bash
npm run audit:lighthouse
```

O script audita início e detalhe em mobile e desktop, executa três medições por combinação e grava HTML, JSON e as medianas em `reports/lighthouse/summary.json`. O resumo inclui LCP, CLS, TBT, versão do Node, navegador e URL auditada. `AUDIT_URL` permite escolher outra instância compatível.

As metas do desafio são Performance 90, Accessibility 95, Best Practices 95 e SEO 90. Não se presume cumprimento das metas: consulte os valores medidos e as limitações registradas nos relatórios.

## Organização e decisões

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para contratos, cache, sessão, estados do pedido, recuperação e limites da simulação.

A estrutura usa módulos com páginas de composição, hooks próximos da página, componentes em pastas próprias, tipos centrais e uma camada de serviços separada. O styleguide centraliza tokens, receitas e primitivas acessíveis. Não há cópia de uma base profissional anterior.

## Aparências Jungle e Kurio

O seletor no cabeçalho alterna entre **Jungle**, aparência inicial de exploração na selva, e **Kurio**, composição original orientada pelo Figma. A escolha vale para catálogo, detalhe, conta e compra, sem alterar os dados ou a URL e sem remontar os formulários. A preferência fica somente no navegador.

A aparência Jungle usa como referência visual as prévias oficiais de Chimp Mines, Captain's Treasure e Goblin's Gold em [junglegaming.io/pt](https://junglegaming.io/pt#games): ambiente escuro, pedra, bronze, ouro e esmeralda. Não há ranking público de popularidade. A arte do destaque é original, produzida para esta demonstração; nenhum personagem, logo ou asset dos jogos foi extraído.

Os tokens das duas aparências usam os mesmos nomes semânticos. O provider e seu hook controlam a preferência; o seletor contém apresentação; catálogo e serviços continuam independentes da persistência visual. `src/styleguide/theme/expedition/styles/` separa shell, catálogo, primitivas e fluxos. O gerador compila essas fontes e seus breakpoints em `src/styles.expedition.css`; o arquivo gerado não deve ser editado diretamente.

## Figma e limites conhecidos

O arquivo oficial foi observado no navegador para orientar marca KURIO, paleta escura, acentos âmbar, tipografia monoespaçada e composição. O conector não conseguiu fornecer contexto de design nem exportar os assets originais por restrição de acesso do arquivo.

As obras incluídas são SVGs sintéticos, novos e locais. O destaque Jungle usa uma imagem WebP própria. Portanto, **a fidelidade exata aos assets e a todos os frames do Figma não está certificada**. A galeria e a representação de edições também são simplificadas: cada NFT tem seu próprio estoque; variantes independentes de uma mesma obra não são modeladas.

A publicação e o envio são etapas separadas. Este documento não comprova que uma URL pública foi publicada ou que a candidatura foi enviada. A revisão adversarial e os resultados de validação ficam em `reports/`.

## Validação executada

Na rodada inicial de 27/10/2026 passaram 38 testes de domínio/HTTP e 54 testes Playwright, seguidos de 22 regressões direcionadas. Na atualização visual com as duas aparências, passaram 72 testes Playwright, incluindo 14 específicos de tema, e uma segunda rodada de 10 comparações visuais, com projetos desktop e mobile. TypeScript, lint e build passaram. As capturas de início, detalhe, carrinho e pagamento estão versionadas. A revisão adversarial e as medianas de três auditorias Lighthouse por página e perfil estão em `reports/`.

O CSS global é compilado de `src/styles.template.css`. Cores semânticas, espaçamento, raios e breakpoints vêm de `src/styleguide/theme`. Altere a fonte do tema e gere novamente, evitando editar os arquivos gerados manualmente.
