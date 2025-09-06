# Requirements Document

## Introduction

Esta funcionalidade adiciona a capacidade de salvar e carregar configurações de filtros do relatório de aniversários. Os usuários poderão salvar suas configurações personalizadas com nomes descritivos e carregá-las posteriormente. As configurações serão armazenadas de forma criptografada na coluna `config_filtros_relatorios` da tabela `users` para garantir segurança e homogeneidade dos dados.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero poder salvar minhas configurações de filtro do relatório de aniversários, para que eu possa reutilizá-las posteriormente sem precisar reconfigurá-las manualmente.

#### Acceptance Criteria

1. WHEN o usuário configura os filtros do relatório THEN o sistema SHALL exibir um botão "Salvar Configuração"
2. WHEN o usuário clica em "Salvar Configuração" THEN o sistema SHALL abrir um modal para inserir o nome da configuração
3. WHEN o usuário insere um nome válido THEN o sistema SHALL salvar a configuração criptografada na coluna `config_filtros_relatorios`
4. WHEN o nome da configuração já existe THEN o sistema SHALL exibir mensagem de erro e solicitar um nome diferente
5. WHEN a configuração é salva com sucesso THEN o sistema SHALL exibir mensagem de confirmação

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero visualizar uma lista das minhas configurações salvas, para que eu possa escolher qual configuração carregar.

#### Acceptance Criteria

1. WHEN o usuário acessa as configurações do relatório THEN o sistema SHALL exibir uma seção "Configurações Salvas"
2. WHEN existem configurações salvas THEN o sistema SHALL listar todas as configurações com seus nomes
3. WHEN não existem configurações salvas THEN o sistema SHALL exibir mensagem "Nenhuma configuração salva"
4. WHEN o usuário visualiza a lista THEN o sistema SHALL mostrar data de criação de cada configuração
5. WHEN a lista tem muitas configurações THEN o sistema SHALL implementar scroll ou paginação

### Requirement 3

**User Story:** Como um usuário do sistema, eu quero carregar uma configuração salva, para que eu possa aplicar rapidamente filtros previamente definidos.

#### Acceptance Criteria

1. WHEN o usuário clica em uma configuração salva THEN o sistema SHALL carregar todos os filtros da configuração
2. WHEN uma configuração é carregada THEN o sistema SHALL atualizar todos os checkboxes e campos conforme a configuração
3. WHEN uma configuração é carregada THEN o sistema SHALL atualizar os insights do relatório automaticamente
4. WHEN ocorre erro ao carregar THEN o sistema SHALL exibir mensagem de erro e manter configuração atual
5. WHEN a configuração é carregada com sucesso THEN o sistema SHALL exibir feedback visual de confirmação

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero poder excluir configurações salvas que não uso mais, para manter minha lista organizada.

#### Acceptance Criteria

1. WHEN o usuário visualiza uma configuração salva THEN o sistema SHALL exibir um botão de exclusão
2. WHEN o usuário clica em excluir THEN o sistema SHALL solicitar confirmação antes de excluir
3. WHEN o usuário confirma a exclusão THEN o sistema SHALL remover a configuração do banco de dados
4. WHEN a configuração é excluída THEN o sistema SHALL atualizar a lista imediatamente
5. WHEN ocorre erro na exclusão THEN o sistema SHALL exibir mensagem de erro

### Requirement 5

**User Story:** Como desenvolvedor do sistema, eu quero que as configurações sejam armazenadas de forma segura e criptografada, para proteger as informações dos usuários.

#### Acceptance Criteria

1. WHEN uma configuração é salva THEN o sistema SHALL criptografar os dados antes de armazenar no banco
2. WHEN uma configuração é carregada THEN o sistema SHALL descriptografar os dados corretamente
3. WHEN dados corrompidos são encontrados THEN o sistema SHALL tratar o erro graciosamente
4. WHEN a criptografia falha THEN o sistema SHALL exibir erro e não salvar dados inválidos
5. WHEN múltiplas configurações existem THEN o sistema SHALL manter a integridade de todas

### Requirement 6

**User Story:** Como um usuário do sistema, eu quero que a interface de gerenciamento de configurações seja intuitiva e responsiva, para facilitar o uso em diferentes dispositivos.

#### Acceptance Criteria

1. WHEN o usuário acessa em desktop THEN o sistema SHALL exibir configurações em layout otimizado
2. WHEN o usuário acessa em mobile THEN o sistema SHALL adaptar a interface para telas menores
3. WHEN o usuário interage com controles THEN o sistema SHALL fornecer feedback visual imediato
4. WHEN operações estão em andamento THEN o sistema SHALL exibir indicadores de loading
5. WHEN erros ocorrem THEN o sistema SHALL exibir mensagens claras e acionáveis