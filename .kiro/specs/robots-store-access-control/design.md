# Design Document

## Overview

Este documento descreve o design para implementar controle de acesso baseado em loja na página de robôs. A solução implementará verificação de nível de acesso do usuário e aplicará filtros apropriados tanto no frontend quanto no backend para garantir que usuários não Super Admin vejam apenas robôs da sua loja.

## Architecture

### Current Architecture
- Frontend: `app/robots/page.tsx` - Página principal dos robôs
- Services: `lib/bot-service.ts` - Serviço para buscar robôs por empresa
- Auth: `contexts/auth-context.tsx` - Contexto de autenticação com dados do usuário
- Permissions: `lib/permissions-service.ts` - Serviço de permissões

### Proposed Changes
- Modificar `bot-service.ts` para incluir filtro por loja
- Atualizar `app/robots/page.tsx` para aplicar lógica de controle de acesso
- Implementar verificação de nível de acesso baseada em `access_level`

## Components and Interfaces

### 1. Enhanced Bot Service

**File:** `lib/bot-service.ts`

**New Methods:**
```typescript
// Método existente será mantido para Super Admins
getBotsPorEmpresa(empresa: string): Promise<Bot[]>

// Novo método para usuários com filtro de loja
getBotsPorEmpresaELoja(empresa: string, loja: string): Promise<Bot[]>

// Método utilitário para determinar qual função usar
getBotsByUserAccess(user: User): Promise<Bot[]>
```

**Interface Updates:**
```typescript
interface BotServiceOptions {
  empresa: string
  loja?: string
  isSuperAdmin: boolean
}
```

### 2. Access Control Logic

**Location:** `app/robots/page.tsx`

**Access Level Detection:**
- Super Admin: `user.access_level === 'super_admin'`
- Regular User: Qualquer outro valor de `access_level`

**Filter Logic:**
```typescript
const isSuperAdmin = user?.access_level === 'super_admin'
const userLoja = user?.loja

if (isSuperAdmin) {
  // Usar método existente - todos os robôs da empresa
  bots = await botService.getBotsPorEmpresa(empresa)
} else {
  // Usar novo método - apenas robôs da loja do usuário
  if (userLoja) {
    bots = await botService.getBotsPorEmpresaELoja(empresa, userLoja)
  } else {
    bots = [] // Usuário sem loja definida
  }
}
```

### 3. User Interface Updates

**Statistics Cards:**
- Manter os mesmos componentes visuais
- Atualizar cálculos para refletir apenas robôs visíveis
- Adicionar mensagem explicativa quando não há robôs

**Robot List:**
- Manter layout atual
- Exibir mensagem específica para usuários sem loja
- Manter funcionalidades de QR Code apenas para robôs visíveis

## Data Models

### User Model (Existing)
```typescript
type User = {
  id: number
  name: string
  email: string
  access_level: string  // 'super_admin' | 'admin' | 'user' | etc.
  empresa?: string
  loja?: string        // Campo usado para filtro
  // ... outros campos
}
```

### Bot Model (Existing)
```typescript
interface Bot {
  id: string
  nome: string
  rede?: string        // Usado para filtro por empresa
  loja: string         // Usado para filtro por loja
  status?: string
  // ... outros campos
}
```

## Error Handling

### 1. User Without Store
**Scenario:** Usuário não Super Admin sem loja definida
**Handling:** 
- Exibir lista vazia
- Mostrar mensagem: "Nenhum robô encontrado. Entre em contato com o administrador para configurar sua loja."

### 2. Database Errors
**Scenario:** Erro ao buscar robôs
**Handling:**
- Manter tratamento de erro existente
- Log detalhado para debugging
- Toast de erro para usuário

### 3. Permission Validation
**Scenario:** Verificação de acesso
**Handling:**
- Validar `access_level` antes de aplicar filtros
- Fallback para comportamento mais restritivo em caso de dúvida

## Testing Strategy

### 1. Unit Tests
- Testar `getBotsPorEmpresaELoja` com diferentes combinações de empresa/loja
- Testar `getBotsByUserAccess` com diferentes tipos de usuário
- Testar lógica de determinação de Super Admin

### 2. Integration Tests
- Testar fluxo completo para Super Admin
- Testar fluxo completo para usuário regular com loja
- Testar fluxo para usuário regular sem loja
- Testar estatísticas com diferentes conjuntos de dados

### 3. Security Tests
- Verificar que usuários não Super Admin não conseguem ver robôs de outras lojas
- Testar tentativas de bypass através de manipulação de parâmetros
- Validar que filtros são aplicados corretamente no backend

## Implementation Considerations

### 1. Backward Compatibility
- Manter método `getBotsPorEmpresa` existente para Super Admins
- Não alterar estrutura de dados existente
- Preservar funcionalidades atuais

### 2. Performance
- Filtros aplicados no nível de banco de dados
- Evitar filtros no frontend para grandes volumes
- Manter cache de dados do usuário

### 3. Security
- Validação de acesso no backend
- Não confiar apenas em filtros frontend
- Log de acessos para auditoria

### 4. User Experience
- Mensagens claras para diferentes cenários
- Manter interface consistente
- Feedback adequado para casos de erro