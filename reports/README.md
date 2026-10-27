# Evidências da revisão

Os documentos em `historical/34ba5b5/` pertencem à versão anterior. Suas notas e resultados não certificam a revisão atual. Os probes de desempenho também são diagnósticos intermediários, preservados para permitir a comparação sem selecionar apenas resultados favoráveis.

A rodada atual reúne a revisão de estrutura, regressões de isolamento, contratos, auditoria de dependências, comparações nativas com o Figma e a matriz Lighthouse em pastas próprias. O relatório de entrega final identifica os comandos, o código validado e os limites de cada evidência.

As imagens da conta são capturas da aplicação em dados fictícios. As capturas intermediárias que não constam mais nesta pasta estão identificadas no índice de arquivo abaixo. Comparativos com o Figma ficam em `visual-comparison/`, com dimensões e estado descritos. Um teste visual contra uma baseline da própria aplicação não comprova identidade com o design; os dois tipos de comparação são avaliados separadamente.

## Organização do pacote de evidências

Para reduzir o pacote de publicação, binários e páginas HTML intermediários redundantes foram retirados do repositório depois de conferir o SHA256 de cada original na cópia local completa. Estatísticas, resultados ruins, JSON, logs e hashes permanecem; o relatório HTML final, seu diretório `data/`, o trace que comprovou a falha real de login e todos os relatórios Lighthouse atuais foram preservados.

O [índice de artefatos arquivados](archived-artifacts-index.json) registra caminho original, bytes, SHA256, motivo e localização local de cada retirada. Referências antigas em texto devem ser consultadas por esse índice. Anexos idênticos reutilizam os arquivos do HTML final; referências exclusivas do arquivo local são marcadas como indisponíveis no pacote, sem um caminho fictício para download. A cópia completa permanece em `/Users/felipemoreiralanna/Documents/ChatGPT/jungle-review-evidence/2026-10-27/complete-before-publication`.
