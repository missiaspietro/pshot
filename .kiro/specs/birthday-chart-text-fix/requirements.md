e# Requirements Document

## Introduction

Este spec aborda a correção da orientação do texto da legenda do eixo X no gráfico "Envio de Aniversários" no dashboard. Atualmente, o texto dos labels do eixo X está aparecendo na diagonal (angle={-45}), o que prejudica a legibilidade. O objetivo é fazer com que o texto apareça na horizontal (normal).

## Requirements

### Requirement 1

**User Story:** Como usuário do dashboard, eu quero que o texto da legenda do eixo X do gráfico de aniversários apareça na horizontal, para que eu possa ler facilmente os nomes das lojas.

#### Acceptance Criteria

1. WHEN o gráfico "Envio de Aniversários" é carregado THEN o texto do eixo X deve aparecer na horizontal
2. WHEN o usuário visualiza o gráfico THEN todos os labels das lojas devem estar legíveis sem rotação
3. WHEN há muitas lojas THEN o texto deve continuar legível sem sobreposição

### Requirement 2

**User Story:** Como usuário do dashboard, eu quero que o layout do gráfico se ajuste adequadamente ao texto horizontal, para que não haja problemas de espaçamento ou corte do texto.

#### Acceptance Criteria

1. WHEN o texto está na horizontal THEN deve haver espaço suficiente na parte inferior do gráfico
2. WHEN há nomes de lojas longos THEN o texto não deve ser cortado
3. WHEN o gráfico é redimensionado THEN o texto deve continuar visível e bem posicionado

### Requirement 3

**User Story:** Como desenvolvedor, eu quero manter a consistência visual entre os gráficos de aniversários, para que ambos tenham a mesma aparência e comportamento.

#### Acceptance Criteria

1. WHEN ambos os gráficos de aniversários são exibidos THEN eles devem ter a mesma orientação de texto
2. WHEN as configurações são aplicadas THEN ambos os gráficos devem usar angle={0} no XAxis
3. WHEN outros gráficos do dashboard são verificados THEN a mudança não deve afetar outros componentes