# Histórico da alternância visual

`themes-v2.spec.ts.txt` preserva o código da suíte anterior, e `themes-v2-snapshots/` conserva suas referências. Esses arquivos ficam fora do diretório executado pelo Playwright e não são testes da versão entregue.

A alternância Jungle/Kurio foi retirada por decisão explícita do usuário em 27/10/2026: o marketplace deve seguir o visual Kurio do Figma. Os testes de troca de tema e a comparação visual exclusiva do Expedition deixaram de representar o produto. A retirada não significa que tenham passado na nova versão nem que uma falha visual tenha sido aprovada.

A cobertura vigente está em `tests/e2e/kurio.spec.ts`: visual único nas rotas, migração de preferências antigas, armazenamento bloqueado, teclado, preservação de filtros, carrinho e rascunhos, além dos limites de layout. `tests/e2e/drafts.spec.ts` permanece ativo e continua verificando rascunhos após respostas atualizadas da conta. Os resultados históricos mantêm seus próprios escopos e hashes; a contagem anterior não deve ser apresentada como a contagem da versão atual.
