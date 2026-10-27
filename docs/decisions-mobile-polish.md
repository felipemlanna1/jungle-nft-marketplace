# Polimento móvel da Home e da navegação

A revisão de 27/10/2026 corrigiu quatro pontos: desnível dos cartões, contador do carrinho, eixo do menu central e espaçamento do hero. O catálogo mobile passou a alinhar os cartões por linha, como adaptação ao desenho original.

## Decisões

- **Catálogo:** o grid conserva duas colunas, margens externas de 24 px e intervalo horizontal de 16 px. Foi removido o deslocamento de 32 px da coluna direita. Cada título reserva duas linhas de 20 px; o preço ocupa uma linha de 20 px, separada por 4 px. Isso nivela imagem, título, preço e base dos cartões de cada linha. Títulos maiores continuam limitados a duas linhas visualmente, preservando seu texto no documento.
- **Carrinho:** o badge móvel tem regra própria, texto centralizado, altura de 20 px e largura intrínseca com 4 px de espaço em cada lado. Ele cresce para três dígitos sem ultrapassar o alvo de 44 px. A contagem permanece no nome acessível do link; o badge visual é decorativo para evitar leitura duplicada.
- **Menu central:** o disco original e suas cores foram preservados. A montagem de cinco fragmentos foi substituída pelo ícone `Grid2X2` de 24 px, que representa o menu e permanece no mesmo eixo do botão de 65 px. O recorte circular de 81 px é um pseudo-elemento concêntrico, substituindo a sombra deslocada. O hover muda apenas o brilho; foco e teclado preservam a área do botão. A barra e a reserva de fim da página somam a área segura do aparelho.
- **Hero:** texto e imagem usam duas colunas de grid; os blocos de texto têm intervalo de 8 px. A imagem começa na mesma linha do texto, com 16 px de margem interna. O CTA tem alvo de 24 px. Os indicadores ocupam uma linha própria de 32 px após o conteúdo, sem posicionamento absoluto. A altura mínima de 208 px cresce conforme o conteúdo e a largura disponível. A miniatura continua sobreposta à arte de forma decorativa, sem ocupar texto ou indicadores. Foram preservados cores, imagens e fundo ilustrado.

## Organização dos estilos

As regras ficam em `catalog.template.css` e `shell.template.css`, usando `__BREAKPOINT_MOBILE__` para o limite mobile. O CSS entregue é produzido por `npm run theme:generate`. Não foram adicionados estilos inline. O componente de navegação contém apenas a troca do ícone e o atributo de acessibilidade do badge.

## Evidências e critérios

As capturas e as medidas antes/depois estão em `reports/mobile-polish/`. As larguras verificadas são 320, 375, 390, 414 e 440 px; a captura de 440 px tem 956 px de altura. O hero também mantém as verificações já existentes de tablet, desktop, ampliação, gesto e teclado.

Os testes verificam cartões alinhados, margens e espaços, texto sem encostar na imagem ou no botão, indicadores abaixo do conteúdo e menu centralizado. Também conferem o hover, a abertura e o fechamento pelo teclado e a volta do foco. Os contadores 1, 2, 9, 10, 99 e 100 são variações visuais do mesmo badge; o teste mede se os caracteres cabem nele.

A referência visual da Home móvel foi atualizada após as medições e a inspeção das capturas. A altura fixa e a coluna deslocada deram lugar à altura conforme o conteúdo e aos cartões alinhados. Os snapshots desktop e das demais páginas foram preservados.
