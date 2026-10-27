# Evidências do polimento móvel

As capturas mostram a mesma Home antes e depois dos quatro ajustes pedidos em 27/10/2026. A captura de 440 px usa 956 px de altura; as demais usam 896 px.

| Largura | Antes | Depois | Altura do hero | Desnível entre os dois primeiros cartões |
| --- | --- | --- | --- | --- |
| 320 px | [captura](before-320.png) | [captura](after-320.png) | 190 → 260 px | 32 → 0 px |
| 375 px | [captura](before-375.png) | [captura](after-375.png) | 190 → 244 px | 32 → 0 px |
| 390 px | [captura](before-390.png) | [captura](after-390.png) | 190 → 244 px | 32 → 0 px |
| 414 px | [captura](before-414.png) | [captura](after-414.png) | 190 → 226 px | 32 → 0 px |
| 440 px | [captura](before-440.png) | [captura](after-440.png) | 190 → 208 px | 32 → 0 px |

O hero passou a usar altura intrínseca: a quebra das descrições e dos títulos determina o espaço necessário. Cada slide preserva os intervalos entre texto, CTA, arte e indicadores. As quinze capturas `hero-{largura}-slide-{1,2,3}.png` permitem conferir cada destaque em cada largura.

O menu central fica no eixo da viewport, com botão/disco de 65 px, recorte de 81 px e ícone de 24 px. O centro vertical coincide com a borda superior da barra; o hover conserva as medidas. A reserva da página e a barra incluem a área segura.

Os arquivos `nav-badge-{1,2,9,10,99,100}.png` mostram as seis variações visuais. Para exercitar os extremos sem alterar o carrinho, os valores são inseridos na superfície visual durante a captura. A largura é de 20 px para um dígito e aproximadamente 26 px para três; os caracteres permanecem dentro do badge e o badge permanece dentro do alvo de 44 px. Não foram alterados dados, regras de compra ou contagens da aplicação.

As decisões completas estão em [decisions-mobile-polish.md](../../docs/decisions-mobile-polish.md). Os JSON de geometria preservam as medidas. Os relatórios compactos dos testes preservam status, erros e referências às evidências, sem repetir imagens codificadas em texto.

## Resultado dos testes

| Execução | Resultado | Registro |
| --- | --- | --- |
| Primeira rodada combinada | 30/32: móvel 16/16; desktop 14/16 | `focused-results.json` |
| Repetição isolada dos dois casos desktop | 2/2 | `interaction-recheck-results.json` |
| Confirmação desktop completa, sem concorrência com capturas | 16/16 | `focused-desktop-confirmation.json` |
| Atualização da referência da Home móvel | 1/1 | `home-mobile-snapshot-update.json` |
| Verificação da referência, sem atualização | 1/1 | `home-mobile-snapshot-verification.json` |

As falhas iniciais ocorreram no gesto/teclado do carrossel e foram preservadas no registro. As execuções seguintes passaram sem alterar a aplicação ou reduzir critérios; isso não estabelece ausência de intermitência. A métrica automática `flaky` registra novas tentativas dentro da mesma execução e não representa essas repetições manuais.

Os testes incluem as geometrias móveis, todas as navegações do hero e os tamanhos desktop anteriores. Apenas `catalog-mobile-darwin.png` mudou. A revisão visual independente de 320 px, 440 px e badge 100 não encontrou um problema concreto novo.

O arquivo `summary.json` registra contagens, limites e hashes dos arquivos congelados. Após esta etapa, o CI do commit c8fefe8 aprovou 166/166 testes, incluindo as oito referências visuais sem atualização. Os 18 testes na hospedagem Workers também passaram. A produção inclui o refinamento posterior do teste do badge: o contador 2 é criado por POST real à API mockada, conferido após reload e só então usado nas variações de tipografia. As contagens 1/2/9/10/99/100 continuam sendo fixtures de geometria do badge existente, sem criar um elemento ausente. O aplicativo publicado permaneceu idêntico. Veja [relatório de produção](../production-polish.json).
