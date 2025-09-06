# Design Document

## Overview

Este documento define o design do sistema de notificações que será implementado no elemento em formato de campainha no canto superior da tela. O sistema conectará à tabela `notificacoes` do Supabase para buscar e exibir notificações personalizadas para cada usuário.

## Architecture

### Localização do Componente

O ícone de campainha está localizado no canto superior direito da tela, provavelmente no header/navbar do dashboard.

### Estrutura de Dados

```typescript
interface Notificacao {
  id: number
  created_at: string
  empresa: string | null
  texto: string | null
  usuario: string | null
  status_leitura: string | null // 'sim' | 'nao'
  sistema: string | null
  remetente: string | null // default: 'Praise Tecnologia'
  ministerio: string | null
  email_destinatario: string | null
}

interface NotificationState {
  notificacoes: Notificacao[]
  isLoading: boolean
  unreadCount: number
  isDropdownOpen: boolean
}
```

## Components and Interfaces

### Componente Principal - NotificationBell

```typescript
interface NotificationBellProps {
  user: User // usuário logado com empresa e email
}
```

### Componente Dropdown - NotificationDropdown

```typescript
interface NotificationDropdownProps {
  notificacoes: Notificacao[]
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: number) => void
}
```

### Componente Item - NotificationItem

```typescript
interface NotificationItemProps {
  notificacao: Notificacao
  onMarkAsRead: (id: number) => void
}
```

## Data Models

### Query Supabase

```typescript
const { data, error } = await supabase
  .from('notificacoes')
  .select('*')
  .eq('empresa', user.empresa)
  .eq('email_destinatario', user.email)
  .order('created_at', { ascending: false })
  .limit(50) // limitar para performance
```

### Atualização de Status

```typescript
const { error } = await supabase
  .from('notificacoes')
  .update({ status_leitura: 'sim' })
  .eq('id', notificationId)
```

## Error Handling

### Estados de Erro

1. **Erro de Conexão**: Mostrar ícone com indicador de erro
2. **Sem Permissões**: Ocultar funcionalidade
3. **Dados Inválidos**: Filtrar notificações malformadas
4. **Falha na Atualização**: Retry automático

### Fallbacks

```typescript
// Fallback para dados ausentes
const texto = notificacao.texto || 'Notificação sem conteúdo'
const remetente = notificacao.remetente || 'Sistema'
const dataFormatada = formatDate(notificacao.created_at) || 'Data inválida'
```

## Testing Strategy

### Casos de Teste

1. **Usuário com notificações**: Badge com contador, dropdown funcional
2. **Usuário sem notificações**: Ícone limpo, mensagem "Nenhuma notificação"
3. **Notificações mistas**: Separação visual entre lidas/não lidas
4. **Atualização em tempo real**: Novas notificações aparecem automaticamente

### Validação de Filtros

1. **Filtro por empresa**: Apenas notificações da empresa do usuário
2. **Filtro por email**: Apenas notificações direcionadas ao usuário
3. **Ordenação**: Mais recentes primeiro
4. **Limite**: Máximo 50 notificações para performance

## Implementation Plan

### Fase 1: Localização e Estrutura Base

1. Localizar o elemento campainha no código
2. Criar estados para notificações
3. Implementar estrutura básica do dropdown

### Fase 2: Conexão com Supabase

1. Criar função para buscar notificações
2. Implementar filtros por empresa e email
3. Adicionar tratamento de erros

### Fase 3: Interface e Interação

1. Implementar dropdown de notificações
2. Adicionar badge com contador
3. Implementar marcação como lida

### Fase 4: Atualizações Automáticas

1. Implementar polling para novas notificações
2. Adicionar cleanup ao desmontar componente
3. Otimizar performance

## Visual Design

### Ícone de Campainha

```css
.notification-bell {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-bell:hover {
  transform: scale(1.1);
}
```

### Badge de Contador

```css
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Dropdown de Notificações

```css
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  z-index: 1000;
}
```

### Item de Notificação

```css
.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item.unread {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
}
```

## Performance Considerations

### Otimizações

1. **Limit de Query**: Máximo 50 notificações
2. **Polling Inteligente**: Apenas quando usuário ativo
3. **Cache Local**: Evitar requests desnecessários
4. **Lazy Loading**: Carregar mais notificações sob demanda

### Cleanup

```typescript
useEffect(() => {
  const interval = setInterval(fetchNotifications, 30000) // 30s
  
  return () => {
    clearInterval(interval)
  }
}, [])
```