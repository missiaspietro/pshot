# Requirements Document - Correção do Filtro de Empresa em Promoções

## Introduction

O sistema de relatórios de promoções está retornando dados vazios devido a um problema no filtro por empresa. Os logs mostram que a empresa do usuário é 'temtotal', mas os registros na tabela têm o campo 'Rede' como undefined/null, causando a remoção de todos os dados pelo sistema de segurança.

## Requirements

### Requirement 1

**User Story:** Como usuário do sistema, eu quero visualizar os dados de promoções no modal, para que eu possa analisar as campanhas promocionais da minha empresa.

#### Acceptance Criteria

1. WHEN o usuário clicar em "Ver" no card de promoções THEN o modal deve abrir e mostrar dados
2. WHEN a API buscar dados THEN deve considerar registros com campo 'Rede' null/undefined como válidos
3. WHEN houver registros na tabela THEN eles devem aparecer no modal independente do valor do campo 'Rede'

### Requirement 2

**User Story:** Como desenvolvedor, eu quero que o sistema seja mais flexível com filtros de empresa, para que dados não sejam perdidos por campos vazios.

#### Acceptance Criteria

1. WHEN o campo 'Rede' estiver null/undefined THEN o sistema deve incluir esses registros
2. WHEN o campo 'Rede' estiver vazio ("") THEN o sistema deve incluir esses registros  
3. WHEN houver uma empresa específica THEN deve filtrar apenas por essa empresa
4. WHEN não houver empresa definida THEN deve mostrar todos os registros

### Requirement 3

**User Story:** Como usuário, eu quero que o sistema tenha logs claros sobre filtros aplicados, para que eu possa entender por que dados aparecem ou não.

#### Acceptance Criteria

1. WHEN a API processar filtros THEN deve logar claramente quais filtros foram aplicados
2. WHEN dados forem removidos THEN deve explicar o motivo específico
3. WHEN não houver dados THEN deve sugerir possíveis soluções
4. WHEN houver dados THEN deve confirmar quantos registros foram encontrados

### Requirement 4

**User Story:** Como administrador, eu quero que o sistema seja robusto com dados inconsistentes, para que a aplicação continue funcionando mesmo com dados imperfeitos.

#### Acceptance Criteria

1. WHEN houver registros com campos null THEN o sistema deve continuar funcionando
2. WHEN houver registros com campos vazios THEN o sistema deve continuar funcionando
3. WHEN houver mistura de dados válidos e inválidos THEN deve processar os válidos
4. WHEN todos os dados forem inválidos THEN deve retornar mensagem clara explicando o problema

### Requirement 5

**User Story:** Como usuário, eu quero que o modal de promoções funcione corretamente, para que eu possa gerar relatórios e PDFs das campanhas.

#### Acceptance Criteria

1. WHEN o modal abrir THEN deve mostrar dados em formato de tabela
2. WHEN houver dados THEN o botão "Gerar PDF" deve estar habilitado
3. WHEN não houver dados THEN deve mostrar mensagem explicativa
4. WHEN houver erro THEN deve mostrar opção de tentar novamente