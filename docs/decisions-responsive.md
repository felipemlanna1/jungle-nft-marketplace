# Revisão da responsividade

A revisão de 27/10/2026 identificou diferenças de altura, posição e sobreposição em 440 × 956 px. As medidas e capturas abaixo complementam os testes de navegação.

## Fonte da comparação

Foram usados os seis frames mobile exportados do Figma em 414 × 896 px. As demais larguras são adaptações responsivas, pois não há um frame específico para cada aparelho. Perfil, carteiras e recibo não possuem referências mobile no material recebido.

As capturas usam a mesma largura e altura da referência, para comparar os espaços e alinhamentos. As diferenças estão registradas abaixo.

## Estilos e responsabilidades

As dimensões, cores e estados visuais pertencem aos arquivos de estilos. A galeria comunica a projeção selecionada por `data-view`; o hook controla somente a seleção e a abertura da ampliação. A máscara decorativa e o esquema de cores usam CSS. O fallback de inicialização também usa uma classe, sem declaração inline.

O ESLint bloqueia `style` em JSX, acesso a `element.style` e escrita de atributo `style` no código da aplicação. Também controla as importações entre regras de negócio, componentes, serviços e mocks. Radix e Embla continuam calculando seus próprios estilos.

Os estilos específicos da galeria, dos controles de quantidade, das recomendações, do detalhe e do pagamento ficam próximos dos respectivos componentes ou páginas. O gerador do tema resolve os pontos de quebra canônicos e produz o CSS utilizado pela aplicação. Ao mover esses estilos, foram comparadas as regras e o resultado no navegador.

## Alterações motivadas pela revisão

- A faixa com três ações permanentes sobre a arte foi retirada no mobile. O coração ocupa a posição do frame; compra e ampliação estão disponíveis no detalhe. O desktop mantém as três ações.
- As abas ganharam intervalos legíveis e alvos de interação. O ajuste de 27/10 nivelou as duas colunas e retirou o deslocamento de 32 px do desenho; as medidas estão em `decisions-mobile-polish.md`.
- O banner teve a posição do texto e a linha de base do botão corrigidas. O tablet recebeu dimensões próprias, preservando os frames de 414 e 1440 px.
- O bloco de acesso demonstrativo deslocava o botão de login em 97 px. Ele foi movido após as ações do formulário, sem alterar a autenticação.
- O pagamento mobile passou a apresentar carteiras, provedores e total antes do formulário. Os dados do colecionador continuam editáveis por rolagem, com as mesmas validações. Conexão e revisão continuam obrigatórias antes da confirmação, conforme o enunciado.
- O carrinho reserva a largura do título independentemente dos controles de quantidade. Os botões mobile usam círculos de 24 px.
- A galeria passou a acompanhar a largura disponível, retirando o limite de 366 px que centralizava a arte com margens diferentes em 440 px.
- Uma atualização em segundo plano inseria a barra de resultados mesmo sem filtros e deslocava os cartões. O estado de atualização agora é comunicado por `aria-busy`, sem acrescentar uma linha ao catálogo.
- Um nome de carteira com 60 caracteres sem espaços expandia a página para 678 px. A largura mínima do grid e a quebra do texto foram corrigidas. O teste passou em 320, 414 e 440 px; nomes normais mantiveram as mesmas medidas.
- Na viewport curta de 390 × 664 px, fixar o botão de revisão cobria os controles de conexão e recusa. A ação entrou no fluxo do resumo, com altura mínima baseada na viewport e margem automática. Em 896 px fica na base da composição; em alturas menores segue os controles por rolagem, sem cobri-los. A mesma estrutura atende à confirmação.

## Dados e limites

Carteiras, NFTs, preços, estoque, favoritos, recomendações e pedidos continuam vindo da API simulada. Não foram criados valores só para imitar um print. O subtotal dos itens do carrinho de referência é 8.14 ETH; o valor 8.92 ETH escrito no frame não corresponde à soma desses itens.

Uma carteira salva na conta de demonstração não representa o mesmo estado de um frame com duas carteiras. A contagem, o nome e a seleção apresentados devem corresponder à resposta da API. As etapas adicionais de conexão e revisão não podem ser omitidas apenas para aproximar a primeira dobra.

## Evidências

- `reports/mobile-home-review/`: comparações da Home, medidas e testes nas larguras de 320 a 440 px.
- `reports/mobile-account-review/`: referências e medidas de login, cadastro, perfil, carteiras e recibo.
- `reports/inline-style-enforcement.json`: testes do lint para estilos inline e regras de importação.
- `reports/accessibility-controls-evidence.json`: controles de preço, precisão, teclado, alvos e gesto do carrossel.

Os resultados de navegação, comparação visual e performance estão no [registro da versão](../reports/release-readiness.json) e nas [verificações de qualidade](quality-gates.md).
