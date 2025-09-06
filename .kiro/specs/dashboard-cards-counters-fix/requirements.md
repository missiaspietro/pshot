# Requirements Document

## Introduction

Este documento define os requisitos para corrigir os contadores dos cards "Pesquisas" e "Promoções" no dashboard, fazendo com que exibam dados reais das respectivas tabelas filtrados pela empresa do usuário logado.

## Requirements

### Requirement 1

**User Story:** Como usuário do sistema, eu quero que o card "Pesquisas" (anteriormente "Relatório de Pesquisas") mostre o número real de pesquisas enviadas da minha empresa, para que eu tenha uma visão precisa dos dados.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o card SHALL exibir o título "Pesquisas" ao invés de "Relatório de Pesquisas"
2. WHEN o dashboard é carregado THEN o sistema SHALL consultar a tabela `pesquisas_enviadas` filtrando pela empresa do usuário logado
3. WHEN a consulta é executada THEN o sistema SHALL contar TODOS os registros que correspondem à empresa do usuário
4. WHEN o contador é obtido THEN o card SHALL exibir o número real ao invés do valor fixo "10.000"
5. IF não houver registros para a empresa THEN o card SHALL exibir "0"

### Requirement 2

**User Story:** Como usuário do sistema, eu quero que o card "Promoções" mostre o número real de promoções da minha empresa, para que eu tenha controle sobre quantas promoções foram criadas.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o sistema SHALL consultar a tabela `promocoes` filtrando pela empresa do usuário logado
2. WHEN a consulta é executada THEN o sistema SHALL contar TODOS os registros que correspondem à empresa do usuário
3. WHEN o contador é obtido THEN o card SHALL exibir o número real de promoções
4. IF não houver registros para a empresa THEN o card SHALL exibir "0"
5. WHEN há erro na consulta THEN o sistema SHALL exibir "0" e registrar o erro no console

### Requirement 3

**User Story:** Como desenvolvedor, eu quero que o sistema use a informação da empresa do usuário logado obtida da API de perfil, para que os filtros sejam aplicados corretamente.

#### Acceptance Criteria

1. WHEN o usuário faz login THEN o sistema SHALL obter os dados do usuário incluindo o campo `empresa`
2. WHEN as consultas dos contadores são executadas THEN o sistema SHALL usar o valor do campo `empresa` como filtro
3. WHEN o campo `empresa` não estiver disponível THEN o sistema SHALL exibir "0" nos contadores
4. WHEN há múltiplas empresas no sistema THEN cada usuário SHALL ver apenas os dados da sua empresa

### Requirement 4

**User Story:** Como usuário do sistema, eu quero que os contadores sejam atualizados em tempo real quando eu navego pelo dashboard, para que eu sempre veja informações atualizadas.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN os contadores SHALL ser consultados automaticamente
2. WHEN o usuário retorna ao dashboard de outras páginas THEN os contadores SHALL ser atualizados
3. WHEN há erro na consulta THEN o sistema SHALL tentar novamente após 5 segundos
4. WHEN a consulta está em andamento THEN o card SHALL mostrar um indicador de carregamento