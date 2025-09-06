# Correção do Filtro de Configurações de Aniversários

## Introdução

O card de relatório de aniversários está exibindo configurações incorretas. Atualmente ele está puxando configurações do card de pesquisas de satisfação, mas deve exibir apenas as configurações que pertencem especificamente ao relatório de aniversários (configurações que terminam com "(Aniversários)" no nome).

## Requisitos

### Requisito 1

**User Story:** Como usuário do sistema de relatórios, eu quero que o card de aniversários exiba apenas suas próprias configurações salvas, para que eu possa gerenciar corretamente os filtros específicos deste relatório.

#### Acceptance Criteria

1. WHEN o usuário expandir a seção "Gerenciar Configurações" no card de aniversários THEN o sistema SHALL exibir apenas configurações que contenham "(Aniversários)" no final do nome
2. WHEN o usuário visualizar a lista de configurações salvas no card de aniversários THEN o sistema SHALL filtrar e mostrar somente configurações do tipo aniversários
3. WHEN o usuário carregar uma configuração no card de aniversários THEN o sistema SHALL aplicar apenas configurações válidas para este tipo de relatório
4. WHEN o usuário excluir uma configuração no card de aniversários THEN o sistema SHALL remover apenas configurações que pertencem ao tipo aniversários

### Requisito 2

**User Story:** Como desenvolvedor, eu quero que o sistema de filtros de configurações seja consistente entre todos os cards, para que cada card exiba apenas suas próprias configurações.

#### Acceptance Criteria

1. WHEN o sistema buscar configurações para o card de aniversários THEN o sistema SHALL aplicar filtro baseado no sufixo "(Aniversários)" no nome da configuração
2. WHEN o sistema exibir configurações salvas THEN o sistema SHALL garantir que não há vazamento de configurações entre diferentes tipos de relatórios
3. WHEN o usuário interagir com configurações THEN o sistema SHALL validar que a configuração pertence ao tipo correto de relatório
4. IF uma configuração não contém o sufixo correto THEN o sistema SHALL ignorá-la na listagem do card específico

### Requisito 3

**User Story:** Como usuário, eu quero que o sistema mantenha a separação clara entre configurações de diferentes tipos de relatórios, para evitar confusão e aplicação incorreta de filtros.

#### Acceptance Criteria

1. WHEN o sistema carregar configurações THEN o sistema SHALL separar configurações por tipo usando o sufixo no nome
2. WHEN o usuário salvar uma nova configuração de aniversários THEN o sistema SHALL garantir que o sufixo "(Aniversários)" seja adicionado
3. WHEN o sistema exibir a lista de configurações THEN o sistema SHALL mostrar apenas configurações compatíveis com o card atual
4. WHEN o usuário tentar carregar uma configuração incompatível THEN o sistema SHALL prevenir a operação e mostrar mensagem de erro apropriada