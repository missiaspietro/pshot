# Design Document

## Overview

Este documento descreve o design para corrigir os contadores dos cards "Pesquisas" e "Promoções" no dashboard, implementando consultas reais às tabelas `pesquisas_enviadas` e `promocoes` filtradas pela empresa do usuário logado.

## Architecture

### Current Implementation Analysis

O dashboard atual (`app/dashboard/page.tsx`) possui:

1. **Card "Relatório de Pesquisas"**: Atualmente usa `respostasPesquisasStats?.totalRespostas` do serviço `respostas-pesquisas-service`
2. **Card "Promoções"**: Usa `fetchPromocaoCount()` que consulta a tabela `promocoes` com filtro por `Rede`
3. **User Context**: Obtém dados do usuário logado através do `useAuth()` hook

### Proposed Changes

1. **Rename Card**: "Relatório de Pesquisas" → "Pesquisas"
2. **New Service Functions**: Criar funções específicas para contar registros das tabelas corretas
3. **Database Queries**: Implementar consultas diretas às tabelas com filtro por empresa

## Components and Interfaces

### 1. Dashboard Page Updates

**File**: `app/dashboard/page.tsx`

**Changes**:
- Update `statsData[1].title` from "Relatório de Pesquisas" to "Pesquisas"
- Replace current pesquisas counter logic with new service call
- Update promoções counter to use correct table and filter

### 2. New Service Functions

**File**: `lib/dashboard-counters-service.ts` (new file)

```typescript
interface CounterResult {
  count: number;
}

export async function getPesquisasEnviadasCount(empresa: string): Promise<number>
export async function getPromocoesCount(empresa: string): Promise<number>
```

### 3. Database Queries

**Pesquisas Enviadas Query**:
```sql
SELECT COUNT(*) FROM pesquisas_enviadas 
WHERE rede = $empresa
```

**Promoções Query**:
```sql
SELECT COUNT(*) FROM promocoes 
WHERE "Rede" = $empresa
```

## Data Models

### Input Data
- `empresa: string` - Campo empresa do usuário logado obtido via `user.empresa`

### Output Data
- `pesquisasCount: number` - Total de registros na tabela pesquisas_enviadas
- `promocoesCount: number` - Total de registros na tabela promocoes

### Error Handling
- Return `0` when empresa is not available
- Return `0` when database query fails
- Log errors to console for debugging
- Display loading state during queries

## Error Handling

### Error Scenarios
1. **User not authenticated**: Display `0` in counters
2. **Missing empresa field**: Display `0` in counters  
3. **Database connection error**: Display `0` and log error
4. **Query timeout**: Retry once, then display `0`
5. **Invalid response**: Display `0` and log error

### Error Recovery
- Implement retry mechanism with exponential backoff
- Cache successful results for 5 minutes
- Graceful degradation to `0` values

## Testing Strategy

### Unit Tests
1. Test service functions with valid empresa
2. Test service functions with invalid/empty empresa
3. Test error handling scenarios
4. Test database query formatting

### Integration Tests
1. Test dashboard card updates with real data
2. Test user authentication integration
3. Test loading states and error states

### E2E Tests
1. Test complete user flow from login to dashboard
2. Test card values update correctly
3. Test different user companies show different counts

## Implementation Details

### Database Connection
- Use existing Supabase client configuration
- Reuse authentication headers from current implementation
- Follow existing error handling patterns

### Performance Considerations
- Use `HEAD` requests with `Prefer: count=planned` for counting
- Implement caching to avoid repeated queries
- Execute both queries in parallel using `Promise.all()`

### State Management
- Update existing state variables: `promocaoCount`
- Add new state variable: `pesquisasEnviadasCount`
- Maintain loading states for better UX

### API Integration
- Follow existing Supabase REST API patterns
- Use same authentication tokens as current implementation
- Maintain consistent error handling approach