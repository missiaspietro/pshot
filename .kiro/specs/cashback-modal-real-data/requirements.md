# Requirements Document

## Introduction

Esta funcionalidade visa conectar o modal de relatório de cashbacks aos dados reais da tabela `EnvioCashTemTotal`, removendo os dados fixos/mockados atualmente utilizados. O sistema deve buscar dados filtrados pela empresa do usuário logado e apresentá-los de forma dinâmica no modal de preview.

## Requirements

### Requirement 1

**User Story:** Como usuário do sistema, eu quero que o modal de relatório de cashbacks exiba dados reais da minha empresa, para que eu possa visualizar informações precisas e atualizadas sobre as transações de cashback.

#### Acceptance Criteria

1. WHEN o usuário clica no botão "Ver" do card de relatório de cashbacks THEN o sistema SHALL buscar dados reais da tabela `EnvioCashTemTotal`
2. WHEN os dados são buscados THEN o sistema SHALL filtrar apenas os registros da empresa do usuário logado
3. WHEN os dados são exibidos no modal THEN o sistema SHALL mostrar apenas os campos selecionados pelo usuário
4. WHEN não há dados para o período selecionado THEN o sistema SHALL exibir uma mensagem informativa "Nenhum dado encontrado"

### Requirement 2

**User Story:** Como usuário do sistema, eu quero que os dados sejam filtrados por período de data, para que eu possa visualizar cashbacks de um intervalo específico.

#### Acceptance Criteria

1. WHEN o usuário define uma data inicial THEN o sistema SHALL filtrar registros com `Envio_novo` maior ou igual à data inicial
2. WHEN o usuário define uma data final THEN o sistema SHALL filtrar registros com `Envio_novo` menor ou igual à data final
3. WHEN ambas as datas são definidas THEN o sistema SHALL aplicar ambos os filtros simultaneamente
4. WHEN nenhuma data é definida THEN o sistema SHALL buscar todos os registros da empresa

### Requirement 3

**User Story:** Como usuário do sistema, eu quero que apenas dados da minha empresa sejam exibidos, para que eu mantenha a segurança e privacidade dos dados organizacionais.

#### Acceptance Criteria

1. WHEN o sistema busca dados THEN o sistema SHALL identificar a empresa do usuário logado através do contexto de autenticação
2. WHEN a empresa é identificada THEN o sistema SHALL filtrar registros onde `Rede_de_loja` é igual à empresa do usuário
3. IF o usuário não tem empresa definida THEN o sistema SHALL retornar erro de autorização
4. WHEN dados são retornados THEN o sistema SHALL garantir que todos os registros pertencem à empresa do usuário

### Requirement 4

**User Story:** Como desenvolvedor do sistema, eu quero remover todos os dados mockados/fixos da API de cashback, para que o sistema utilize apenas dados reais do banco de dados.

#### Acceptance Criteria

1. WHEN a API `/api/reports/cashback` é chamada THEN o sistema SHALL conectar ao Supabase para buscar dados reais
2. WHEN dados mockados são encontrados no código THEN o sistema SHALL removê-los completamente
3. WHEN a conexão com o banco falha THEN o sistema SHALL retornar erro apropriado ao invés de dados mockados
4. WHEN dados são retornados THEN o sistema SHALL garantir que são provenientes da tabela `EnvioCashTemTotal`

### Requirement 5

**User Story:** Como usuário do sistema, eu quero que o modal mantenha a mesma interface e funcionalidades existentes, para que a experiência de uso permaneça consistente.

#### Acceptance Criteria

1. WHEN o modal é aberto THEN o sistema SHALL manter o layout e design atuais
2. WHEN dados são carregados THEN o sistema SHALL exibir indicador de loading durante a busca
3. WHEN ocorre erro na busca THEN o sistema SHALL exibir mensagem de erro com opção de tentar novamente
4. WHEN dados são exibidos THEN o sistema SHALL manter a funcionalidade de geração de PDF
5. WHEN o usuário fecha o modal THEN o sistema SHALL limpar os dados carregados da memória