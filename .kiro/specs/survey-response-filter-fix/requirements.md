# Requirements Document - Correção do Filtro de Resposta das Pesquisas

## Introduction

O filtro de resposta no relatório de pesquisas de satisfação não está funcionando corretamente. Quando o usuário seleciona uma opção no dropdown (1-Ótimo, 2-Bom, 3-Regular, 4-Péssimo), a consulta não filtra os dados adequadamente, retornando "undefined" nos testes e não aplicando o filtro na prática.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero filtrar as pesquisas de satisfação por tipo de resposta (Ótimo, Bom, Regular, Péssimo), para que eu possa analisar apenas as respostas de um tipo específico.

#### Acceptance Criteria

1. WHEN o usuário marca o checkbox "Resposta" THEN o sistema SHALL exibir um dropdown com as opções de filtro
2. WHEN o usuário seleciona "Apenas ótimas" no dropdown THEN o sistema SHALL filtrar apenas registros com resposta = 1
3. WHEN o usuário seleciona "Apenas boas" no dropdown THEN o sistema SHALL filtrar apenas registros com resposta = 2
4. WHEN o usuário seleciona "Apenas regulares" no dropdown THEN o sistema SHALL filtrar apenas registros com resposta = 3
5. WHEN o usuário seleciona "Apenas péssimas" no dropdown THEN o sistema SHALL filtrar apenas registros com resposta = 4
6. WHEN o usuário seleciona "Todas" no dropdown THEN o sistema SHALL exibir todos os registros sem filtro
7. WHEN o filtro está ativo THEN o modal SHALL exibir apenas os registros que correspondem ao filtro selecionado

### Requirement 2

**User Story:** Como um desenvolvedor, eu quero que o filtro de resposta seja transmitido corretamente da interface para a API, para que a consulta no banco de dados seja executada com os parâmetros corretos.

#### Acceptance Criteria

1. WHEN o usuário seleciona um filtro no dropdown THEN o valor SHALL ser armazenado no estado `surveyResponseFilter`
2. WHEN o modal é aberto THEN o valor do filtro SHALL ser passado como prop `responseFilter`
3. WHEN a requisição é feita para a API THEN o `responseFilter` SHALL ser incluído no body da requisição
4. WHEN a API recebe a requisição THEN o `responseFilter` SHALL ser validado e aplicado na query do Supabase
5. WHEN a query é executada THEN apenas registros com o valor de resposta correspondente SHALL ser retornados

### Requirement 3

**User Story:** Como um usuário do sistema, eu quero ver uma indicação visual quando um filtro está ativo, para que eu saiba que os dados estão sendo filtrados.

#### Acceptance Criteria

1. WHEN um filtro de resposta está selecionado THEN o dropdown SHALL exibir um indicador visual (ponto colorido)
2. WHEN um filtro está ativo THEN o modal SHALL exibir "X de Y registros (filtrado)" na descrição
3. WHEN um filtro está ativo THEN o modal SHALL exibir um botão para remover o filtro
4. WHEN o usuário clica no botão de remover filtro THEN o filtro SHALL ser limpo e todos os registros SHALL ser exibidos

### Requirement 4

**User Story:** Como um desenvolvedor, eu quero logs detalhados do processo de filtragem, para que eu possa debugar problemas e monitorar o funcionamento do sistema.

#### Acceptance Criteria

1. WHEN o filtro é selecionado THEN o sistema SHALL registrar logs do valor selecionado
2. WHEN a requisição é enviada THEN o sistema SHALL registrar logs dos parâmetros da requisição
3. WHEN a API processa o filtro THEN o sistema SHALL registrar logs da validação e aplicação do filtro
4. WHEN a query é executada THEN o sistema SHALL registrar logs dos resultados retornados
5. WHEN ocorre um erro THEN o sistema SHALL registrar logs detalhados do erro com stack trace

### Requirement 5

**User Story:** Como um usuário do sistema, eu quero que o filtro de resposta seja persistido nas configurações salvas, para que eu possa reutilizar filtros específicos em relatórios futuros.

#### Acceptance Criteria

1. WHEN o usuário salva uma configuração com filtro ativo THEN o filtro SHALL ser incluído na configuração salva
2. WHEN o usuário carrega uma configuração salva THEN o filtro SHALL ser restaurado corretamente
3. WHEN uma configuração com filtro é carregada THEN o dropdown SHALL exibir o valor correto
4. WHEN uma configuração com filtro é carregada THEN o modal SHALL aplicar o filtro automaticamente

## Technical Constraints

- O filtro deve funcionar com valores numéricos (1, 2, 3, 4) no banco de dados
- A API deve validar os valores do filtro para evitar SQL injection
- O sistema deve ser compatível com a estrutura atual da tabela `respostas_pesquisas`
- Os logs devem ser informativos mas não impactar a performance
- A interface deve manter a usabilidade atual

## Success Criteria

- O filtro de resposta funciona corretamente para todos os valores (1, 2, 3, 4)
- A requisição chega na API com os parâmetros corretos
- A query do banco de dados retorna apenas os registros filtrados
- Os logs permitem debugar problemas facilmente
- A interface fornece feedback visual adequado sobre o estado do filtro
- O filtro é persistido e restaurado corretamente nas configurações salvas