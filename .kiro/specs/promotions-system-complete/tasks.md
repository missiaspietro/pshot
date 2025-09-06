# Implementation Plan - Sistema Completo de Relatórios de Promoções

## Seção A: API de Dados de Promoções

- [x] A.1. Criar serviço de dados de promoções


  - Criar arquivo `lib/promotions-report-service.ts` baseado no serviço de cashback
  - Implementar classe `PromotionsReportService` com métodos principais
  - Configurar conexão com tabela "Relatorio Envio de Promoções"
  - Implementar filtros por empresa/rede do usuário
  - _Requirements: 1.1, 1.2, 4.2_


- [ ] A.2. Implementar validação de campos e filtros
  - Validar campos disponíveis na tabela de promoções
  - Implementar filtros de data por campo "Data_Envio"
  - Adicionar validação de segurança para dados da empresa
  - Implementar limite de registros para evitar timeout


  - _Requirements: 1.3, 1.4, 4.3_

- [ ] A.3. Criar API route para buscar dados de promoções
  - Criar arquivo `app/api/reports/promotions/route.ts`
  - Implementar autenticação via sessão/cookie
  - Integrar com PromotionsReportService
  - Implementar tratamento de erros padronizado
  - _Requirements: 1.1, 1.5, 4.1, 4.4_

- [ ] A.4. Testar API de dados com dados reais
  - Verificar filtro por empresa do usuário
  - Testar filtros de data e campos selecionados
  - Validar tratamento de erros de autenticação
  - Confirmar formato de resposta consistente


  - _Requirements: 1.1, 1.2, 1.3, 1.4_

## Seção B: Geração de PDF de Promoções

- [ ] B.1. Criar serviço de PDF de promoções
  - Criar arquivo `lib/promotions-pdf-service.ts` baseado no serviço de aniversários
  - Implementar template HTML para promoções
  - Configurar Puppeteer para geração de PDF
  - Implementar fallback para HTML se PDF falhar
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] B.2. Criar API route para gerar PDF
  - Criar arquivo `app/api/reports/promotions/pdf/route.ts`
  - Integrar com PromotionsPdfService
  - Implementar validação de dados de entrada
  - Configurar headers apropriados para PDF
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] B.3. Integrar geração de PDF com modal
  - Atualizar modal para chamar API de PDF correta
  - Implementar tratamento de erros de geração
  - Configurar abertura de PDF em nova aba
  - Desabilitar botão quando não há dados
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ] B.4. Testar geração de PDF completa
  - Verificar geração com dados reais
  - Testar fallback para HTML
  - Validar template e formatação
  - Confirmar abertura em nova aba
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

## Seção C: Sistema de Configurações Criptografadas

- [ ] C.1. Implementar sistema de configurações para promoções
  - Adicionar estados para configurações de promoções na página
  - Implementar hook useFilterConfigurations para promoções
  - Configurar filtro por sufixo "(Promoções)"
  - Adicionar validação de tipo de configuração
  - _Requirements: 3.2, 3.4, 5.3_

- [ ] C.2. Implementar funções de salvamento criptografado
  - Criar função handleSavePromotionsConfiguration
  - Implementar criptografia dos dados antes de salvar
  - Adicionar sufixo "(Promoções)" automaticamente
  - Salvar na coluna config_filtros_relatorios da tabela users
  - _Requirements: 3.1, 3.2, 5.3_

- [ ] C.3. Implementar funções de carregamento e exclusão
  - Criar função handleLoadPromotionsConfiguration
  - Implementar descriptografia ao carregar configurações
  - Criar função handleDeletePromotionsConfiguration com validação
  - Adicionar logs de debug para configurações
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] C.4. Integrar sistema de configurações com UI
  - Conectar botões de salvar/carregar com as funções
  - Implementar lista de configurações salvas
  - Adicionar modal de salvamento de configurações
  - Testar fluxo completo de configurações
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

## Seção D: Integração e Testes Finais

- [ ] D.1. Conectar modal com APIs reais
  - Atualizar modal para usar API /api/reports/promotions
  - Remover dados mockados e placeholders
  - Implementar tratamento de erros real
  - Configurar loading states apropriados
  - _Requirements: 1.1, 4.1, 5.1_

- [ ] D.2. Implementar validação de permissões
  - Verificar permissão "telaShot_promocoes" nas APIs
  - Implementar filtro por empresa do usuário logado
  - Adicionar validação de acesso aos dados
  - Testar com diferentes tipos de usuários
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] D.3. Testes de integração completos
  - Testar fluxo completo: modal → dados → PDF
  - Verificar configurações: salvar → carregar → aplicar
  - Validar consistência com outros relatórios
  - Testar tratamento de erros em todos os cenários
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] D.4. Otimizações e ajustes finais
  - Implementar cache para melhor performance
  - Otimizar queries para tabelas grandes
  - Adicionar logs detalhados para debug
  - Verificar compatibilidade com sistema existente
  - _Requirements: 5.1, 5.2, 5.4, 5.5_