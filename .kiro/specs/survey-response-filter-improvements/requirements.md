# Requirements Document

## Introduction

Esta spec aborda duas melhorias críticas no dropdown de filtro de respostas de pesquisas: implementar a lógica de filtro funcional que realmente filtra os dados baseado na seleção do usuário, e corrigir o problema de layout onde o dropdown fica "quadrado" quando textos longos são selecionados.

## Requirements

### Requirement 1: Implementar Lógica de Filtro Funcional

**User Story:** Como um usuário do sistema de relatórios, eu quero que quando eu selecione uma opção específica no dropdown de filtro de respostas (como "Apenas boas"), o relatório mostre apenas os registros que correspondem a essa seleção, para que eu possa analisar dados específicos de satisfação.

#### Acceptance Criteria

1. WHEN o usuário seleciona "Todas" no dropdown THEN o sistema SHALL mostrar todos os registros de pesquisa independente da resposta
2. WHEN o usuário seleciona "Apenas ótimas" no dropdown THEN o sistema SHALL mostrar apenas registros onde resposta = 1
3. WHEN o usuário seleciona "Apenas boas" no dropdown THEN o sistema SHALL mostrar apenas registros onde resposta = 2
4. WHEN o usuário seleciona "Apenas regulares" no dropdown THEN o sistema SHALL mostrar apenas registros onde resposta = 3
5. WHEN o usuário seleciona "Apenas péssimas" no dropdown THEN o sistema SHALL mostrar apenas registros onde resposta = 4
6. WHEN o filtro é aplicado THEN o sistema SHALL atualizar tanto o modal de preview quanto as exportações (PDF/Excel)
7. WHEN não há dados para o filtro selecionado THEN o sistema SHALL mostrar uma mensagem informativa "Nenhum registro encontrado para este filtro"

### Requirement 2: Corrigir Layout do Dropdown

**User Story:** Como um usuário do sistema, eu quero que o dropdown de filtro de respostas mantenha um layout consistente e não fique "quadrado" quando textos longos são selecionados, para que a interface permaneça visualmente agradável e funcional.

#### Acceptance Criteria

1. WHEN o usuário seleciona qualquer opção no dropdown THEN o botão do dropdown SHALL manter sua altura original
2. WHEN o texto selecionado é longo THEN o dropdown SHALL expandir horizontalmente para a direita
3. WHEN o dropdown expande THEN ele SHALL NOT expandir verticalmente (para cima ou para baixo)
4. WHEN o dropdown está fechado THEN ele SHALL manter largura mínima consistente
5. WHEN o dropdown está aberto THEN as opções SHALL ter largura adequada para mostrar todo o texto
6. WHEN em telas pequenas THEN o dropdown SHALL manter responsividade sem quebrar o layout

### Requirement 3: Integração com Sistema de Configurações

**User Story:** Como um usuário que salva configurações de relatório, eu quero que o filtro de resposta selecionado seja salvo junto com as outras configurações, para que eu possa reutilizar filtros específicos em relatórios futuros.

#### Acceptance Criteria

1. WHEN o usuário salva uma configuração THEN o filtro de resposta selecionado SHALL ser incluído na configuração salva
2. WHEN o usuário carrega uma configuração salva THEN o filtro de resposta SHALL ser restaurado corretamente
3. WHEN uma configuração não tem filtro de resposta salvo THEN o sistema SHALL usar "Todas" como padrão
4. WHEN o usuário altera o filtro após carregar uma configuração THEN a configuração SHALL ser marcada como modificada

### Requirement 4: Validação e Feedback do Sistema

**User Story:** Como um usuário do sistema, eu quero receber feedback claro sobre o status do filtro aplicado e validações apropriadas, para que eu entenda o que está acontecendo com meus dados.

#### Acceptance Criteria

1. WHEN um filtro é aplicado THEN o sistema SHALL mostrar indicação visual de que um filtro está ativo
2. WHEN o filtro resulta em zero registros THEN o sistema SHALL mostrar mensagem explicativa
3. WHEN há erro na aplicação do filtro THEN o sistema SHALL mostrar mensagem de erro clara
4. WHEN o filtro é removido (volta para "Todas") THEN o sistema SHALL remover indicações visuais de filtro ativo
5. WHEN o usuário tenta gerar relatório sem dados filtrados THEN o sistema SHALL prevenir a ação e mostrar aviso