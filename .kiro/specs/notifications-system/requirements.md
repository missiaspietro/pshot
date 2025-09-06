# Requirements Document

## Introduction

Esta spec define a implementação do sistema de notificações no elemento em formato de campainha localizado no canto superior da tela. O sistema deve buscar notificações da tabela `notificacoes` do Supabase, filtrando pela empresa e email do usuário logado.

## Requirements

### Requirement 1

**User Story:** Como usuário do sistema, eu quero ver um ícone de campainha no canto superior da tela, para que eu possa acessar minhas notificações.

#### Acceptance Criteria

1. WHEN o dashboard é carregado THEN o ícone de campainha SHALL estar visível no canto superior
2. WHEN há notificações não lidas THEN o ícone SHALL mostrar um indicador visual (badge)
3. WHEN não há notificações THEN o ícone SHALL aparecer sem indicador

### Requirement 2

**User Story:** Como usuário do sistema, eu quero que as notificações sejam buscadas da tabela notificacoes, para que eu veja apenas as notificações relevantes para mim.

#### Acceptance Criteria

1. WHEN as notificações são buscadas THEN o sistema SHALL consultar a tabela `notificacoes`
2. WHEN a query é executada THEN SHALL filtrar por `empresa = user.empresa`
3. WHEN a query é executada THEN SHALL filtrar por `email_destinatario = user.email`
4. WHEN as notificações são carregadas THEN SHALL ordenar por `created_at` descendente

### Requirement 3

**User Story:** Como usuário do sistema, eu quero clicar no ícone de campainha para ver uma lista das minhas notificações, para que eu possa ler as mensagens importantes.

#### Acceptance Criteria

1. WHEN o usuário clica na campainha THEN SHALL abrir um dropdown/modal com as notificações
2. WHEN o dropdown é aberto THEN SHALL mostrar as notificações mais recentes primeiro
3. WHEN uma notificação é exibida THEN SHALL mostrar: texto, remetente, data/hora
4. WHEN não há notificações THEN SHALL mostrar mensagem "Nenhuma notificação"

### Requirement 4

**User Story:** Como usuário do sistema, eu quero que as notificações não lidas sejam destacadas visualmente, para que eu possa identificar facilmente o que preciso ler.

#### Acceptance Criteria

1. WHEN uma notificação tem `status_leitura = 'nao'` THEN SHALL ser destacada visualmente
2. WHEN uma notificação tem `status_leitura = 'sim'` THEN SHALL aparecer com estilo normal
3. WHEN o usuário visualiza uma notificação THEN o `status_leitura` SHALL ser atualizado para 'sim'
4. WHEN há notificações não lidas THEN o badge no ícone SHALL mostrar a quantidade

### Requirement 5

**User Story:** Como usuário do sistema, eu quero que as notificações sejam atualizadas automaticamente, para que eu veja novas mensagens sem precisar recarregar a página.

#### Acceptance Criteria

1. WHEN o componente é montado THEN SHALL buscar as notificações iniciais
2. WHEN o usuário está ativo THEN SHALL verificar novas notificações periodicamente
3. WHEN novas notificações são encontradas THEN SHALL atualizar a lista automaticamente
4. WHEN o usuário sai da página THEN SHALL parar as verificações automáticas