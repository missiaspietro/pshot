# Requirements Document

## Introduction

Esta spec define as correções adicionais necessárias para textos corrompidos e títulos faltantes no dashboard. O objetivo é corrigir caracteres especiais mal formatados e adicionar títulos dinâmicos onde necessário.

## Requirements

### Requirement 1

**User Story:** Como usuário do dashboard, eu quero que o título do gráfico de promoções semanais tenha texto corrigido, para que eu possa ler claramente as informações.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o texto "Envio De Promoções - éšltima SemanaResumo diério de envios de Promoções" SHALL ser corrigido para "Envio De Promoções - Última SemanaResumo diário de envios de Promoções"

### Requirement 2

**User Story:** Como usuário do dashboard, eu quero que o texto dentro do gráfico de pizza de números inválidos esteja correto, para que eu possa entender os dados apresentados.

#### Acceptance Criteria

1. WHEN o gráfico de pizza de números inválidos é renderizado THEN o texto "NéšMEROS INVéLIDOS" SHALL ser corrigido para "Números Inválidos"

### Requirement 3

**User Story:** Como usuário do dashboard, eu quero que o título do gráfico de bots conectados tenha texto corrigido, para que a informação seja clara e legível.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o texto "Status de conexé£o dos bots" SHALL ser corrigido para "Status de conexão dos bots"

### Requirement 4

**User Story:** Como usuário do dashboard, eu quero que o primeiro gráfico de cashback tenha um título dinâmico, para que eu saiba qual período está sendo exibido.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o gráfico com descrição "Total de envios de cashback agrupados por loja" SHALL ter o título "Cashbacks enviados - [período selecionado]"
2. WHEN o usuário seleciona 1 mês THEN o título SHALL mostrar "Cashbacks enviados - 1 mês"
3. WHEN o usuário seleciona 2 meses THEN o título SHALL mostrar "Cashbacks enviados - 2 meses"
4. WHEN o usuário seleciona 3 meses THEN o título SHALL mostrar "Cashbacks enviados - 3 meses"

### Requirement 5

**User Story:** Como usuário do dashboard, eu quero que o texto do período de pesquisa esteja correto, para que eu possa entender a funcionalidade.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o texto "Peré­odo de pesquisa:" SHALL ser corrigido para "Período de pesquisa:"