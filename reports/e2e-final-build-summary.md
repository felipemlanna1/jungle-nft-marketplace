# Verificação final do build

A suíte completa aprovou **164 de 164 testes** em Chromium desktop e mobile, no build otimizado servido na porta 4173. Cada perfil executou 82 casos. Não houve falhas, testes pulados, novas tentativas ou resultados instáveis. As oito comparações visuais vigentes passaram sem atualização de referências. A execução levou 368,4 segundos com Node v22.22.0, em um único worker.

- [Relatório HTML completo](playwright-final-build-html/index.html)
- [Resultado JSON](e2e-final-build-verified.json)
- [Hashes e conferência dos arquivos servidos](e2e-final-build-evidence.json)
- [Listagem dos 164 casos](e2e-final-build-list.txt)
- [Log completo](e2e-final-build-run.log)
- [Correções de acessibilidade e diagnósticos preservados](accessibility-controls-evidence.json)
- [Contraprovas da regra de estilos](inline-style-enforcement.json)
- [Investigação da execução anterior de CI](ci-investigation-c5.json)

O HTML está em uma pasta versionável, fora das exclusões do Git. A aprovação corresponde à execução automatizada local. Comparações visuais detectam regressão contra referências examinadas; não constituem nota nem declaração de fidelidade integral ao Figma. A nova execução de CI e a auditoria HTTPS do candidato publicado são verificações separadas.

## Integridade

Código, arquivos públicos, testes e referências visuais, configuração, `index.html`, gerador de tema e build não mudaram durante a execução. O HTML, o JavaScript principal e o CSS servidos corresponderam aos bytes do build antes e depois dos testes.

| Registro | SHA-256 antes e depois |
| --- | --- |
| Código, testes, configuração e HTML de entrada | `23f9ddc2a92b5ff36c23a7887a252f1954e1dc97df71a73e4c0bce7d569ff16e` |
| Build otimizado | `d965897bfb6fca9a9d0ebaa0cc241dcc6eb7bffb0371fcba992ca52971b89b9f` |
| Todos os arquivos verificados, incluindo runner | `7ab2ca1fb0c139cf17477e5944704c8dd7158e84896e2fd5e21fa7c7bb6ab66c` |

## Escopo comprovado

A rodada inclui autenticação e isolamento entre contas; favoritos após login; seleção efetiva de carteira; filtros por teclado e ponteiro sem arredondar campos ETH de 18 casas; compra, recusa e recuperação idempotente; reconexão e estoque em tempo real; rascunhos; leitura editorial; newsletter; foco dos diálogos; carrosséis; geometria responsiva e oito comparações visuais.

## Diagnósticos preservados

A execução de 148 casos anterior às correções atuais está preservada em [seu próprio relatório](diagnostics/pre-accessibility-148-green-20261027T192614Z/playwright-html/index.html), com os respectivos hashes e resultados. Ela não foi usada para aprovar os arquivos novos.

Duas provas de desenvolvimento da newsletter foram interrompidas por recargas Vite durante alterações de fonte. Seus traces estão em `reports/diagnostics/accessibility-controls-hmr/`. A rodada atual não teve recargas de desenvolvimento e aprovou os oito casos da newsletter no build congelado, mantendo suas asserções.

A execução anterior do GitHub Actions registrou uma falha no gesto mobile do carrossel. O trace mostrou demora nos comandos sequenciais; isso é uma hipótese de influência do runner, não causa única comprovada. O helper passou a usar um gesto touch nativo contínuo e verificar estabilidade geométrica. As asserções foram preservadas, e esta rodada local passou. O estado da nova CI permanece pendente.

Todos os fluxos usam contas, carteiras e transações fictícias. Mobile corresponde à emulação Chromium configurada no projeto. Não foram executados testes adicionais de estresse após esta rodada.
