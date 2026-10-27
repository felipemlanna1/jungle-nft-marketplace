# Verificações de qualidade

A validação local e a integração contínua usam os mesmos comandos do `package.json`. `npm run check` gera os temas, verifica os tipos, executa o lint, confere a formatação e roda os testes unitários. A configuração de TypeScript permanece estrita; o ESLint trata `any` explícito como erro, sem exceção geral para o código da aplicação.

As regras de importação tornam duas fronteiras verificáveis: componentes, hooks e serviços não importam os mocks; o domínio não depende de React, componentes, serviços HTTP ou da camada de aplicação. O ponto de inicialização prepara o transporte simulado, e os testes de contrato podem importar os handlers. Essas exceções são explícitas na configuração, sem liberar os mesmos acessos para as telas.

`npm run format` e `npm run format:check` compartilham a lista de diretórios definida em `scripts/format.mjs`. A conferência inclui o template CSS original, os módulos, scripts, testes, documentação e o workflow. Apenas dependências, arquivos gerados de testes, relatórios e o Service Worker fornecido pelo MSW ficam fora dessa conferência. A configuração não aplica alterações automaticamente durante a integração contínua.

O workflow usa Node.js 22 e `npm ci` com o arquivo de dependências versionado. As ações estão fixadas por commit, e o token recebe somente leitura do conteúdo. Não há segredo, envio de mensagem ou publicação nesse fluxo. Arquivos de diagnóstico de testes falhos ficam disponíveis por sete dias.

Os testes de Chromium rodam em macOS porque as referências visuais versionadas têm identificação Darwin. A atualização automática das imagens de referência está desativada. Uma diferença visual deve ser examinada antes de atualizar a imagem; a existência de uma configuração não demonstra aprovação dos testes. Mudanças na imagem do sistema operacional ou no navegador podem exigir nova revisão das referências, mesmo mantendo a plataforma.

Não foram adicionados hooks de Git nem ferramentas de preparação de commits: as verificações locais e o workflow já oferecem a mesma validação sem adicionar uma etapa obrigatória ao ambiente do candidato. O resultado executado no computador local deve permanecer separado do resultado futuro do serviço de integração contínua.
