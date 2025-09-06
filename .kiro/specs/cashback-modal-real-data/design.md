# Design Document

## Overview

Este documento descreve o design para conectar o modal de relatório de cashbacks aos dados reais da tabela `EnvioCashTemTotal`, removendo os dados mockados e implementando filtros por empresa e período. A solução manterá a interface existente enquanto integra com o banco de dados Supabase.

## Architecture

### Current State
- API `/api/reports/cashback` retorna dados mockados/fixos
- Modal `CashbackPreviewModal` exibe dados estáticos
- Não há filtro por empresa do usuário
- Dados não são filtrados por período real

### Target State
- API conectada ao Supabase para buscar dados da tabela `EnvioCashTemTotal`
- Filtros aplicados por empresa do usuário logado
- Filtros de período funcionais (startDate/endDate)
- Tratamento de erros e estados de loading
- Manutenção da interface existente

### Data Flow
```mermaid
graph TD
    A[User clicks "Ver" button] --> B[CashbackPreviewModal opens]
    B --> C[Modal calls /api/reports/cashback]
    C --> D[API gets user context]
    D --> E[API queries Supabase EnvioCashTemTotal]
    E --> F[Apply filters: empresa + dates]
    F --> G[Return filtered data]
    G --> H[Modal displays data]
    H --> I[User can generate PDF]
```

## Components and Interfaces

### 1. API Route Enhancement (`/api/reports/cashback`)

**Current Interface:**
```typescript
POST /api/reports/cashback
Body: {
  selectedFields: string[]
  startDate: string
  endDate: string
}
```

**Enhanced Implementation:**
- Remove mock data completely
- Add Supabase connection
- Add user authentication/authorization
- Add company filtering
- Add date range filtering
- Maintain same response format for compatibility

### 2. Database Service

**New Service: `lib/cashback-report-service.ts`**
```typescript
interface CashbackReportData {
  Nome?: string
  Whatsapp?: string
  Loja?: string
  Rede_de_loja?: string
  Envio_novo?: string
  Status?: string
  id: string
}

interface CashbackReportFilters {
  empresa: string
  selectedFields: string[]
  startDate?: string
  endDate?: string
}

class CashbackReportService {
  async getCashbackData(filters: CashbackReportFilters): Promise<CashbackReportData[]>
  async validateUserAccess(userEmpresa: string): Promise<boolean>
}
```

### 3. Authentication Integration

**User Context Resolution:**
- Utilize existing `AuthContext` to get user empresa
- Fallback to API-level user resolution if needed
- Ensure empresa field is available for filtering

### 4. Modal Component Updates

**CashbackPreviewModal Enhancements:**
- Maintain existing interface and props
- Improve error handling for real API calls
- Add retry mechanism for failed requests
- Maintain loading states and user feedback

## Data Models

### EnvioCashTemTotal Table Structure
```sql
create table public."EnvioCashTemTotal" (
  "Nome" text null,
  "Whatsapp" text null,
  "Loja" text null,
  "Rede_de_loja" text null,
  "Envio_novo" date null default now(),
  "Status" text null,
  id uuid not null default gen_random_uuid(),
  constraint EnvioCashTemTotal_pkey primary key (id)
) tablespace pg_default;
```

### Field Mapping
- `Nome` → Nome do cliente
- `Whatsapp` → Número do WhatsApp
- `Loja` → Loja associada
- `Rede_de_loja` → Empresa/Rede (filtro principal)
- `Envio_novo` → Data do envio (filtro de período)
- `Status` → Status do envio

### Query Filters
1. **Company Filter:** `Rede_de_loja = user.empresa`
2. **Date Range Filter:** 
   - `Envio_novo >= startDate` (if provided)
   - `Envio_novo <= endDate` (if provided)
3. **Field Selection:** Return only `selectedFields`

## Error Handling

### API Level Errors
- **401 Unauthorized:** User not authenticated
- **403 Forbidden:** User empresa not found
- **400 Bad Request:** Invalid selectedFields or date format
- **500 Internal Server Error:** Database connection issues

### Client Level Errors
- **Network Errors:** Show retry button
- **No Data Found:** Show informative message
- **Loading States:** Show spinner during data fetch
- **Timeout Errors:** Show timeout message with retry option

### Error Messages
```typescript
const ERROR_MESSAGES = {
  NO_AUTH: 'Usuário não autenticado',
  NO_COMPANY: 'Empresa do usuário não encontrada',
  NO_DATA: 'Nenhum dado encontrado para os filtros selecionados',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  TIMEOUT: 'Tempo limite excedido. Tente novamente.',
  UNKNOWN: 'Erro desconhecido. Contate o suporte.'
}
```

## Testing Strategy

### Unit Tests
- `CashbackReportService` methods
- API route with different filter combinations
- Error handling scenarios
- Date filtering logic

### Integration Tests
- End-to-end modal flow
- API + Database integration
- User authentication flow
- Company filtering validation

### Test Data Setup
```sql
-- Test data for different companies
INSERT INTO "EnvioCashTemTotal" ("Nome", "Whatsapp", "Loja", "Rede_de_loja", "Envio_novo", "Status") VALUES
('Test User 1', '11999999999', 'Loja 1', 'Empresa A', '2024-01-15', 'Enviada'),
('Test User 2', '11888888888', 'Loja 2', 'Empresa B', '2024-01-16', 'Enviada'),
('Test User 3', '11777777777', 'Loja 3', 'Empresa A', '2024-01-17', 'Pendente');
```

### Test Scenarios
1. **Happy Path:** User with empresa, valid date range, data exists
2. **No Data:** User with empresa, valid filters, no matching data
3. **No Company:** User without empresa defined
4. **Invalid Dates:** Malformed date strings
5. **Database Error:** Supabase connection failure
6. **Large Dataset:** Performance with many records

## Security Considerations

### Data Access Control
- Always filter by user's empresa
- Never expose data from other companies
- Validate user authentication on every request

### Input Validation
- Sanitize selectedFields array
- Validate date formats (YYYY-MM-DD)
- Prevent SQL injection through parameterized queries

### Rate Limiting
- Consider implementing rate limiting for API calls
- Prevent abuse of data export functionality

## Performance Considerations

### Database Optimization
- Add index on `Rede_de_loja` for company filtering
- Add index on `Envio_novo` for date range queries
- Consider composite index on `(Rede_de_loja, Envio_novo)`

### Query Optimization
```sql
-- Recommended indexes
CREATE INDEX idx_enviocash_rede_data ON "EnvioCashTemTotal" ("Rede_de_loja", "Envio_novo");
CREATE INDEX idx_enviocash_rede ON "EnvioCashTemTotal" ("Rede_de_loja");
```

### Caching Strategy
- Consider caching frequently accessed company data
- Implement client-side caching for repeated queries
- Add cache invalidation for real-time updates

## Migration Strategy

### Phase 1: Backend Changes
1. Create `CashbackReportService`
2. Update API route to use real data
3. Add proper error handling
4. Test with existing frontend

### Phase 2: Frontend Enhancements
1. Improve error handling in modal
2. Add retry mechanisms
3. Update loading states
4. Test end-to-end functionality

### Phase 3: Cleanup
1. Remove all mock data references
2. Update documentation
3. Add monitoring and logging
4. Performance optimization

## Backward Compatibility

### API Response Format
Maintain existing response structure:
```typescript
{
  success: boolean
  data: CashbackReportData[]
  total: number
  message?: string
  error?: string
}
```

### Modal Interface
- Keep all existing props and methods
- Maintain same user interactions
- Preserve PDF generation functionality
- Keep same visual design and layout