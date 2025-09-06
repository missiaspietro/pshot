# Implementation Plan

- [ ] 1. Criar serviço de relatório de promoções


  - Implementar PromotionsReportService baseado no CashbackReportService
  - Configurar para usar tabela "Relatorio Envio de Promoções"
  - Implementar filtros por empresa/rede do usuário
  - Adicionar validação de campos e otimizações de performance
  - _Requirements: 1.1, 4.1, 6.1, 7.1_

- [ ] 2. Criar API route para buscar dados de promoções
  - Implementar /api/reports/promotions seguindo padrão das outras APIs
  - Adicionar autenticação via cookie ps_session
  - Implementar busca de usuário na tabela users
  - Configurar filtro por empresa/rede na tabela de promoções
  - Adicionar tratamento de erros estruturado
  - _Requirements: 1.1, 4.2, 6.2, 6.3_

- [ ] 3. Criar API route para gerar PDF de promoções
  - Implementar /api/reports/promotions/pdf
  - Configurar geração de PDF com dados de promoções
  - Adicionar fallback HTML caso Puppeteer falhe
  - Implementar mesmo padrão de resposta das outras APIs
  - _Requirements: 4.4_

- [ ] 4. Implementar sistema de configurações isolado para promoções
  - Adicionar estados para configurações de promoções na página
  - Implementar funções de salvar/carregar/excluir específicas para promoções
  - Configurar sufixo "(Promoções)" automático ao salvar
  - Implementar filtro para mostrar apenas configurações de promoções
  - _Requirements: 2.1, 2.2, 2.3, 5.1_

- [ ] 5. Corrigir filtros de configuração do card de aniversários
  - Modificar filtro para mostrar apenas configurações "(Aniversários)"
  - Excluir configurações de outros tipos da lista
  - Validar tipo de configuração ao carregar
  - Garantir sufixo correto ao salvar
  - _Requirements: 3.1, 3.2, 3.3, 5.2_

- [ ] 6. Conectar modal de promoções com as APIs
  - Atualizar fetchData no modal para chamar /api/reports/promotions
  - Atualizar handleGeneratePdf para chamar /api/reports/promotions/pdf
  - Configurar tratamento de erros específico para promoções
  - Implementar loading states e retry automático
  - _Requirements: 1.2, 1.5, 1.6_

- [ ] 7. Implementar validação de acesso e segurança
  - Validar se usuário tem empresa/rede definida
  - Implementar filtro obrigatório por empresa nos dados
  - Adicionar validação de campos selecionados
  - Configurar mensagens de erro específicas para cada caso
  - _Requirements: 6.4, 6.5, 6.6_

- [ ] 8. Otimizar performance para grandes volumes de dados
  - Implementar limite de 1000 registros nas queries
  - Configurar ordenação por Data_Envio descendente
  - Adicionar campo Id automaticamente para identificação única
  - Implementar validação de dados por empresa
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Implementar funcionalidade de salvar configuração no card
  - Conectar botão "Salvar" ao modal de salvamento
  - Implementar função handleSavePromotionsConfiguration
  - Configurar validação de campos selecionados
  - Adicionar limite de 10 configurações por usuário
  - _Requirements: 2.1, 2.2_

- [ ] 10. Implementar listagem e gerenciamento de configurações
  - Adicionar seção expansível para configurações salvas
  - Implementar componente SavedConfigurationsList para promoções
  - Configurar funções de carregar e excluir configurações
  - Adicionar tratamento de erros e estados de loading
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 11. Testar integração completa do sistema
  - Testar fluxo completo: seleção de campos → modal → dados → PDF
  - Validar isolamento de configurações entre diferentes cards
  - Testar autenticação e filtros por empresa
  - Verificar performance com dados reais
  - Validar tratamento de erros em todos os cenários
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_