# Publicação

[Aplicação no Cloudflare Workers](https://kurio-jungle-marketplace-felipe.lannaitechnology.workers.dev)

O site usa Workers Static Assets, configurado em `wrangler.jsonc`. A pasta `dist` guarda os arquivos prontos do build: aplicação, imagens, fontes e mocks. API, login, carteiras, pagamentos e Socket.IO são simulados no navegador.

A opção `single-page-application` permite abrir uma página pelo link e atualizá-la sem perder a rota. O servidor usa `index.html` para carregar a aplicação.

## Publicar

Entre na conta pelo Wrangler e defina `CLOUDFLARE_ACCOUNT_ID` no ambiente.

```bash
npm run check
npm run build
npx wrangler@4.78.0 deploy --config wrangler.jsonc --x-autoconfig=false
```

## Cache e conferência dos arquivos

O navegador pode guardar arquivos para não precisar baixá-los novamente. As regras de `public/_headers` definem esse comportamento e são copiadas para o build:

| Arquivo                                | Cache-Control                         |
| -------------------------------------- | ------------------------------------- |
| HTML das páginas                       | `no-cache, no-transform`              |
| Arquivos em `/assets` com hash no nome | `public, max-age=31536000, immutable` |
| Service Worker                         | `no-cache`                            |

`no-transform` preserva o HTML sem o script automático JavaScript Detections da Cloudflare. Os arquivos com hash podem ser guardados por um ano. HTML e Service Worker precisam ser conferidos no servidor antes de serem reutilizados.

A auditoria usa SHA256 para conferir se os arquivos publicados são iguais aos gerados localmente. Como o servidor aplica as regras de `_headers`, esse arquivo é conferido de outra forma: conteúdo esperado na fonte e no build, respostas HTTP 200 e regras de cache realmente aplicadas. Os demais arquivos são comparados por inteiro.

Os [testes do site publicado](../reports/production-polish.json) e a [auditoria pública](../reports/lighthouse/summary.json) registram a versão conferida e os resultados.

Referências: [Static Assets](https://developers.cloudflare.com/workers/static-assets/get-started/), [rotas de SPA](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/), [cabeçalhos](https://developers.cloudflare.com/workers/static-assets/headers/) e [JavaScript Detections](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/).
