# Verificações de qualidade

A validação local e a integração contínua usam os mesmos comandos do `package.json`. `npm run check` gera os temas, verifica os tipos, executa o lint, confere a formatação e roda os testes unitários. A configuração de TypeScript permanece estrita; o ESLint trata `any` explícito como erro, sem exceção geral para o código da aplicação.

As regras de importação tornam duas fronteiras verificáveis: componentes, hooks e serviços não importam os mocks; o domínio não depende de React, componentes, serviços HTTP ou da camada de aplicação. O ponto de inicialização prepara o transporte simulado, e os testes de contrato podem importar os handlers. Essas exceções são explícitas na configuração, sem liberar os mesmos acessos para as telas.

O código próprio em `src` mantém estilos em folhas CSS. O ESLint rejeita o atributo JSX `style`, o acesso à propriedade CSSOM `element.style` e a atribuição direta do atributo `style` por `setAttribute`. Classes e atributos de estado continuam permitidos. A regra também vale para a inicialização, os mocks e os testes dentro de `src`; não há uma exceção geral nesses diretórios. As contraprovas usam a API `Linter` com a configuração efetiva do projeto e verificam exemplos proibidos e permitidos, além das fronteiras de importação já existentes.

Radix e Embla geram estilos dinâmicos no DOM para posicionamento, dimensões e movimento. Esse código pertence às dependências em `node_modules`, já excluídas da análise de fontes, e não foi escrito nos componentes React da aplicação. Bloquear ou alterar essa saída quebraria o funcionamento das bibliotecas. A distinção não autoriza estilos inline nos nossos componentes ou hooks; os estados visuais próprios usam classes e atributos de dados.

`npm run format` e `npm run format:check` compartilham a lista de diretórios definida em `scripts/format.mjs`. A conferência inclui o template CSS original, os módulos, scripts, testes, documentação e o workflow. Apenas dependências, arquivos gerados de testes, relatórios e o Service Worker fornecido pelo MSW ficam fora dessa conferência. A configuração não aplica alterações automaticamente durante a integração contínua.

O workflow usa Node.js 22 e `npm ci` com o arquivo de dependências versionado. As ações estão fixadas por commit, e o token recebe somente leitura do conteúdo. Não há segredo, envio de mensagem ou publicação nesse fluxo. Arquivos de diagnóstico de testes falhos ficam disponíveis por sete dias.

Os testes de Chromium rodam em macOS porque as referências visuais versionadas têm identificação Darwin. A atualização automática das imagens de referência está desativada. Uma diferença visual deve ser examinada antes de atualizar a imagem; a existência de uma configuração não demonstra aprovação dos testes. Mudanças na imagem do sistema operacional ou no navegador podem exigir nova revisão das referências, mesmo mantendo a plataforma.

Não foram adicionados hooks de Git nem ferramentas de preparação de commits: as verificações locais e o workflow já oferecem a mesma validação sem adicionar uma etapa obrigatória ao ambiente do candidato. Resultados locais, do serviço de integração contínua e da produção são registrados por revisão e escopo próprios.

## Estado em 27/10/2026

O runtime do commit `c8fefe8686114be4db364d43a87469ce09cf8e0f` está publicado em [Workers](https://kurio-jungle-marketplace-felipe.lannaitechnology.workers.dev) e no [mirror Sites, versão 5](https://kurio-jungle-marketplace-felipe.lanna-it.chatgpt.site). O [CI 40575466182](https://github.com/felipemlanna1/jungle-nft-marketplace/actions/runs/40575466182) terminou com sucesso nos dois jobs: 224 testes Vitest em 26 arquivos, 29 testes dos verificadores de artefatos e 166 E2E Chromium. As oito comparações visuais passaram sem atualização de snapshots no CI. A rodada local anterior de 164 E2E continua registrada como evidência histórica.

As quatro correções móveis, alinhamento dos cartões, badge do carrinho, eixo/ícone do menu e intervalos do hero, estão em [decisions-mobile-polish.md](decisions-mobile-polish.md). A rodada focada inicial teve duas falhas de gesto/teclado desktop; as repetições isoladas e os 16 casos desktop posteriores passaram. Esses resultados distintos permanecem em `reports/mobile-polish/summary.json`; novas execuções aprovadas não apagam as falhas nem demonstram ausência absoluta de intermitência.

Os [18 testes de produção](../reports/production-polish.json) passaram no HTTPS Workers, com zero falhas, skips ou retries: dez de layout (cinco larguras em dois projetos), quatro de favoritos com login, dois de newsletter e dois de compra. Um refinamento posterior apenas do teste do badge exige POST de quantidade 2 e reload, conferindo que o contador real aparece com texto `2`. Depois, mede 1/2/9/10/99/100 como fixtures de tipografia CSS no badge existente, sem criar um span. A quantidade 100 não representa uma compra pela API. Essa versão do teste está coberta pelos 18 casos de produção; o CI do commit anterior ao refinamento usou a versão anterior do teste. O runtime publicado permaneceu igual.

## Performance e liberação

A [matriz HTTPS atual](../reports/lighthouse/runs/2026-10-27T20-14-23-823Z/summary.json) reteve as 12 execuções (três por rota e perfil) com o throttling simulado padrão do Lighthouse 13.5.0. O artefato foi identificado por SHA256 e os cabeçalhos efetivos foram verificados; o HTML Workers foi idêntico ao build, sem envelope JSD. A matriz anterior do Sites, com Best Practices 81, permanece histórica e não foi reclassificada como aprovada.

| Rota         | Perfil  | Performance por execução | Mediana P | A   | BP  | SEO |
| ------------ | ------- | ------------------------ | --------- | --- | --- | --- |
| `/`          | mobile  | 83, 83, 83               | 83        | 100 | 100 | 92  |
| `/`          | desktop | 99, 98, 99               | 99        | 100 | 100 | 92  |
| `/nft/nft-1` | mobile  | 84, 85, 85               | 85        | 100 | 100 | 92  |
| `/nft/nft-1` | desktop | 99, 99, 98               | 99        | 100 | 100 | 92  |

Essa matriz foi reprovada pelo critério vigente durante sua execução, preservado no relatório original: medianas P90/A95/BP95/SEO90 e performance acima de 90 em cada execução. A meta original P90 mobile continua não atendida no Lighthouse estável. Nenhuma nota foi alterada.

A nota subjetiva de código permanece `null`. A revisão humana de Felipe e o envio do desafio não foram realizados.

## Aceitação para envio

Após as medições, Felipe autorizou em 27/10/2026 a liberação com a instrução: “Se as notas ficatem acima de 8 esta aprovado, preciso mandar ainda hoje”. A aceitação atual exige cada nota acima de 80 em todas as categorias e nas 12 execuções, sem descartar nenhuma. A matriz estável tem 48 notas, com mínimo de 83; está aprovada por esse critério. O [registro de liberação](../reports/release-readiness.json) mantém a meta original não cumprida separada da aceitação do candidato. O script aplica o novo limite às execuções futuras; o relatório estável anterior conserva seu gate histórico.

Os quatro ajustes móveis, a publicação e a validação automatizada estão concluídos. A versão está pronta para avaliação e envio pelo candidato. Não há comprovação de submissão e não foi atribuída uma nota subjetiva de arquitetura. A suíte atual do verificador tem 32 casos; o CI citado executou 29, antes dos três casos de seleção da ferramenta.

## Comparação do modelo HTTP/3

A [correção oficial dc559b0](https://github.com/ChromeDevTools/devtools-frontend/commit/dc559b0055da4651551c71779514d5bcd280507b) faz o Lantern tratar HTTP/3 como multiplexado. A versão estável 13.5.0 usa trace_engine0.0.65, anterior à correção. O alias `lighthouse-h3` fixa a versão oficial experimental 13.5.0-dev.20261023 com trace_engine0.0.67. O comando `AUDIT_ENGINE=h3 npm run audit:lighthouse` continua usando os mesmos perfis e throttling simulado padrão e produz `h3-summary.json`, preservando o sumário estável inclusive quando há diretório de saída personalizado.

A [matriz experimental completa](../reports/lighthouse/h3-summary.json) registra P95 no início mobile, P95 no detalhe mobile e P100 em ambos desktop; todas as execuções ficaram acima de 90, com A100/BP100/SEO92. Os 343 arquivos do build e as 164 dependências de runtime foram conferidos e permaneceram idênticos. Essa diferença é de ferramenta e modelo, sem melhoria adicional da aplicação. A condição experimental impede apresentar esse resultado como substituto silencioso do estável.

O [diagnóstico com throttling aplicado](../reports/performance/http3/devtools.report.json) também foi preservado: P80 e LCP4811ms, contra P83/LCP4738ms no diagnóstico estável simulado. O carregamento efetivamente limitado ainda tem custo de inicialização. Os métodos não são diretamente equivalentes, como explica a [documentação do Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/v13.5.0/docs/throttling.md). Esse diagnóstico isolado não é a matriz de aceitação, que foi definida previamente com o método simulado padrão.
