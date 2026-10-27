# Publicação

O build é estático. Não há backend de aplicação na hospedagem: API, autenticação, carteiras, pagamentos e Socket.IO continuam simulados no navegador, conforme o enunciado.

## Verificação da primeira hospedagem

A versão 4 no Sites foi publicada a partir do commit `17462b8340d7ed9a173a3c039687c133a73ec084`. Os 343 arquivos do runtime foram conferidos por SHA256 com o build aprovado nos 164 testes. Login, favoritos, newsletter e compra passaram em 14 testes adicionais no HTTPS público.

A leitura das respostas HTTP mostrou que essa hospedagem entrega `_headers` como arquivo comum e mantém `Cache-Control: public, max-age=0, must-revalidate`. As regras do arquivo não foram aplicadas. O HTML também recebeu o script JavaScript Detections da Cloudflare, ausente do build local. A matriz anterior do Lighthouse identificou APIs obsoletas nesse script.

Essa diferença é registrada; o script do provedor não foi removido do navegador usado nas medições. A identificação do HTML reconhece somente o envelope conhecido e continua comparando integralmente os bytes da aplicação.

## Publicação direta dos assets

O Wrangler 4.78.0 já estava instalado e autenticado na conta existente. Foi preparada uma publicação independente, exclusiva deste projeto, usando `wrangler.jsonc`. Não foram reutilizados projetos ou dados de outros aplicativos.

O modo `single-page-application` atende as rotas diretamente com `index.html`. A publicação usa o diretório `dist` já testado, sem recompilar nem introduzir um servidor de negócio. Os arquivos de configuração e os cabeçalhos seguem os recursos documentados de [Static Assets](https://developers.cloudflare.com/workers/static-assets/get-started/), [roteamento de SPA](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/) e [cabeçalhos](https://developers.cloudflare.com/workers/static-assets/headers/).

HTML usa revalidação e `no-transform`; arquivos com hash no nome podem ser mantidos em cache por um ano; o Service Worker exige revalidação. A diretiva `no-transform` é o mecanismo documentado para preservar o HTML sem a [injeção automática de JavaScript Detections](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/).

```bash
npm run check
npm run build
npx wrangler@4.78.0 deploy --config wrangler.jsonc
```

A autenticação da hospedagem fica fora do repositório. Não há token, conta de cobrança ou chave de serviço no código. A confirmação da nova publicação, dos cabeçalhos efetivos e das medições deve ser consultada nos relatórios de produção; uma configuração, isoladamente, não comprova esses resultados.

## Identidade da configuração na auditoria

Workers Static Assets [interpreta `_headers` e não o publica como asset](https://developers.cloudflare.com/workers/static-assets/headers/). Por isso, a auditoria admite que apenas esse arquivo retorne 404 ou o HTML de fallback da SPA, desde que o SHA256 da fonte e do build seja `3a1a46255d7e26661f8a523c5a19d403e91f7246c878fe086cc4dda7994ebbae`, correspondente à configuração revisada. Qualquer alteração exige nova revisão dessa exceção.

Essa aceitação exige respostas HTTP 200 e políticas efetivas: `no-cache, no-transform` em `/` e `/nft/nft-1`; `public, max-age=31536000, immutable` no primeiro JavaScript com hash do build; `no-cache` em `/mockServiceWorker.js`. As respostas das duas rotas e do fallback são verificadas contra o HTML de produção; JavaScript, Service Worker e todos os demais assets continuam sujeitos à comparação de bytes. Não há exceção para outro arquivo de configuração.

O relatório registra o SHA256 da fonte, do build, da resposta de `_headers`, cada política observada e a modalidade de verificação. Se a hospedagem entregar `_headers` byte a byte, a auditoria mantém essa comparação normal e registra a configuração como `unsupported`, sem afirmar que suas regras foram aplicadas. Os testes de contraprova rejeitam política ausente, status incorreto, configuração desconhecida e alterações arbitrárias de HTML ou assets.

Esse tratamento não modifica o HTML entregue ao navegador, as requisições ou as notas do Lighthouse. Os sete testes independentes do verificador do envelope Cloudflare permanecem preservados. A aprovação continua exigindo a matriz completa de três execuções, duas rotas e dois perfis, as medianas de 90/95/95/90 e performance acima de 90 em todas as execuções.
