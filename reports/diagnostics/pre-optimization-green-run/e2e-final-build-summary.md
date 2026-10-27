# Verificação final do build

A suíte completa aprovou **148 de 148 testes**, em Chromium desktop e mobile, no build otimizado servido na porta 4173. Não houve falhas, testes pulados, novas tentativas de teste ou atualizações de referência visual nesta rodada. A execução levou 394.1 segundos com Node v22.22.0.

- [Relatório HTML completo](playwright-final-build-html/index.html)
- [Resultado JSON](e2e-final-build-verified.json)
- [Hashes e verificação dos arquivos servidos](e2e-final-build-evidence.json)
- [Contraprova da correção de login](login-bootstrap-counterproof.json)
- [Revisão adversarial dos controles](adversarial-release-review.json)

O HTML está em uma pasta versionável, fora das exclusões do Git. As oito comparações visuais vigentes participaram da execução. Elas verificam regressão em relação às referências aprovadas; não constituem uma nota nem uma declaração de fidelidade integral ao Figma.

## Integridade

O código e o build não mudaram durante a execução. O HTML, o JavaScript principal e o CSS servidos foram comparados com os arquivos do build antes e depois dos testes.

| Registro | SHA-256 antes e depois |
| --- | --- |
| Código, testes e configurações | `0a867c2b584234931fda8585f8de569ff8cd251267f777a250b89733fe494735` |
| Build otimizado | `c45dd68eac18dd9daabd8500228c5e57f4ea8db41ebaa34ad6359c9a5a9f6d08` |
| Todos os arquivos verificados | `26a4b6e77ad040d88fd10a892284bf0143064c66f95cad737cd1868cdaa49c1a` |

## Diagnóstico preservado

A primeira rodada terminou com 147 aprovações e uma falha real de concorrência no login. Seu [HTML e diagnóstico](diagnostics/login-bootstrap-first-full-run/html/index.html) foram preservados. A correção alterou o tratamento da geração de sessão e sua contraprova unitária. O teste de navegador que encontrou o problema permaneceu idêntico e passou na repetição completa.

A execução utilizou contas, carteiras e transações fictícias da demonstração. Mobile corresponde à emulação Chromium configurada no projeto.
