# Verificações de qualidade

```bash
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

`check` gera o CSS do tema, confere tipos, formatação e regras de código e executa os testes Vitest e Node. O TypeScript usa modo estrito. O lint bloqueia `any` explícito, estilos inline no código próprio e imports entre camadas que devem ficar separadas. Radix e Embla geram seus próprios estilos para posicionamento e animação.

A [verificação no GitHub](../.github/workflows/quality.yml) usa Node.js 22 e `npm ci`. Os testes Chromium rodam em macOS, o mesmo sistema usado para criar as imagens de comparação. Essas imagens não são atualizadas automaticamente. O relatório HTML, as capturas e os registros de falhas ficam em `playwright-report/` e `test-results/`.

## Resultados

A [execução do commit c8fefe8](https://github.com/felipemlanna1/jungle-nft-marketplace/actions/runs/40575466182) passou com 224 testes Vitest em 26 arquivos, 29 testes dos scripts Node e 166 testes no navegador, incluindo oito comparações visuais. Os testes Node agora são 32, após a inclusão dos três casos de seleção da versão do Lighthouse.

Os [18 testes no site publicado](../reports/production-polish.json) cobrem a tela em cinco larguras, favoritos com login, newsletter e compra. O contador é preenchido pela API e conferido após atualizar a página. Números com um a três dígitos são usados para conferir seu encaixe.

A primeira revisão do carrossel teve duas falhas de gesto e teclado no desktop. As repetições passaram sem alterar a aplicação. As execuções estão no [relatório móvel](../reports/mobile-polish/summary.json).

## Lighthouse

Depois do build, execute `npm run preview` em outro terminal e depois:

```bash
npm run audit:lighthouse
```

Cada execução começa com os dados do navegador limpos e usa a simulação padrão de rede e processamento do Lighthouse. São três medições de cada tela em mobile e desktop. O script confere se os arquivos publicados são iguais aos do build e se a API e o Socket.IO estão funcionando. Os relatórios HTML e JSON guardam todas as medições.

A tabela mostra a mediana, o valor do meio das três medições do [Lighthouse 13.5.0 estável](../reports/lighthouse/summary.json):

| Tela    | Perfil  | Performance | Acessibilidade | Boas práticas | SEO |
| ------- | ------- | ----------- | -------------- | ------------- | --- |
| Início  | Mobile  | 83          | 100            | 100           | 92  |
| Início  | Desktop | 99          | 100            | 100           | 92  |
| Detalhe | Mobile  | 85          | 100            | 100           | 92  |
| Detalhe | Desktop | 99          | 100            | 100           | 92  |

A performance mobile ficou abaixo da meta de 90 do enunciado. Outra medição, com o limite de rede e processamento aplicado durante o teste, obteve [80 pontos e LCP de 4.811 ms](../reports/performance/http3/devtools.report.json). Ainda há custo de carregamento na inicialização.

A versão experimental oficial 13.5.0-dev.20261023 inclui uma [correção na simulação de conexões HTTP/3](https://github.com/ChromeDevTools/devtools-frontend/commit/dc559b0055da4651551c71779514d5bcd280507b). As [medições adicionais](../reports/lighthouse/h3-summary.json) tiveram medianas de 95 no mobile e 100 no desktop, com o mesmo build. O aplicativo não mudou; mudou a ferramenta usada para medir. Para repetir: `AUDIT_ENGINE=h3 npm run audit:lighthouse`. O resultado fica separado do estável.
