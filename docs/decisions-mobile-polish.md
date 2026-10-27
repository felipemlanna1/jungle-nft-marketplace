# Polimento móvel da Home e da navegação

Em 27/10/2026, Felipe pediu quatro correções adicionais e autorizou afastar o catálogo do desenho original para nivelar os cartões. As capturas fornecidas mostram o deslocamento da coluna direita, o dígito do carrinho fora do badge, a diferença de eixo entre o botão central e seu recorte e os intervalos apertados no hero.

## Decisões

- **Catálogo:** o grid conserva duas colunas, margens externas de 24 px e intervalo horizontal de 16 px. Foi removido o deslocamento de 32 px da coluna direita. Cada título reserva duas linhas de 20 px; o preço ocupa uma linha de 20 px, separada por 4 px. Isso nivela imagem, título, preço e base dos cartões de cada linha. Títulos maiores continuam limitados a duas linhas visualmente, preservando seu texto no documento.
- **Carrinho:** o badge móvel tem regra própria, texto centralizado, altura de 20 px e largura intrínseca com 4 px de espaço em cada lado. Ele cresce para três dígitos sem ultrapassar o alvo de 44 px. A contagem permanece no nome acessível do link; o badge visual é decorativo para evitar leitura duplicada.
- **Menu central:** o disco original e suas cores foram preservados. A montagem de cinco fragmentos foi substituída pelo ícone `Grid2X2` de 24 px, que representa o menu e permanece no mesmo eixo do botão de 65 px. O recorte circular de 81 px é um pseudo-elemento concêntrico, substituindo a sombra deslocada. O hover muda apenas o brilho; foco e teclado preservam a área do botão. A barra e a reserva de fim da página somam a área segura do aparelho.
- **Hero:** texto e imagem usam duas colunas de grid; os blocos de texto têm intervalo de 8 px. A imagem começa na mesma linha do texto, com 16 px de margem interna. O CTA tem alvo de 24 px. Os indicadores ocupam uma linha própria de 32 px após o conteúdo, sem posicionamento absoluto. A altura mínima de 208 px cresce conforme o conteúdo e a largura disponível. A miniatura continua sobreposta à arte de forma decorativa, sem ocupar texto ou indicadores. Foram preservados cores, imagens e fundo ilustrado.

## Organização dos estilos

Todas as regras novas pertencem a `catalog.template.css` e `shell.template.css`, sob o ponto de quebra canônico `__BREAKPOINT_MOBILE__`. O CSS entregue é produzido por `npm run theme:generate`. Não foram adicionados estilos inline. O componente de navegação contém apenas a troca do ícone e o atributo de acessibilidade do badge.

## Evidências e critérios

As capturas e as medidas antes/depois estão em `reports/mobile-polish/`. As larguras verificadas são 320, 375, 390, 414 e 440 px; a captura de 440 px usa a altura pedida de 956 px. O hero também mantém as verificações já existentes de tablet, desktop, ampliação, gesto e teclado.

Os testes focados exigem igualdade de bordas entre pares de cartões, medidas das margens e intervalos, texto e imagem sem interseção, separação positiva entre texto e CTA, indicadores abaixo do conteúdo, alinhamento concêntrico do menu, estabilidade do hover e abertura/fechamento por teclado com retorno de foco. Os badges 1, 2, 9, 10, 99 e 100 são exercitados como variações visuais da mesma superfície; as medições incluem a caixa real dos caracteres e seus limites de rolagem.

O snapshot da Home móvel é atualizado somente após essas verificações e a inspeção das capturas. A mudança é intencional: os critérios anteriores de altura fixa e coluna deslocada foram substituídos pelo pedido posterior do usuário. Nenhum snapshot desktop ou de outras páginas deve ser atualizado por esta revisão. Não há declaração de reprodução integral do Figma.
