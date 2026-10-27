# Revisão da responsividade

Em 27/10/2026, a revisão humana apontou diferenças de altura, posição e sobreposição no navegador em 440 × 956 px. Essa observação reabriu a validação visual: os testes de navegação anteriores não demonstravam fidelidade ao Figma.

## Fonte da comparação

Foram usados os seis frames mobile exportados do Figma em 414 × 896 px. As demais larguras são adaptações responsivas, pois não há um frame específico para cada aparelho. Perfil, carteiras e recibo não possuem referências mobile no material recebido.

As composições preservam as dimensões das capturas. Comparar imagens de mesmo tamanho permite examinar diferenças; não comprova equivalência integral por si só.

## Estilos e responsabilidades

As dimensões, cores e estados visuais pertencem aos arquivos de estilos. A galeria comunica a projeção selecionada por `data-view`; o hook controla somente a seleção e a abertura da ampliação. A máscara decorativa e o esquema de cores usam CSS. O fallback de inicialização também usa uma classe, sem declaração inline.

O ESLint reprova `style` em JSX, acesso a `element.style` e escrita de atributo `style` no código da aplicação. A configuração preserva as fronteiras entre domínio, componentes, serviços e mocks. Estilos calculados internamente pelo Radix e pelo Embla continuam sob responsabilidade dessas bibliotecas.

Os estilos específicos da galeria, dos controles de quantidade, das recomendações, do detalhe e do pagamento ficam próximos dos respectivos componentes ou páginas. O gerador do tema resolve os pontos de quebra canônicos e produz o CSS utilizado pela aplicação. A extração deve preservar tanto as declarações quanto os estilos computados antes de ser aceita.

## Alterações motivadas pela revisão

- A faixa com três ações permanentes sobre a arte foi retirada no mobile. O coração ocupa a posição do frame; compra e ampliação estão disponíveis no detalhe. O desktop mantém as três ações solicitadas anteriormente.
- As abas ganharam intervalos legíveis e alvos de interação. O pedido posterior de 27/10 nivelou as duas colunas e retirou o deslocamento de 32 px do desenho; a decisão vigente está em `decisions-mobile-polish.md`.
- O banner teve a posição do texto e a linha de base do botão corrigidas. O tablet recebeu dimensões próprias, preservando os frames de 414 e 1440 px.
- O bloco de acesso demonstrativo deslocava o botão de login em 97 px. Ele foi movido após as ações do formulário, sem alterar a autenticação.
- O pagamento mobile passou a apresentar carteiras, provedores e total antes do formulário. Os dados do coletor continuam editáveis por rolagem, com as mesmas validações. Conexão e revisão continuam obrigatórias antes da confirmação, conforme o enunciado.
- O carrinho reserva a largura do título independentemente dos controles de quantidade. Os botões mobile usam círculos de 24 px.
- A galeria passou a acompanhar a largura disponível, retirando o limite de 366 px que centralizava a arte com margens diferentes em 440 px.
- Uma atualização em segundo plano inseria a barra de resultados mesmo sem filtros e deslocava os cartões. O estado de atualização agora é comunicado por `aria-busy`, sem acrescentar uma linha ao catálogo.
- A revisão adversarial encontrou um nome de carteira válido, com 60 caracteres sem espaços, que expandia o documento para 678 px. Foram corrigidos o mínimo intrínseco do grid e a quebra do texto. A contraprova passou em 320, 414 e 440 px; nomes normais mantiveram os mesmos pixels.
- Na viewport curta de 390 × 664 px, fixar o botão de revisão cobria os controles de conexão e recusa. A ação entrou no fluxo do resumo, com altura mínima baseada na viewport e margem automática. Em 896 px fica na base da composição; em alturas menores segue os controles por rolagem, sem cobri-los. A mesma estrutura atende à confirmação.

## Dados e limites

Carteiras, NFTs, preços, estoque, favoritos, recomendações e pedidos continuam vindo da API simulada. Não foram criados valores só para imitar um print. O subtotal dos itens do carrinho de referência é 8.14 ETH; o valor 8.92 ETH escrito no frame não corresponde à soma desses itens.

Uma carteira salva na conta de demonstração não representa o mesmo estado de um frame com duas carteiras. A contagem, o nome e a seleção apresentados devem corresponder à resposta da API. As etapas adicionais de conexão e revisão não podem ser omitidas apenas para aproximar a primeira dobra.

## Evidências

- `reports/mobile-home-review/`: comparações da Home, medidas e testes nas larguras de 320 a 440 px.
- `reports/mobile-account-review/`: referências e medidas de login, cadastro, perfil, carteiras e recibo.
- `reports/inline-style-enforcement.json`: contraprovas do lint para estilos inline e fronteiras de importação.
- `reports/accessibility-controls-evidence.json`: controles de preço, precisão, teclado, alvos e gesto do carrossel.

Os resultados completos de navegação, regressão visual e performance devem ser registrados separadamente após a consolidação do build. Esta revisão não declara o teste completo nem atribui uma nota de fidelidade.
