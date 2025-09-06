# Implementation Plan

- [x] 1. Implementar sistema de detecção de colunas para relatórios de cashback


  - Criar função detectLayout() que analisa o número de campos selecionados
  - Implementar thresholds específicos para cashback (> 5 = larga, > 7 = muito larga)
  - Adicionar flags isWideTable e isVeryWideTable baseados na contagem
  - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3_




- [ ] 2. Implementar sistema de detecção de colunas para relatórios de aniversários
  - Criar função detectLayout() que analisa o número de campos selecionados


  - Implementar thresholds específicos para aniversários (> 6 = larga, > 8 = muito larga)
  - Adicionar flags isWideTable e isVeryWideTable baseados na contagem
  - _Requirements: 1.1, 1.4, 4.1, 4.2, 4.3_


- [ ] 3. Implementar cálculo de estilos responsivos para cashback
  - Criar função calculateStyles() que retorna fontSize, cellPadding, headerFontSize baseados no layout
  - Implementar lógica condicional: 12px/8px (normal), 11px/6px (larga), 10px/4px (muito larga)
  - Adicionar cálculo de maxCellWidth: 200px, 150px, 120px respectivamente
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_


- [ ] 4. Implementar cálculo de estilos responsivos para aniversários
  - Criar função calculateStyles() que retorna fontSize, cellPadding, headerFontSize baseados no layout
  - Implementar lógica condicional: 12px/8px (normal), 11px/6px (larga), 10px/4px (muito larga)
  - Adicionar cálculo de maxCellWidth: 200px, 150px, 120px respectivamente
  - _Requirements: 2.1, 2.2, 4.1, 4.2, 4.3_


- [ ] 5. Atualizar geração de HTML responsivo para cashback
  - Modificar função generateReportHTML() para usar estilos calculados dinamicamente
  - Implementar CSS @page com size dinâmico (portrait/landscape) e margens variáveis
  - Adicionar container .table-container com overflow-x: auto para scroll horizontal
  - Aplicar max-width e text-overflow: ellipsis nas células da tabela

  - _Requirements: 2.1, 2.2, 2.3, 3.4_

- [ ] 6. Atualizar geração de HTML responsivo para aniversários
  - Modificar função generateReportHTML() para usar estilos calculados dinamicamente
  - Implementar CSS @page com size dinâmico (portrait/landscape) e margens variáveis
  - Adicionar container .table-container com overflow-x: auto para scroll horizontal

  - Aplicar max-width e text-overflow: ellipsis nas células da tabela
  - _Requirements: 2.1, 2.2, 2.3, 4.4_

- [ ] 7. Implementar configuração dinâmica do Puppeteer para cashback
  - Atualizar configuração do PDF para usar landscape baseado em isWideTable
  - Implementar margens dinâmicas: 15mm (normal/larga), 10mm (muito larga)

  - Adicionar preferCSSPageSize: true para respeitar configurações CSS @page
  - Manter cor verde (#10b981) específica do cashback no cabeçalho
  - _Requirements: 3.4, 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implementar configuração dinâmica do Puppeteer para aniversários
  - Atualizar configuração do PDF para usar landscape baseado em isWideTable


  - Implementar margens dinâmicas: 15mm (normal/larga), 10mm (muito larga)
  - Adicionar preferCSSPageSize: true para respeitar configurações CSS @page
  - Manter cor rosa (#e91e63) específica dos aniversários no cabeçalho
  - _Requirements: 4.4, 5.1, 5.2, 5.3, 5.4_


- [ ] 9. Adicionar feedback visual sobre otimizações aplicadas
  - Implementar nota informativa no rodapé quando layout paisagem é usado
  - Adicionar texto "Tabela com X colunas - Formato paisagem otimizado"
  - Aplicar estilo discreto: fonte 10px, cor #666, centralizado
  - Posicionar entre tabela e rodapé oficial do relatório
  - _Requirements: 6.1, 6.2, 6.3, 6.4_



- [ ] 10. Implementar testes unitários para detecção de colunas
  - Criar testes para função detectLayout() com diferentes números de campos
  - Testar thresholds específicos para cada tipo de relatório (cashback vs aniversários)
  - Validar flags isWideTable e isVeryWideTable para casos extremos

  - Testar comportamento com valores inválidos (0 campos, campos undefined)
  - _Requirements: 7.1, 7.4_

- [ ] 11. Implementar testes unitários para cálculo de estilos
  - Criar testes para função calculateStyles() com diferentes tipos de layout
  - Validar valores corretos de fontSize, cellPadding, headerFontSize para cada cenário
  - Testar consistência entre estilos relacionados (fonte e padding proporcionais)
  - Verificar unidades CSS válidas em todos os valores retornados
  - _Requirements: 7.2, 7.4_

- [ ] 12. Implementar testes de integração para geração de PDF
  - Criar testes end-to-end que verificam orientação correta da página
  - Testar geração de PDF com diferentes combinações de campos selecionados
  - Validar que cores específicas (rosa/verde) são mantidas em cada relatório
  - Verificar que margens e fontes são aplicadas corretamente no PDF final
  - _Requirements: 7.3, 7.4_

- [x] 13. Criar documentação técnica e guia de uso

  - Documentar thresholds de detecção para cada tipo de relatório
  - Criar guia explicando como o sistema escolhe layout portrait vs landscape
  - Documentar configurações de estilo para diferentes tipos de tabela
  - Incluir exemplos visuais mostrando diferenças entre layouts
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 14. Implementar sistema de configuração extensível


  - Criar interface ReportTypeConfig para definir configurações por tipo de relatório
  - Implementar REPORT_CONFIGS com thresholds, cores e campos padrão
  - Permitir fácil adição de novos tipos de relatório no futuro
  - Centralizar configurações para facilitar manutenção e atualizações
  - _Requirements: 7.1, 7.2, 7.3, 7.4_