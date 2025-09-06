# Implementation Plan - Tarefas Restantes do Dashboard

## Visão Geral

Este plano consolida todas as tarefas restantes do sistema de dashboard, organizadas por prioridade e dependências. Cada tarefa deve ser executada individualmente, sem misturar implementações.

## Tarefas Prioritárias

### PRIORIDADE 1: Correção do Filtro de Configurações de Aniversários

- [ ] 1. Corrigir filtro de configurações de aniversários
  - Localizar e corrigir o filtro que está puxando configurações de pesquisas
  - Implementar filtro correto para mostrar apenas configurações com "(Aniversários)"
  - Adicionar validação de tipo na função de carregamento
  - Testar correção com dados reais
  - _Spec: birthday-config-filter-fix_
  - _Requirements: Filtro deve mostrar apenas configurações de aniversários_

### PRIORIDADE 2: Rota PDF para Promoções

- [ ] 2. Criar rota PDF para relatório de promoções
  - Criar arquivo `app/api/reports/promotions/pdf/route.ts`
  - Implementar serviço `lib/promotions-pdf-service.ts`
  - Adicionar autenticação e autorização por empresa
  - Implementar template HTML com tema amarelo
  - Configurar Puppeteer com fallback HTML
  - _Spec: promotions-pdf-route_
  - _Requirements: Gerar PDFs profissionais de promoções_

### PRIORIDADE 3: Sistema de Configurações para Promoções (CRÍTICO - BOTÃO QUEBRADO)

- [ ] 3. **CORRIGIR BOTÃO "SALVAR CONFIGURAÇÃO" DE PROMOÇÕES**
  - **PROBLEMA:** Botão existe mas não funciona (apenas comentário TODO no onClick)
  - **SINTOMA:** Modal de salvamento não abre quando clicado
  - Substituir `{/* TODO: Implementar quando necessário */ }` por função real
  - Adicionar estado `isPromotionsSaveModalOpen` que está faltando
  - Conectar botão ao modal de salvamento existente
  - _Spec: promotions-configuration-system, Task 1_
  - _Requirements: URGENTE - Funcionalidade básica quebrada_

- [ ] 3.1. Implementar sistema completo de configurações para promoções
  - Adicionar hooks para configurações de promoções
  - Implementar funções de salvar/carregar/excluir configurações
  - Integrar lista de configurações salvas
  - Implementar validação e segurança
  - _Spec: promotions-configuration-system, Tasks 2-13_
  - _Requirements: Salvar configurações criptografadas com sufixo "(Promoções)"_

## Tarefas Secundárias (Specs Existentes)

### Correções de Texto e Layout

- [ ] 4. Corrigir texto do gráfico de bots conectados
  - Corrigir "conexé£o" para "conexão"
  - _Spec: dashboard-text-corrections-2, Task 3_

- [ ] 5. Adicionar título dinâmico ao primeiro gráfico de cashback
  - Implementar lógica para mostrar "1 mês", "2 meses", "3 meses"
  - _Spec: dashboard-text-corrections-2, Task 4_

- [ ] 6. Corrigir texto do período de pesquisa
  - Corrigir "Peré­odo" para "Período"
  - _Spec: dashboard-text-corrections-2, Task 5_

### Sistema de Notificações

- [ ] 7. Implementar funcionalidade de marcar como lida
  - Criar função para atualizar status_leitura no Supabase
  - Implementar clique na notificação para marcar como lida
  - _Spec: notifications-system, Task 7_

- [ ] 8. Implementar atualizações automáticas
  - Criar polling para verificar novas notificações (30s)
  - Implementar useEffect para buscar notificações iniciais
  - _Spec: notifications-system, Task 8_

### Filtros de Resposta de Pesquisa

- [ ] 9. Implementar response filter logic na API
  - Atualizar survey API route para aceitar responseFilter
  - Adicionar SQL WHERE clause para filtrar por valores (1-4)
  - _Spec: survey-response-filter-improvements, Task 2_

- [ ] 10. Atualizar survey preview modal com filtros
  - Modificar SurveyPreviewModal para exibir dados filtrados
  - Adicionar indicador visual quando filtro estiver ativo
  - _Spec: survey-response-filter-improvements, Task 3_

### Layout Responsivo para PDFs

- [ ] 11. Implementar sistema de detecção de colunas para aniversários
  - Criar função detectLayout() para aniversários
  - Implementar thresholds específicos (> 6 = larga, > 8 = muito larga)
  - _Spec: pdf-responsive-layout, Task 2_

- [ ] 12. Implementar cálculo de estilos responsivos
  - Criar função calculateStyles() para aniversários e cashback
  - Implementar lógica condicional de fontes e padding
  - _Spec: pdf-responsive-layout, Tasks 3-4_

## Ordem de Execução Recomendada

### Semana 1: Correções Críticas
1. **Correção do Filtro de Configurações de Aniversários** (PRIORIDADE 1)
2. **Correções de Texto Simples** (Tasks 4, 5, 6)

### Semana 2: Funcionalidades de Promoções
3. **CORREÇÃO CRÍTICA: Botão Salvar Configuração de Promoções** (PRIORIDADE 3 - URGENTE)
4. **Rota PDF para Promoções** (PRIORIDADE 2)
5. **Sistema Completo de Configurações para Promoções** (PRIORIDADE 3)

### Semana 3: Melhorias de Sistema
5. **Sistema de Notificações Completo** (Tasks 7, 8)
6. **Filtros de Resposta de Pesquisa** (Tasks 9, 10)

### Semana 4: Otimizações
7. **Layout Responsivo para PDFs** (Tasks 11, 12)

## Critérios de Aceitação Gerais

### Para Cada Tarefa:
- [ ] Implementação completa sem quebrar funcionalidades existentes
- [ ] Testes unitários quando aplicável
- [ ] Logs de debug para troubleshooting
- [ ] Documentação de mudanças significativas
- [ ] Validação com dados reais

### Para Specs Completos:
- [ ] Todos os requisitos atendidos
- [ ] Integração testada end-to-end
- [ ] Performance adequada
- [ ] Tratamento de erros robusto
- [ ] Experiência do usuário validada

## Notas Importantes

1. **NÃO MISTURAR TAREFAS**: Cada tarefa deve ser implementada e testada individualmente
2. **TESTAR COM DADOS REAIS**: Sempre validar com dados do ambiente de produção
3. **MANTER COMPATIBILIDADE**: Não quebrar funcionalidades existentes
4. **SEGUIR PADRÕES**: Usar mesma estrutura e padrões dos componentes existentes
5. **DOCUMENTAR MUDANÇAS**: Registrar alterações significativas para referência futura