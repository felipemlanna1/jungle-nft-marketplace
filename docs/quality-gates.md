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

A [execução completa do commit d18f892](https://github.com/felipemlanna1/jungle-nft-marketplace/actions/runs/40591145969) passou com 224 testes Vitest em 26 arquivos, 32 testes dos scripts Node e 172 testes no navegador, incluindo oito comparações visuais. As imagens de comparação não foram atualizadas nessa execução.

Na [aplicação publicada na Vercel](https://jungle-nft-marketplace-felipe.vercel.app), passaram [24 testes](../reports/production-vercel.json): dois de moldura dos cards, quatro de tags, dez de layout, quatro de favoritos com login, dois de newsletter e dois de compra. A [conferência da publicação](../reports/vercel-host-verification.json) também confirmou que os 343 arquivos são iguais aos do build local.

A primeira revisão do carrossel teve duas falhas de gesto e teclado no desktop. As repetições passaram sem alterar a aplicação. As execuções estão no [relatório móvel](../reports/mobile-polish/summary.json).

## Lighthouse

Para medir localmente, gere o build, execute `npm run preview` em outro terminal e depois `npm run audit:lighthouse`. Para repetir a medição do site publicado:

```bash
AUDIT_URL=https://jungle-nft-marketplace-felipe.vercel.app npm run audit:lighthouse
```

Cada execução começa com os dados do navegador limpos e usa o cenário padrão dos mocks. O Lighthouse simula a velocidade de rede e processamento de cada perfil. São três medições de cada tela em mobile e desktop, com todos os relatórios HTML e JSON preservados. O script confere os arquivos publicados, a API e a conexão Socket.IO antes de medir.

A [última rodada completa na Vercel](../reports/lighthouse/vercel/2026-10-27-card-status/summary.json) é do commit `db81f5d`, anterior ao ajuste de raio e borda dos cards em `d18f892`. Usou Lighthouse 13.5.0 estável, Node.js 22.22.0 e Chromium 156.0.8078.4. A tabela mostra a mediana, o valor do meio das três medições desse commit:

| Tela    | Perfil  | Performance | Acessibilidade | Boas práticas | SEO |
| ------- | ------- | ----------- | -------------- | ------------- | --- |
| Início  | Mobile  | 93          | 100            | 100           | 92  |
| Início  | Desktop | 100         | 100            | 100           | 92  |
| Detalhe | Mobile  | 94          | 100            | 100           | 92  |
| Detalhe | Desktop | 100         | 100            | 100           | 92  |

As metas do enunciado são 90 em performance, 95 em acessibilidade e boas práticas e 90 em SEO. No commit `db81f5d`, todas foram atendidas nas quatro combinações de tela e perfil, com performance acima de 90 nas 12 execuções.

Nessa rodada, o LCP mediano foi de 3.178,6 ms no início mobile e 3.029,1 ms no detalhe mobile; no desktop, 712,8 ms e 583,8 ms. O CLS ficou em zero nas 12 execuções. O TBT mediano foi de 8 ms no início mobile e zero nos demais casos.

Após o ajuste de borda em `d18f892`, a [primeira tentativa](../reports/lighthouse/vercel/2026-10-27-card-frame/incomplete.json) e a [segunda](../reports/lighthouse/vercel/2026-10-27-card-frame-final/incomplete.json) foram interrompidas pelo navegador com `TargetCloseError`. Os arquivos parciais foram mantidos. Ainda não há uma rodada Lighthouse completa dessa revisão; a tabela continua identificada com o commit anterior. O ajuste atual foi conferido pelos 224 testes Vitest, 32 testes Node e 172 testes no navegador, incluindo oito comparações visuais, além dos 24 testes na Vercel.

## Histórico das outras medições

Na [hospedagem Workers](../reports/lighthouse/runs/2026-10-27T20-14-23-823Z/summary.json), o Lighthouse estável registrou performance mobile 83/85; o [diagnóstico com limite de rede aplicado](../reports/performance/http3/devtools.report.json) teve 80 pontos. A [comparação experimental de HTTP/3](../reports/lighthouse/h3-summary.json), também no Workers, teve medianas 95 no mobile e 100 no desktop; esses resultados são históricos e ficam separados das medições na Vercel.
