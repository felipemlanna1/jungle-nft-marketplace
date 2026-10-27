# KURIO | Marketplace de NFTs

[Aplicação pública](https://kurio-jungle-marketplace-felipe.lanna-it.chatgpt.site) · [Repositório](https://github.com/felipemlanna1/jungle-nft-marketplace)

Implementação do desafio Frontend da Jungle Gaming em React e TypeScript. Catálogo, conta, carrinho e compra usam REST simulado com MSW. Os eventos percorrem um cliente Socket.IO. Carteiras e pagamentos são fictícios.

## Executar

Use Node.js 22.19 ou superior e npm. A validação local usa Node.js 22.22. Não há serviço privado, chave ou arquivo de credenciais necessário.

```bash
npm ci
npm run dev
```

O endereço local é `http://127.0.0.1:5173`. Os mocks estão ativos por padrão. `VITE_MOCKS=false` os desativa para uma integração futura, que exige backend compatível; essa opção não é usada na demonstração publicada.

```bash
npm run check
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e
npm run audit:lighthouse
```

A auditoria usa o build otimizado em `http://127.0.0.1:4173`, aberto por `npm run preview`. Desenvolvimento e demonstração compartilham os mesmos contratos, handlers e fixtures. `npm run check` reúne geração do tema, TypeScript, lint, formatação e testes unitários.

## Avaliação manual

| Conta fictícia           | Senha fictícia   |
| ------------------------ | ---------------- |
| `collector@example.test` | `Collect0r!Demo` |
| `second@example.test`    | `Collect0r!Demo` |

1. Explore busca, categoria, faixa de preço, rede, ordenação e paginação. Atualize a página e use o histórico para verificar a restauração dos filtros.
2. Abra uma obra, altere a edição e a quantidade, adicione ao carrinho e autentique. O carrinho do visitante é preservado.
3. No carrinho, aplique `JUNGLE10`, remova o cupom e altere as quantidades. `EXPIRED` representa um código expirado. O resumo vem da cotação da API.
4. No pagamento, conecte uma carteira fictícia, revise os dados e confirme. O comprovante aparece após a confirmação efetiva da simulação.
5. Edite perfil, avatar, senha e carteiras; atualize a página para verificar a persistência.

Abra **Demonstração** no rodapé e depois **Cenários de teste**. No mobile, a navegação também dá acesso ao menu. O painel altera as condições dos handlers de rede, sem substituir dados dentro dos componentes.

| Cenário                             | Verificação                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| Rede lenta                          | Skeletons, carregamento e preservação do espaço                   |
| Catálogo vazio                      | Estado vazio e retorno aos resultados                             |
| Sem conexão ou erro 503             | Erro acessível e nova tentativa                                   |
| Sessão expirada                     | Autenticação e retorno ao contexto anterior                       |
| Pagamento recusado                  | Estado recusado, itens preservados e estoque liberado             |
| Timeout após criar pedido           | Recuperação da mesma tentativa após atualização, sem outra compra |
| Alterar preço ou disponibilidade    | Evento `nft.updated`, aviso e nova cotação                        |
| Desconectar e reconectar tempo real | Reconciliação REST do pedido pendente                             |

Use **Redefinir todos os dados** antes de repetir cenários. A simulação persiste no navegador atual. Ela não compartilha estado entre dispositivos e não substitui autenticação ou persistência de um produto real.

## Organização

O código segue módulos de domínio com páginas, componentes, hooks próximos da apresentação e `shared-types.ts`. Serviços concentram HTTP; regras de dinheiro, catálogo e edições ficam fora de React. O styleguide centraliza primitivas, receitas, tokens semânticos e geração de CSS.

Galeria, quantidade, recomendações, detalhe e pagamento têm estilos próximos dos seus componentes e páginas. O gerador resolve os pontos de quebra definidos no tema e rejeita tokens desconhecidos. Os estados visuais usam classes e atributos de dados; o lint impede estilos inline no código próprio. A [revisão de responsividade](./docs/decisions-responsive.md) registra as medidas, correções e contraprovas dessa organização.

A página inicial carrega diretamente. Conta, detalhe, carrinho, pagamento e pedido usam rotas com carregamento sob demanda. TanStack Query controla estado remoto; respostas obsoletas e ações de sessões anteriores são descartadas. React Context fornece os tokens do tema Kurio. Zustand guarda apenas o identificador da prévia global de uma obra; os dados continuam vindo da API e do cache de consultas.

Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para contratos, decisões, cache, sessão, dinheiro, idempotência e eventos. O [registro de decisões](./docs/decisions.json) reúne o motivo, a evidência e a forma de validação. As [verificações automáticas](./docs/quality-gates.md) também são executadas pelo workflow do repositório.

## Design e fidelidade

Kurio é a única aparência ativa, baseada nos frames e assets do Figma. A fonte Roboto Mono é local. As imagens originais foram deduplicadas e convertidas para WebP, preservando composição e proporção; essa compressão não é uma reprodução binária dos PNGs. Os primeiros nove itens preservam o conjunto do design. A segunda página recebeu seis retratos originais gerados, com variantes de 360, 600 e 900 pixels e [prompts e procedência registrados](./docs/generated-apes-provenance.json).

A revisão leu 62 comentários do arquivo original. O [registro da revisão](./docs/figma-comments-review.json) distingue correções aplicadas, dúvidas sem resposta e adaptações exigidas pelo enunciado. Não houve edição nem resolução de comentários no Figma.

Perfil, carteiras e confirmação têm adaptação mobile, mesmo quando não existe frame específico. Campos obrigatórios do pagamento continuam disponíveis em telas pequenas. Contagens de filtros e totais são calculados a partir dos dados reais da simulação. No carrinho mobile do Figma, os totais de linha somam 8,14 ETH e o subtotal desenhado informa 8,92 ETH; a aplicação mantém o cálculo correto da API.

Os cards desktop oferecem carrinho, favorito e ampliação. No mobile, o coração ocupa o canto da arte, como no frame; compra e ampliação ficam no detalhe, acessível pelo card. O favorito de visitante conduz ao login e preserva a intenção; a tela permite preencher a conta demonstrativa, sem redefinir uma senha que tenha sido alterada. A prévia consulta os dados atuais da obra. As recomendações vêm de um endpoint próprio e usam popularidade fictícia das fixtures, sem alegar comportamento real de colecionadores.

O Diário da Cunhagem usa quatro previews do template e uma leitura explicitamente ilustrativa pela API. A newsletter confirma um POST apenas na simulação local, sem envio real de e-mail; repetir o endereço não duplica a inscrição. OAuth e recuperação de senha mantêm estado indisponível explícito. Ícones Lucide substituem letras decorativas do rodapé, e as redes sociais abrem as plataformas como links ilustrativos, sem perfis oficiais inventados.

## Evidências e limites

Os relatórios da rodada atual ficam em `reports/`. Resultados de rodadas anteriores são históricos e não certificam esta revisão. As comparações visuais devem usar a mesma dimensão, conteúdo e estado; diferenças dinâmicas e adaptações estão documentadas.

Playwright cobre desktop e mobile com dados isolados, API MSW e Socket.IO efetivos. As baselines visuais são versionadas; sua atualização exige inspeção. Relatório HTML e traces locais são gerados em `playwright-report/` e `test-results/`.

Lighthouse executa três medições por página e perfil, preserva cada execução e informa as medianas, LCP, CLS, TBT, ambiente e identidade do build. A auditoria valida catálogo e conexão antes de medir; imagens, fonte e mocks permanecem ativos. As metas originais do enunciado são Performance 90, Acessibilidade 95, Boas práticas 95 e SEO 90. A aprovação exige essas medianas e performance acima de 90 em todas as execuções, conforme o pedido adicional do candidato. A mediana mobile de 95 é uma aspiração separada, sem alterar o critério exigido. O resultado medido deve ser consultado no relatório atual; a existência do script não comprova o cumprimento das metas.

Nenhum código de projetos profissionais anteriores, credencial real ou registro de cliente integra a entrega. As contas de demonstração usam `example.test`. A validação automática de segredos reduz o risco de exposição; ela não equivale a uma prova absoluta de ausência de dados sensíveis.

Publicação e envio do teste são etapas distintas. A entrega ao processo seletivo permanece a cargo do candidato após a avaliação humana.
