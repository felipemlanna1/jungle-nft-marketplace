# Verificação final do build

A suíte completa aprovou **148 de 148 testes** em Chromium desktop e mobile, no build otimizado servido na porta 4173. Não houve falhas, testes pulados ou novas tentativas nesta rodada. As oito comparações visuais vigentes passaram sem atualização de referências. A execução levou 403.5 segundos com Node v22.22.0.

- [Relatório HTML completo](playwright-final-build-html/index.html)
- [Resultado JSON](e2e-final-build-verified.json)
- [Hashes e conferência dos arquivos servidos](e2e-final-build-evidence.json)
- [Histórico das correções de autenticação](login-bootstrap-counterproof.json)
- [Correções de prontidão dos testes](e2e-readiness-correction.json)
- [Revisão adversarial dos controles](adversarial-release-review.json)

O HTML está em uma pasta versionável, fora das exclusões do Git. Comparações visuais verificam regressão contra referências examinadas; não constituem nota nem declaração de fidelidade integral ao Figma.

## Integridade

Código, testes, configuração, `index.html` e build não mudaram durante a execução. O HTML, o JavaScript principal e o CSS servidos corresponderam ao build antes e depois dos testes.

| Registro | SHA-256 antes e depois |
| --- | --- |
| Código, testes, configuração e HTML de entrada | `6310f695397e53af21c40ac89973da1fcbc07058dacdb9f235ec1af833d6c0f9` |
| Build otimizado | `fea3e5c26045162e7940cb74afe8e5342e3ae6bca2f64167dd796077d8266993` |
| Todos os arquivos verificados | `8133887121d10b3738c947c966f831c73a258d4da0f7f63a8a0934ee22c6201f` |

## Diagnósticos preservados

A primeira rodada registrou [uma falha real de concorrência no login](diagnostics/login-bootstrap-first-full-run/html/index.html). A correção foi verificada na [rodada anterior à otimização](diagnostics/pre-optimization-green-run/html/index.html), preservada com seus próprios hashes.

Após a otimização inicial, [cinco falhas de prontidão dos testes](diagnostics/bootstrap-readiness-run/html/index.html) foram mantidas no histórico. Três fluxos esperavam apenas classes do placeholder ou o banner atrás do login. As esperas passaram a reconhecer conteúdo acessível real, a URL de destino e o fechamento do diálogo. As asserções de foco, igualdade da URL, identidade do pedido e ausência de duplicação permaneceram. Não houve espera direta pela sessão, pausa fixa ou alteração do runtime para corrigir esses testes. Os seis casos afetados passaram, seguidos da repetição completa de 148 casos no mesmo build.

A execução utilizou contas, carteiras e transações fictícias da demonstração. Mobile corresponde à emulação Chromium configurada no projeto.
