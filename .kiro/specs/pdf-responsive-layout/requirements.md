# Requirements Document

## Introduction

Este documento define os requisitos para implementar um sistema de layout responsivo para os PDFs dos relatórios de cashback e aniversários. O objetivo é resolver o problema de PDFs com muitas colunas que não cabem na página, implementando detecção automática de layout e ajustes responsivos baseados no número de campos selecionados.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema de relatórios, eu quero que os PDFs se adaptem automaticamente ao número de colunas selecionadas, para que todas as informações sejam visíveis e legíveis independentemente da quantidade de campos escolhidos.

#### Acceptance Criteria

1. WHEN o usuário seleciona poucos campos (≤ 6 para aniversários, ≤ 5 para cashback) THEN o sistema SHALL gerar PDF em formato retrato (portrait) com fonte padrão de 12px
2. WHEN o usuário seleciona muitos campos (> 6 para aniversários, > 5 para cashback) THEN o sistema SHALL gerar PDF em formato paisagem (landscape) com fonte reduzida para 11px
3. WHEN o usuário seleciona campos em excesso (> 8 para aniversários, > 7 para cashback) THEN o sistema SHALL gerar PDF em formato paisagem com fonte de 10px e margens reduzidas
4. WHEN o PDF é gerado THEN o sistema SHALL detectar automaticamente o número de colunas sem intervenção manual do usuário

### Requirement 2

**User Story:** Como um usuário visualizando PDFs com muitas colunas, eu quero que o layout seja otimizado para caber todas as informações na página, para que eu não perca dados importantes por corte ou overflow.

#### Acceptance Criteria

1. WHEN há muitas colunas THEN o sistema SHALL aplicar largura máxima às células (200px normal, 150px larga, 120px muito larga)
2. WHEN o conteúdo da célula excede a largura máxima THEN o sistema SHALL aplicar text-overflow: ellipsis para indicar conteúdo cortado
3. WHEN há overflow horizontal THEN o sistema SHALL implementar scroll horizontal através de container com overflow-x: auto
4. WHEN o PDF é gerado THEN o sistema SHALL preservar a legibilidade do texto em todos os tamanhos de fonte

### Requirement 3

**User Story:** Como um usuário gerando relatórios de cashback, eu quero que o sistema use configurações específicas otimizadas para este tipo de relatório, para que o layout seja adequado aos campos típicos de cashback.

#### Acceptance Criteria

1. WHEN o relatório de cashback tem ≤ 5 campos THEN o sistema SHALL usar formato retrato com fonte 12px e padding 8px
2. WHEN o relatório de cashback tem > 5 e ≤ 7 campos THEN o sistema SHALL usar formato paisagem com fonte 11px e padding 6px
3. WHEN o relatório de cashback tem > 7 campos THEN o sistema SHALL usar formato paisagem com fonte 10px, padding 4px e margens 10mm
4. WHEN o PDF de cashback é gerado THEN o sistema SHALL manter a cor verde (#10b981) do cabeçalho

### Requirement 4

**User Story:** Como um usuário gerando relatórios de aniversários, eu quero que o sistema use configurações específicas otimizadas para este tipo de relatório, para que o layout seja adequado aos campos típicos de aniversários.

#### Acceptance Criteria

1. WHEN o relatório de aniversários tem ≤ 6 campos THEN o sistema SHALL usar formato retrato com fonte 12px e padding 8px
2. WHEN o relatório de aniversários tem > 6 e ≤ 8 campos THEN o sistema SHALL usar formato paisagem com fonte 11px e padding 6px
3. WHEN o relatório de aniversários tem > 8 campos THEN o sistema SHALL usar formato paisagem com fonte 10px, padding 4px e margens 10mm
4. WHEN o PDF de aniversários é gerado THEN o sistema SHALL manter a cor rosa (#e91e63) do cabeçalho

### Requirement 5

**User Story:** Como um usuário técnico, eu quero que o sistema use configurações otimizadas do Puppeteer para cada tipo de layout, para que a geração de PDF seja eficiente e o resultado seja de alta qualidade.

#### Acceptance Criteria

1. WHEN o layout é paisagem THEN o sistema SHALL configurar Puppeteer com landscape: true
2. WHEN o layout é muito largo THEN o sistema SHALL usar margens reduzidas (10mm) no Puppeteer
3. WHEN o layout é normal THEN o sistema SHALL usar margens padrão (15mm) no Puppeteer
4. WHEN o PDF é gerado THEN o sistema SHALL usar preferCSSPageSize: true para respeitar as configurações CSS @page

### Requirement 6

**User Story:** Como um usuário visualizando PDFs responsivos, eu quero receber feedback visual sobre o tipo de layout aplicado, para que eu entenda como o sistema otimizou a apresentação dos dados.

#### Acceptance Criteria

1. WHEN o PDF usa layout paisagem THEN o sistema SHALL incluir uma nota informativa no rodapé indicando "Tabela com X colunas - Formato paisagem otimizado"
2. WHEN o PDF usa layout retrato THEN o sistema SHALL não incluir nota adicional (comportamento padrão)
3. WHEN há otimizações aplicadas THEN o sistema SHALL manter a nota discreta (fonte 10px, cor #666)
4. WHEN o PDF é gerado THEN o sistema SHALL posicionar a nota entre a tabela e o rodapé oficial

### Requirement 7

**User Story:** Como um desenvolvedor mantendo o sistema, eu quero que as configurações responsivas sejam consistentes entre os diferentes tipos de relatório, para que o código seja maintível e as regras sejam previsíveis.

#### Acceptance Criteria

1. WHEN implementando detecção de colunas THEN o sistema SHALL usar a mesma lógica de detecção (isWideTable, isVeryWideTable)
2. WHEN aplicando estilos responsivos THEN o sistema SHALL usar as mesmas variáveis CSS (fontSize, cellPadding, headerFontSize)
3. WHEN configurando Puppeteer THEN o sistema SHALL usar a mesma estrutura de configuração condicional
4. WHEN há mudanças nas regras THEN o sistema SHALL permitir fácil atualização dos thresholds por tipo de relatório