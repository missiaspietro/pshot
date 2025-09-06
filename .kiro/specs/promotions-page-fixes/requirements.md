# Requirements Document

## Introduction

Esta spec aborda três problemas identificados na página de promoções:
1. Erro de autenticação ao buscar dados do usuário no localStorage
2. Exibição prematura do aviso de seleção de loja
3. Comportamento inadequado da textarea de descrição

## Requirements

### Requirement 1: Correção da Autenticação de Usuário

**User Story:** Como um usuário logado, eu quero que o sistema encontre meus dados de autenticação corretamente, para que as lojas sejam carregadas sem erros no console.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de promoções THEN o sistema SHALL buscar os dados do usuário através do contexto de autenticação ao invés do localStorage
2. WHEN os dados do usuário são obtidos com sucesso THEN o sistema SHALL usar a Rede/empresa do usuário para filtrar as lojas disponíveis
3. WHEN há erro na obtenção dos dados do usuário THEN o sistema SHALL exibir uma mensagem de erro apropriada ao invés de logs de erro no console
4. WHEN o usuário não possui Rede definida THEN o sistema SHALL exibir uma mensagem informativa sobre a necessidade de configuração

### Requirement 2: Controle de Exibição do Aviso de Seleção de Loja

**User Story:** Como um usuário criando uma promoção, eu quero que o aviso de seleção de loja apareça apenas quando eu tentar criar uma promoção sem selecionar uma loja, para que a interface não mostre avisos desnecessários.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de promoções THEN o aviso de seleção de loja SHALL NOT ser exibido inicialmente
2. WHEN o usuário tenta criar uma promoção sem selecionar uma loja THEN o sistema SHALL exibir o aviso "Você precisa selecionar uma loja para continuar"
3. WHEN o usuário seleciona uma loja após ver o aviso THEN o aviso SHALL desaparecer imediatamente
4. WHEN o usuário cria uma promoção com sucesso THEN o formulário SHALL ser resetado e o aviso SHALL NOT aparecer novamente até uma nova tentativa sem seleção

### Requirement 3: Melhoria da Textarea de Descrição

**User Story:** Como um usuário criando uma promoção, eu quero que a textarea de descrição tenha um tamanho fixo mas se torne scrollável quando necessário, para que eu possa inserir textos longos sem que a interface se torne desorganizada.

#### Acceptance Criteria

1. WHEN a página é carregada THEN a textarea de descrição SHALL ter uma altura fixa definida
2. WHEN o usuário digita texto que excede a altura visível THEN a textarea SHALL manter sua altura fixa
3. WHEN o texto excede a altura visível THEN a textarea SHALL exibir uma barra de rolagem vertical
4. WHEN o usuário usa a barra de rolagem THEN ele SHALL conseguir visualizar todo o conteúdo digitado
5. WHEN o usuário redimensiona manualmente a textarea THEN a funcionalidade de redimensionamento SHALL estar desabilitada
6. WHEN o texto é menor que a altura da textarea THEN a barra de rolagem SHALL NOT ser exibida