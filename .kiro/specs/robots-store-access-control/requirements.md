# Requirements Document

## Introduction

Este documento define os requisitos para implementar controle de acesso baseado em loja na página de robôs. Atualmente, usuários que não são Super Admin conseguem ver robôs de todas as lojas, mas o sistema deve ser modificado para que esses usuários vejam apenas os robôs da sua própria loja, enquanto Super Admins continuam tendo acesso a todos os robôs.

## Requirements

### Requirement 1

**User Story:** Como um usuário não Super Admin, eu quero ver apenas os robôs da minha loja, para que eu tenha acesso somente aos recursos que são relevantes para o meu contexto de trabalho.

#### Acceptance Criteria

1. WHEN um usuário não Super Admin acessa a página de robôs THEN o sistema SHALL filtrar os robôs exibidos baseado na loja do usuário
2. WHEN um usuário não Super Admin visualiza a lista de robôs THEN o sistema SHALL exibir apenas robôs onde o campo 'loja' corresponde à loja do usuário
3. WHEN um usuário não Super Admin não possui loja definida no perfil THEN o sistema SHALL exibir uma mensagem informativa indicando que nenhum robô foi encontrado
4. WHEN um usuário não Super Admin tenta acessar funcionalidades de robôs THEN o sistema SHALL permitir acesso apenas aos robôs da sua loja

### Requirement 2

**User Story:** Como um Super Admin, eu quero continuar vendo todos os robôs de todas as lojas, para que eu possa gerenciar o sistema completo sem restrições.

#### Acceptance Criteria

1. WHEN um usuário com access_level 'super_admin' acessa a página de robôs THEN o sistema SHALL exibir todos os robôs sem filtros de loja
2. WHEN um Super Admin visualiza a lista de robôs THEN o sistema SHALL manter o comportamento atual de exibir robôs filtrados apenas por empresa/rede
3. WHEN um Super Admin acessa funcionalidades de robôs THEN o sistema SHALL permitir acesso a todos os robôs da empresa

### Requirement 3

**User Story:** Como desenvolvedor, eu quero que o sistema de controle de acesso seja implementado de forma segura, para que não haja vazamento de dados entre lojas diferentes.

#### Acceptance Criteria

1. WHEN o sistema determina o nível de acesso do usuário THEN o sistema SHALL verificar o campo 'access_level' do usuário autenticado
2. WHEN o sistema aplica filtros de loja THEN o sistema SHALL usar o campo 'loja' do perfil do usuário como critério de filtro
3. WHEN o sistema executa consultas de robôs THEN o sistema SHALL aplicar filtros tanto no frontend quanto no backend para garantir segurança
4. IF um usuário não possui loja definida E não é Super Admin THEN o sistema SHALL retornar uma lista vazia de robôs

### Requirement 4

**User Story:** Como usuário do sistema, eu quero que as estatísticas da página de robôs reflitam apenas os robôs que tenho permissão para ver, para que as informações sejam precisas e relevantes.

#### Acceptance Criteria

1. WHEN as estatísticas de robôs são calculadas THEN o sistema SHALL considerar apenas os robôs visíveis para o usuário atual
2. WHEN um usuário não Super Admin visualiza os contadores THEN o sistema SHALL exibir contagens baseadas apenas nos robôs da sua loja
3. WHEN um Super Admin visualiza os contadores THEN o sistema SHALL exibir contagens de todos os robôs da empresa
4. WHEN não há robôs visíveis para o usuário THEN o sistema SHALL exibir zeros nos contadores com mensagem explicativa