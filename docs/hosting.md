# Publicação

[Aplicação na Vercel](https://jungle-nft-marketplace-felipe.vercel.app)

O site usa o build estático do Vite. API, login, carteiras, pagamentos e Socket.IO continuam simulados no navegador. O projeto usa Node.js 22.

## Publicar

Com a Vercel CLI instalada, entre na conta e vincule a pasta ao projeto `jungle-nft-marketplace-felipe`:

```bash
vercel link
```

Depois, confira o código, gere os arquivos e publique:

```bash
npm ci
npm run check
vercel build --prod --yes
vercel deploy --prebuilt --prod --yes
```

`vercel build` gera os arquivos em `.vercel/output`. A opção `--prebuilt` envia esses arquivos sem refazer o build no servidor. Assim, a publicação usa os mesmos arquivos conferidos localmente. A pasta `.vercel` fica fora do Git.

O `vercel.json` define o Vite, o comando de build, a saída `dist` e as rotas. Uma URL como `/nft/nft-1` carrega `index.html`, inclusive ao atualizar a página. Imagens, scripts e o Service Worker continuam sendo servidos como arquivos.

## Cache e conferência

As regras de cache da Vercel ficam em `vercel.json`:

| Arquivo                                | Cache-Control                         |
| -------------------------------------- | ------------------------------------- |
| HTML das páginas                       | `no-cache, no-transform`              |
| Arquivos em `/assets` com hash no nome | `public, max-age=31536000, immutable` |
| Service Worker                         | `no-cache`                            |

HTML e Service Worker são conferidos no servidor antes de serem reutilizados. Arquivos com hash podem ficar guardados por um ano, pois o nome muda quando o conteúdo muda. O arquivo `public/_headers` é usado na hospedagem Cloudflare; a Vercel usa as regras do `vercel.json`.

A publicação foi conferida comparando os 343 arquivos com o build validado. O [registro da conferência](../reports/vercel-host-verification.json) guarda os hashes, as rotas e os cabeçalhos. Os [testes no site publicado](../reports/production-vercel.json) ficam em relatório separado.

Referências: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [configuração do projeto](https://vercel.com/docs/project-configuration/vercel-json) e [publicação pela CLI](https://vercel.com/docs/cli/deploy).
