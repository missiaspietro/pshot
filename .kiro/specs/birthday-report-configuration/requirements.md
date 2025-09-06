# Requirements Document

## Introduction

Esta funcionalidade adiciona configurações avançadas ao card "Relatório de Aniversários", permitindo que os usuários personalizem quais campos incluir no relatório e apliquem filtros específicos para números inválidos e status de bots. O objetivo é dar maior controle e flexibilidade na geração de relatórios de aniversários.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero poder selecionar quais campos incluir no relatório de aniversários, para que eu possa personalizar o conteúdo do relatório conforme minhas necessidades.

#### Acceptance Criteria

1. WHEN o usuário clica no card "Relatório de Aniversários" THEN o sistema SHALL exibir uma seção de configuração com checkboxes para seleção de campos
2. WHEN o usuário visualiza a seção de configuração THEN o sistema SHALL mostrar checkboxes para os seguintes campos: Nome, Data de Nascimento, Telefone, Email, Status de Envio, Data de Envio
3. WHEN o usuário marca ou desmarca um checkbox THEN o sistema SHALL atualizar imediatamente a seleção de campos
4. WHEN todos os checkboxes estão desmarcados THEN o sistema SHALL desabilitar os botões de exportação (PDF/Excel)
5. WHEN pelo menos um checkbox está marcado THEN o sistema SHALL habilitar os botões de exportação

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero poder filtrar números inválidos no relatório de aniversários, para que eu possa gerar relatórios mais precisos excluindo dados problemáticos.

#### Acceptance Criteria

1. WHEN o usuário visualiza as configurações do relatório THEN o sistema SHALL exibir um dropdown "Filtro de Números Inválidos"
2. WHEN o usuário clica no dropdown de números inválidos THEN o sistema SHALL mostrar as opções: "Incluir Todos", "Apenas Válidos", "Apenas Inválidos"
3. WHEN o usuário seleciona "Apenas Válidos" THEN o sistema SHALL filtrar apenas registros com números de telefone válidos
4. WHEN o usuário seleciona "Apenas Inválidos" THEN o sistema SHALL filtrar apenas registros com números de telefone inválidos
5. WHEN o usuário seleciona "Incluir Todos" THEN o sistema SHALL incluir todos os registros independente da validade do número

### Requirement 3

**User Story:** Como um usuário do sistema, eu quero poder filtrar por status de bots (desconectados/enviados) no relatório de aniversários, para que eu possa analisar a efetividade dos envios automatizados.

#### Acceptance Criteria

1. WHEN o usuário visualiza as configurações do relatório THEN o sistema SHALL exibir um dropdown "Status de Bots"
2. WHEN o usuário clica no dropdown de status de bots THEN o sistema SHALL mostrar as opções: "Todos os Status", "Bots Conectados", "Bots Desconectados", "Enviados", "Não Enviados"
3. WHEN o usuário seleciona "Bots Conectados" THEN o sistema SHALL filtrar apenas registros onde o bot estava conectado
4. WHEN o usuário seleciona "Bots Desconectados" THEN o sistema SHALL filtrar apenas registros onde o bot estava desconectado
5. WHEN o usuário seleciona "Enviados" THEN o sistema SHALL filtrar apenas registros onde a mensagem foi enviada com sucesso
6. WHEN o usuário seleciona "Não Enviados" THEN o sistema SHALL filtrar apenas registros onde a mensagem não foi enviada

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero que as configurações sejam aplicadas dinamicamente aos insights do card, para que eu possa ver uma prévia dos dados filtrados antes de gerar o relatório.

#### Acceptance Criteria

1. WHEN o usuário altera qualquer configuração THEN o sistema SHALL atualizar automaticamente os "Insights Principais" do card
2. WHEN filtros são aplicados THEN o sistema SHALL recalcular e exibir: Taxa de conversão atualizada, Tempo médio de pagamento atualizado, Valor médio por fatura atualizado
3. WHEN nenhum registro corresponde aos filtros THEN o sistema SHALL exibir "Nenhum dado disponível com os filtros selecionados"
4. WHEN os filtros são resetados THEN o sistema SHALL restaurar os insights originais

### Requirement 5

**User Story:** Como um usuário do sistema, eu quero que a interface de configuração seja intuitiva e responsiva, para que eu possa usar facilmente em diferentes dispositivos.

#### Acceptance Criteria

1. WHEN o usuário visualiza as configurações em desktop THEN o sistema SHALL organizar os controles em uma grade de 2 colunas
2. WHEN o usuário visualiza as configurações em mobile THEN o sistema SHALL empilhar os controles em uma única coluna
3. WHEN o usuário interage com qualquer controle THEN o sistema SHALL fornecer feedback visual imediato
4. WHEN as configurações são expandidas THEN o sistema SHALL manter a altura consistente do card
5. WHEN o usuário clica fora das configurações THEN o sistema SHALL manter as configurações visíveis até serem explicitamente fechadas