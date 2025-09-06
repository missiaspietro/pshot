# Requirements Document

## Introduction

Esta spec define as correções necessárias para os gráficos do dashboard, incluindo títulos, legendas, descrições e alinhamentos. O objetivo é padronizar a apresentação visual e corrigir textos mal formatados que foram introduzidos em implementações anteriores.

## Requirements

### Requirement 1

**User Story:** Como usuário do dashboard, eu quero que o gráfico de pizza dos números inválidos tenha um título claro e texto corrigido, para que eu possa entender facilmente o que está sendo mostrado.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o gráfico de pizza SHALL ter o título "Números Inválidos dos Envios"
2. WHEN o gráfico é renderizado THEN o texto "NéšMEROS INVéLIDOS" SHALL ser corrigido para "NÚMEROS INVÁLIDOS"
3. WHEN o gráfico é exibido THEN ele SHALL estar alinhado com o gráfico "Gênero dos Clientes"

### Requirement 2

**User Story:** Como usuário do dashboard, eu quero que o gráfico de gênero dos clientes tenha texto corrigido e esteja alinhado, para que a visualização seja consistente.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o texto "gênero dos clientesVisé£o geral do sexo dos clientes" SHALL ser corrigido para "Gênero dos Clientes - Visão geral do sexo dos clientes"
2. WHEN os gráficos são renderizados THEN o gráfico de gênero SHALL estar alinhado com o gráfico de números inválidos

### Requirement 3

**User Story:** Como usuário do dashboard, eu quero que o gráfico de promoções dos últimos 6 meses tenha título e legenda, para que eu saiba o que está sendo visualizado.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o gráfico de promoções dos últimos 6 meses SHALL ter o título "Promoções Enviadas - Últimos 6 Meses"
2. WHEN o gráfico é exibido THEN ele SHALL ter uma legenda explicativa sobre o período

### Requirement 4

**User Story:** Como usuário do dashboard, eu quero que o gráfico de pesquisas enviadas tenha legenda, para que eu entenda o contexto temporal dos dados.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o gráfico de pesquisas enviadas SHALL ter uma legenda indicando "Pesquisas Enviadas - Últimos 6 Meses"

### Requirement 5

**User Story:** Como usuário do dashboard, eu quero que o gráfico de cashback tenha título e descrição corretos, para que eu entenda os dados detalhados apresentados.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o título "Cash Back Tem Total" SHALL ser alterado para "Cashbacks DETALHADO - Últimos 6 Meses"
2. WHEN o gráfico é exibido THEN ele SHALL ter uma descrição explicativa sobre os dados de cashback

### Requirement 6

**User Story:** Como usuário do dashboard, eu quero que o gráfico de relatório de aniversários tenha título corrigido e legenda, para que eu entenda que são envios gerais.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o título SHALL ser corrigido para "Relatório de Envio de Aniversários - GERAIS"
2. WHEN o gráfico é exibido THEN ele SHALL ter uma legenda indicando "Últimos 6 Meses"

### Requirement 7

**User Story:** Como usuário do dashboard, eu quero que o gráfico detalhado de aniversários tenha título corrigido e descrição, para que eu entenda que são dados detalhados.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o título "Envio de Aniversérios" SHALL ser corrigido para "Envio de Aniversários - DETALHADO"
2. WHEN o gráfico é exibido THEN ele SHALL ter uma legenda indicando "Últimos 6 Meses"
3. WHEN o gráfico é renderizado THEN ele SHALL ter uma descrição explicativa

### Requirement 8

**User Story:** Como usuário do dashboard, eu quero que o gráfico de respostas de pesquisas tenha a classificação "Ótimo" visível, para que todas as opções de classificação sejam claras.

#### Acceptance Criteria

1. WHEN o gráfico de respostas de pesquisas é carregado THEN a bolinha azul SHALL ter o texto "Ótimo" visível
2. WHEN a legenda é exibida THEN todas as classificações SHALL estar claramente identificadas

### Requirement 9

**User Story:** Como desenvolvedor, eu quero um relatório do status de conexão ao Supabase de cada gráfico, para que eu possa identificar quais precisam de correção posterior.

#### Acceptance Criteria

1. WHEN as correções são implementadas THEN SHALL ser gerado um relatório do status de conexão ao Supabase de cada gráfico
2. WHEN problemas de conexão são identificados THEN eles SHALL ser listados para correção futura