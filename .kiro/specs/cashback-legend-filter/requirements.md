# Requirements Document

## Introduction

Este spec aborda a melhoria do gráfico "Cash Back Tem TotalValores de cashback por mês e loja" no dashboard. Atualmente, o gráfico mostra todas as lojas do banco de dados na legenda, incluindo lojas que não possuem dados (barras) no gráfico. O objetivo é filtrar a legenda para mostrar apenas as lojas que realmente têm informações sendo exibidas no gráfico, e ocultar o botão "Ver mais" quando não há lojas suficientes para justificar sua presença.

## Requirements

### Requirement 1

**User Story:** Como usuário do dashboard, eu quero ver apenas as lojas que têm dados no gráfico de cashback na legenda, para que eu possa focar nas informações relevantes.

#### Acceptance Criteria

1. WHEN o gráfico de cashback é carregado THEN a legenda deve mostrar apenas lojas que possuem pelo menos uma barra no gráfico
2. WHEN uma loja não tem dados em nenhum mês THEN ela não deve aparecer na legenda
3. WHEN o usuário interage com a legenda THEN apenas lojas com dados devem ser destacadas no gráfico

### Requirement 2

**User Story:** Como usuário do dashboard, eu quero que o botão "Ver mais" apareça apenas quando necessário, para que a interface não mostre elementos desnecessários.

#### Acceptance Criteria

1. WHEN há 10 ou menos lojas com dados THEN o botão "Ver mais" não deve ser exibido
2. WHEN há mais de 10 lojas com dados THEN o botão "Ver mais" deve ser exibido
3. WHEN o número de lojas com dados muda THEN a visibilidade do botão deve ser atualizada automaticamente

### Requirement 3

**User Story:** Como desenvolvedor, eu quero manter a funcionalidade de buscar todas as lojas do banco de dados, para que o sistema continue funcionando corretamente para outros propósitos.

#### Acceptance Criteria

1. WHEN os dados são carregados THEN o sistema deve continuar buscando todas as lojas do banco de dados
2. WHEN os dados são processados THEN apenas a exibição na legenda deve ser filtrada
3. WHEN outras funcionalidades usam os dados de lojas THEN elas devem continuar recebendo todos os dados