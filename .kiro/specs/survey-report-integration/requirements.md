# Requirements Document

## Introduction

Este documento define os requisitos para conectar o card "Relatório de Pesquisas" no dashboard ao banco de dados, utilizando a tabela `respostas_pesquisas`. O sistema deve exibir métricas e dados das pesquisas filtrados pela empresa do usuário logado, seguindo o mesmo padrão dos outros cards de relatório já implementados.

## Requirements

### Requirement 1

**User Story:** Como um usuário logado no sistema, eu quero visualizar as métricas das pesquisas da minha empresa no card "Relatório de Pesquisas", para que eu possa acompanhar o desempenho das pesquisas realizadas.

#### Acceptance Criteria

1. WHEN o usuário acessa o dashboard THEN o sistema SHALL exibir o card "Relatório de Pesquisas" com dados reais da tabela `respostas_pesquisas`
2. WHEN o sistema busca dados de pesquisas THEN o sistema SHALL filtrar apenas registros onde o campo `rede` corresponde à empresa do usuário logado
3. WHEN não há dados de pesquisas para a empresa THEN o sistema SHALL exibir "0" nas métricas do card
4. WHEN há dados disponíveis THEN o sistema SHALL calcular e exibir o total de respostas de pesquisas

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero que o card de pesquisas exiba informações relevantes sobre as pesquisas realizadas, para que eu possa ter uma visão geral do engajamento dos clientes.

#### Acceptance Criteria

1. WHEN o card é carregado THEN o sistema SHALL exibir o número total de respostas de pesquisas
2. WHEN existem dados THEN o sistema SHALL mostrar informações sobre o período das pesquisas (data mais recente)
3. WHEN o usuário visualiza o card THEN o sistema SHALL manter a mesma estrutura visual dos outros cards de relatório
4. IF há respostas de pesquisas THEN o sistema SHALL exibir um indicador visual de que há dados disponíveis

### Requirement 3

**User Story:** Como um desenvolvedor do sistema, eu quero que a integração com o banco de dados seja eficiente e segura, para que o desempenho do dashboard seja mantido e os dados sejam protegidos.

#### Acceptance Criteria

1. WHEN o sistema faz consultas à tabela `respostas_pesquisas` THEN o sistema SHALL usar índices apropriados para otimizar performance
2. WHEN há erro na consulta ao banco THEN o sistema SHALL tratar o erro graciosamente e exibir estado de carregamento ou erro
3. WHEN o usuário não tem permissão para ver pesquisas THEN o sistema SHALL verificar as permissões antes de exibir dados
4. WHEN a consulta é executada THEN o sistema SHALL usar prepared statements para prevenir SQL injection

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero que o card de pesquisas seja interativo e permita acesso a mais detalhes, para que eu possa explorar os dados das pesquisas quando necessário.

#### Acceptance Criteria

1. WHEN o usuário clica no card de pesquisas THEN o sistema SHALL navegar para uma página de detalhes das pesquisas (se disponível)
2. WHEN o card está carregando dados THEN o sistema SHALL exibir um indicador de carregamento
3. WHEN há dados para exibir THEN o sistema SHALL mostrar as informações de forma clara e legível
4. IF o card suporta refresh THEN o sistema SHALL permitir atualização manual dos dados

### Requirement 5

**User Story:** Como um administrador do sistema, eu quero que os dados das pesquisas sejam filtrados corretamente por empresa, para que cada usuário veja apenas os dados relevantes à sua organização.

#### Acceptance Criteria

1. WHEN o sistema identifica a empresa do usuário THEN o sistema SHALL usar o campo `empresa` da tabela `users` para filtrar
2. WHEN a consulta é feita THEN o sistema SHALL filtrar `respostas_pesquisas` pelo campo `rede` correspondente à empresa do usuário
3. WHEN o usuário pertence a uma subrede específica THEN o sistema SHALL considerar também o campo `sub_rede` se aplicável
4. IF o usuário tem permissões especiais THEN o sistema SHALL respeitar as regras de acesso definidas no sistema de permissões