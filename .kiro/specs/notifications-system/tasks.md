# Implementation Plan

- [x] 1. Localizar e analisar o elemento campainha existente



  - Encontrar o ícone de campainha no código do dashboard
  - Analisar a estrutura atual do header/navbar
  - Identificar onde implementar a funcionalidade
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Criar estrutura de dados e estados para notificações


  - Definir interface TypeScript para Notificacao
  - Criar estados: notificacoes, isLoading, unreadCount, isDropdownOpen
  - Implementar estado inicial vazio
  - _Requirements: 2.1, 4.4_

- [x] 3. Implementar função para buscar notificações do Supabase


  - Criar função fetchNotifications com filtros por empresa e email
  - Implementar query com ordenação por created_at descendente
  - Adicionar tratamento de erros e loading
  - Conectar aos estados do componente
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implementar badge de contador no ícone da campainha


  - Calcular quantidade de notificações não lidas
  - Adicionar badge visual com contador
  - Mostrar/ocultar badge baseado na quantidade
  - Aplicar estilos visuais (vermelho, posicionamento)
  - _Requirements: 1.2, 1.3, 4.4_

- [x] 5. Criar dropdown de notificações


  - Implementar componente dropdown que abre/fecha ao clicar
  - Listar notificações com texto, remetente e data
  - Mostrar mensagem "Nenhuma notificação" quando vazio
  - Aplicar estilos visuais e responsividade
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implementar diferenciação visual entre lidas/não lidas


  - Destacar notificações com status_leitura = 'nao'
  - Aplicar estilo normal para status_leitura = 'sim'
  - Implementar cores e indicadores visuais
  - _Requirements: 4.1, 4.2_



- [ ] 7. Implementar funcionalidade de marcar como lida
  - Criar função para atualizar status_leitura no Supabase
  - Implementar clique na notificação para marcar como lida
  - Atualizar estado local após marcação
  - Atualizar contador do badge automaticamente
  - _Requirements: 4.3, 4.4_


- [-] 8. Implementar atualizações automáticas

  - Criar polling para verificar novas notificações (30s)
  - Implementar useEffect para buscar notificações iniciais
  - Adicionar cleanup para parar polling ao desmontar
  - Otimizar para não fazer requests desnecessários
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 9. Testar e validar funcionalidade completa

  - Testar com usuário com notificações
  - Testar com usuário sem notificações
  - Validar filtros por empresa e email
  - Verificar atualizações em tempo real
  - Confirmar marcação como lida funciona
  - _Requirements: 1.1-1.3, 2.1-2.4, 3.1-3.4, 4.1-4.4, 5.1-5.4_