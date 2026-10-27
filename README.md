# Kurio

Desafio Frontend da Jungle Gaming. Marketplace de NFTs com catálogo, favoritos, carrinho, compra e conta do colecionador.

[Aplicação](https://jungle-nft-marketplace-felipe.vercel.app) · [GitHub](https://github.com/felipemlanna1/jungle-nft-marketplace)

Usei React, TypeScript, Vite, TanStack Router e Query, Axios, Socket.IO, MSW, Tailwind e componentes no padrão shadcn/ui com Radix.

## Como rodar

É necessário Node.js 22, a partir da versão 22.19, e npm.

```bash
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173`.

Os mocks vêm ligados e não exigem `.env`. `VITE_MOCKS=false` desliga a simulação e exige um backend compatível.

A API REST, o Socket.IO, as carteiras e os pagamentos são simulados. Os dados ficam no navegador e são mantidos após atualizar a página.

## Contas e compra

| E-mail                   | Senha            |
| ------------------------ | ---------------- |
| `collector@example.test` | `Collect0r!Demo` |
| `second@example.test`    | `Collect0r!Demo` |

Adicione uma obra ao carrinho e faça login: os itens são mantidos. Teste os cupons `JUNGLE10` (desconto) e `EXPIRED` (expirado).

No pagamento, conecte uma carteira fictícia, revise e confirme. O recibo aparece após a confirmação da API.

## Como testar falhas

No rodapé, abra **Demonstração** e depois **Cenários de teste**. No mobile, use o menu central e escolha **Cenários de teste**.

| Cenário                      | O que fazer                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Rede lenta ou catálogo vazio | Selecione o cenário e abra o catálogo.                                                                                    |
| Sem conexão ou erro 503      | Selecione o cenário, confira o erro e volte para **Rede normal** para tentar novamente.                                   |
| Sessão expirada              | Entre na conta, selecione o cenário e tente abrir o perfil.                                                               |
| Pagamento recusado           | Selecione antes de confirmar a compra e confira que o carrinho é mantido.                                                 |
| Timeout após criar pedido    | Selecione antes de confirmar a compra e atualize a página para recuperar o mesmo pedido.                                  |
| Preço, estoque e reconexão   | Com carrinho ou pagamento aberto, use os botões de alteração de preço, edição esgotada, desconexão e reconexão do painel. |

Use **Redefinir todos os dados** para voltar às contas, senhas e itens iniciais. Isso também encerra a sessão.

## Organização

Em `src/modules`, separei catálogo, compra e conta. O componente mostra a tela e o hook cuida dos dados e das ações. As chamadas HTTP ficam em `src/services`; as regras de preço, estoque e pedido, em `src/domain`.

O `src/styleguide` reúne componentes compartilhados, tema, cores e tamanhos. O CSS fica no componente ou no tema. `src/mocks` contém a API, os eventos e os cenários de erro.

TanStack Query cuida dos dados da API, Context fornece o tema e Zustand guarda a obra aberta na prévia. Os filtros ficam na URL; as páginas secundárias carregam quando acessadas.

[Contratos, sessão, cache e recuperação de pedidos](./ARCHITECTURE.md).

## Adaptações do layout

- No catálogo mobile, alinhei os cards por linha para manter título e preço na mesma altura.
- Perfil, carteiras e recibo têm versão mobile, mesmo sem frames próprios no Figma.
- O carrinho usa o total calculado pela API. No desenho mobile, os itens somam 8,14 ETH, mas o subtotal informa 8,92 ETH.
- As miniaturas da galeria são enquadramentos da mesma arte. As seis imagens adicionais do catálogo têm [origem e arquivos registrados](./docs/generated-apes-provenance.json).

A newsletter registra a inscrição só na simulação. Login social e recuperação de senha estão indisponíveis. As demais diferenças do Figma estão na [arquitetura](./ARCHITECTURE.md).

## Comandos

| Comando                    | Uso                                                                  |
| -------------------------- | -------------------------------------------------------------------- |
| `npm run build`            | Gerar os arquivos de produção.                                       |
| `npm run preview`          | Abrir o build em `http://127.0.0.1:4173`.                            |
| `npm run typecheck`        | Conferir os tipos.                                                   |
| `npm run lint`             | Conferir as regras de código.                                        |
| `npm test`                 | Rodar os testes unitários.                                           |
| `npm run check`            | Gerar o tema e conferir tipos, lint, formatação e testes.            |
| `npm run test:e2e`         | Rodar os fluxos e comparações visuais em Chromium, desktop e mobile. |
| `npm run audit:lighthouse` | Medir início e detalhe no build de produção.                         |

Instale o Chromium com `npx playwright install chromium`. O Playwright abre o servidor local e salva o relatório em `playwright-report/`; os registros de falha ficam em `test-results/`.

Para o Lighthouse, gere o build e mantenha o preview aberto em outro terminal. A auditoria faz três medições por página e perfil, no cenário padrão. HTML e JSON ficam em `reports/lighthouse/runs/`.

## Resultados

Na revisão atual, passaram 224 testes unitários, 32 testes dos scripts e [172 E2E](https://github.com/felipemlanna1/jungle-nft-marketplace/actions/runs/40591145969), incluindo oito comparações visuais. Na aplicação publicada, passaram 24 testes dos principais fluxos e das mudanças de layout.

Na versão publicada, o Lighthouse estável teve performance 93 no início mobile, 94 no detalhe mobile e 100 no desktop; acessibilidade e boas práticas 100, e SEO 92. As metas do enunciado foram atendidas na rodada completa de 12 medições, já com o ajuste de borda dos cards. A [análise](./docs/quality-gates.md#lighthouse) reúne os resultados, as condições de execução e as tentativas anteriores.

[Relatórios](./reports) · [Decisões técnicas](./docs/decisions.json) · [Publicação](./docs/hosting.md)
