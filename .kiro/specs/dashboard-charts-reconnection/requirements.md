# Requirements Document

## Introduction

Esta spec define a reconexão dos gráficos "Relatório de Envio de Aniversários - GERAIS" e "Pesquisas Enviadas" que estão com problemas de conexão ao Supabase. O objetivo é remover as conexões atuais e implementar novas conexões corretas com filtros apropriados.

## Requirements

### Requirement 1

**User Story:** Como usuário do dashboard, eu quero que o gráfico "Pesquisas Enviadas" seja desconectado do Supabase atual, para que possamos implementar uma nova conexão correta.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN a conexão atual do gráfico "Pesquisas Enviadas" SHALL ser removida
2. WHEN a conexão é removida THEN o gráfico SHALL mostrar estado de loading ou vazio
3. WHEN a remoção é concluída THEN não SHALL haver erros de console relacionados à conexão antiga

### Requirement 2

**User Story:** Como usuário do dashboard, eu quero que o gráfico "Relatório de Envio de Aniversários - GERAIS" seja desconectado do Supabase atual, para que possamos implementar uma nova conexão correta.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN a conexão atual do gráfico "Aniversários Gerais" SHALL ser removida
2. WHEN a conexão é removida THEN o gráfico SHALL mostrar estado de loading ou vazio
3. WHEN a remoção é concluída THEN não SHALL haver erros de console relacionados à conexão antiga

### Requirement 3

**User Story:** Como usuário do dashboard, eu quero que o gráfico "Pesquisas Enviadas" seja reconectado à tabela pesquisas_enviadas, para que eu possa visualizar dados dos últimos 6 meses da minha empresa.

#### Acceptance Criteria

1. WHEN o gráfico é reconectado THEN ele SHALL buscar dados da tabela `pesquisas_enviadas`
2. WHEN os dados são buscados THEN SHALL filtrar apenas registros dos últimos 6 meses
3. WHEN os dados são filtrados THEN SHALL mostrar apenas dados da empresa do usuário logado (campo `rede`)
4. WHEN os dados são processados THEN SHALL agrupar por mês e loja para exibição no gráfico

### Requirement 4

**User Story:** Como usuário do dashboard, eu quero que o gráfico "Relatório de Envio de Aniversários - GERAIS" seja reconectado à tabela relatorio_niver_decor_fabril, para que eu possa visualizar dados dos últimos 6 meses da minha empresa.

#### Acceptance Criteria

1. WHEN o gráfico é reconectado THEN ele SHALL buscar dados da tabela `relatorio_niver_decor_fabril`
2. WHEN os dados são buscados THEN SHALL filtrar apenas registros dos últimos 6 meses
3. WHEN os dados são filtrados THEN SHALL mostrar apenas dados da empresa do usuário logado (campo `rede`)
4. WHEN os dados são processados THEN SHALL filtrar apenas registros onde `mensagem_entrege = 'sim'`
5. WHEN os dados são agrupados THEN SHALL agrupar por loja para exibição no gráfico de pizza