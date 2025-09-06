# Implementation Plan

- [ ] 1. Criar componentes base de configuração
  - Implementar ReportConfigurationSection component
  - Criar FieldSelectionGroup com checkboxes
  - Adicionar estados para gerenciar configurações
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Implementar seleção de campos
  - [ ] 2.1 Criar interface para seleção de campos
    - Implementar checkboxes para cada campo disponível
    - Adicionar labels descritivos para cada campo
    - Implementar lógica de seleção/deseleção
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 2.2 Adicionar validação de campos selecionados
    - Validar que pelo menos um campo está selecionado
    - Desabilitar botões de exportação quando nenhum campo selecionado
    - Mostrar feedback visual para estado inválido
    - _Requirements: 1.4, 1.5_

- [ ] 3. Criar filtros de números inválidos
  - [ ] 3.1 Implementar dropdown de números inválidos
    - Criar Select component com opções de filtro
    - Implementar lógica de filtragem por validade de número
    - Adicionar estados para controlar seleção
    - _Requirements: 2.1, 2.2_

  - [ ] 3.2 Aplicar lógica de filtro de números
    - Implementar filtro "Apenas Válidos"
    - Implementar filtro "Apenas Inválidos"
    - Implementar opção "Incluir Todos"
    - _Requirements: 2.3, 2.4, 2.5_

- [ ] 4. Criar filtros de status de bots
  - [ ] 4.1 Implementar dropdown de status de bots
    - Criar Select component para status de bots
    - Adicionar todas as opções de status
    - Implementar lógica de seleção
    - _Requirements: 3.1, 3.2_

  - [ ] 4.2 Aplicar filtros de status de bots
    - Implementar filtro "Bots Conectados"
    - Implementar filtro "Bots Desconectados"
    - Implementar filtros "Enviados" e "Não Enviados"
    - Implementar opção "Todos os Status"
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [ ] 5. Implementar atualização dinâmica de insights
  - [ ] 5.1 Criar lógica de cálculo de insights filtrados
    - Implementar recálculo de taxa de conversão
    - Implementar recálculo de tempo médio de pagamento
    - Implementar recálculo de valor médio por fatura
    - _Requirements: 4.1, 4.2_

  - [ ] 5.2 Adicionar estados de feedback para filtros
    - Mostrar mensagem quando nenhum dado disponível
    - Implementar loading states durante recálculos
    - Adicionar opção de reset de filtros
    - _Requirements: 4.3, 4.4_

- [ ] 6. Integrar configurações no card existente
  - [ ] 6.1 Modificar card de aniversários existente
    - Adicionar seção de configuração ao card
    - Implementar toggle para expandir/colapsar configurações
    - Manter layout e styling consistentes
    - _Requirements: 5.4, 5.5_

  - [ ] 6.2 Implementar responsividade
    - Criar layout de 2 colunas para desktop
    - Implementar layout de coluna única para mobile
    - Adicionar breakpoints apropriados
    - _Requirements: 5.1, 5.2_

- [ ] 7. Adicionar feedback visual e interações
  - [ ] 7.1 Implementar feedback visual para controles
    - Adicionar hover states para todos os controles
    - Implementar focus states para acessibilidade
    - Adicionar animações suaves para transições
    - _Requirements: 5.3_

  - [ ] 7.2 Otimizar performance e UX
    - Implementar debounce para atualizações de insights
    - Adicionar memoização para cálculos pesados
    - Otimizar re-renders desnecessários
    - _Requirements: 4.1, 4.2_

- [ ] 8. Criar testes para funcionalidade
  - [ ] 8.1 Implementar testes unitários
    - Testar seleção/deseleção de campos
    - Testar aplicação de filtros
    - Testar cálculos de insights
    - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.6_

  - [ ] 8.2 Implementar testes de integração
    - Testar integração com card existente
    - Testar responsividade em diferentes telas
    - Testar fluxo completo de configuração
    - _Requirements: 4.1-4.4, 5.1-5.5_