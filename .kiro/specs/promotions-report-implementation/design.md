# Design Document

## Overview

Esta implementação cria um sistema completo de relatórios de promoções integrado ao sistema existente, incluindo APIs para buscar dados da tabela "Relatorio Envio de Promoções", sistema de configurações isolado por tipo de relatório, e correções nos filtros existentes.

## Architecture

### API Structure
```
/api/reports/promotions (POST)
├── Autenticação via cookie ps_session
├── Busca usuário na tabela users
├── Filtra dados por empresa/rede na tabela "Relatorio Envio de Promoções"
└── Retorna dados paginados e limitados

/api/reports/promotions/pdf (POST)
├── Recebe dados já filtrados
├── Gera PDF usando mesmo sistema dos outros relatórios
└── Retorna PDF ou HTML fallback
```

### Database Schema
```sql
-- Tabela de usuários (existente)
users {
  email: text (usado para autenticação)
  empresa: text (fallback para filtro)
  rede: text (prioridade para filtro)
  sistema: text (deve ser "Praise Shot")
}

-- Tabela de promoções (existente)
"Relatorio Envio de Promoções" {
  Cliente: text
  Enviado: text
  Obs: text
  Whatsapp: text
  Rede: text (usado para filtrar por empresa)
  Sub_rede: text
  Loja: text
  Id: uuid (PK)
  Data_Envio: date
}
```

## Components and Interfaces

### 1. Promotions Report Service
```typescript
interface PromotionsReportService {
  getPromotionsData(filters: PromotionsReportFilters): Promise<PromotionsData[]>
  validateUserAccess(userEmpresa: string): Promise<boolean>
  validateFilters(filters: PromotionsReportFilters): ValidationResult
}

interface PromotionsReportFilters {
  empresa: string
  selectedFields: string[]
  startDate?: string
  endDate?: string
}

interface PromotionsData {
  Cliente?: string
  Enviado?: string
  Obs?: string
  Whatsapp?: string
  Rede?: string
  Sub_rede?: string
  Loja?: string
  Id: string
  Data_Envio?: string
}
```

### 2. Configuration System Fixes
```typescript
interface ConfigurationFilter {
  filterByType(configs: FilterConfiguration[], type: string): FilterConfiguration[]
  addTypeSuffix(name: string, type: string): string
  validateConfigType(config: FilterConfiguration, expectedType: string): boolean
}

// Tipos de configuração
type ConfigurationType = 'birthday' | 'cashback' | 'survey' | 'promotions'

// Sufixos para identificação
const CONFIG_SUFFIXES = {
  birthday: '(Aniversários)',
  cashback: '(Cashback)', 
  survey: '(Pesquisas)',
  promotions: '(Promoções)'
}
```

### 3. API Routes Structure
```typescript
// /api/reports/promotions/route.ts
interface PromotionsAPIRequest {
  selectedFields: string[]
  startDate?: string
  endDate?: string
}

interface PromotionsAPIResponse {
  success: boolean
  data: PromotionsData[]
  total: number
  userEmpresa: string
  userInfo: UserInfo
  message: string
}

// /api/reports/promotions/pdf/route.ts
interface PromotionsPDFRequest {
  selectedFields: string[]
  startDate: string
  endDate: string
  data: PromotionsData[]
}
```

## Data Models

### User Authentication Flow
1. Extrair email do cookie `ps_session`
2. Buscar usuário na tabela `users` com `email` e `sistema = "Praise Shot"`
3. Determinar empresa: `userData.rede || userData.empresa`
4. Validar se empresa existe
5. Usar empresa para filtrar dados

### Data Filtering Logic
```sql
SELECT [selectedFields]
FROM "Relatorio Envio de Promoções"
WHERE "Rede" = :userEmpresa
  AND ("Data_Envio" >= :startDate OR :startDate IS NULL)
  AND ("Data_Envio" <= :endDate OR :endDate IS NULL)
ORDER BY "Data_Envio" DESC, "Id" DESC
LIMIT 1000
```

### Configuration Isolation
```typescript
// Filtrar configurações por tipo
const birthdayConfigs = allConfigurations.filter(config => 
  config.name.includes('(Aniversários)') && 
  !config.name.includes('(Cashback)') && 
  !config.name.includes('(Pesquisas)') && 
  !config.name.includes('(Promoções)')
)

const promotionsConfigs = allConfigurations.filter(config =>
  config.name.includes('(Promoções)')
)
```

## Error Handling

### API Error Types
```typescript
interface APIError {
  type: 'auth' | 'permission' | 'validation' | 'database' | 'timeout'
  message: string
  code: number
}

// Mapeamento de erros
const ERROR_MAPPING = {
  401: { type: 'auth', message: 'Usuário não autenticado' },
  403: { type: 'permission', message: 'Acesso negado' },
  400: { type: 'validation', message: 'Dados inválidos' },
  500: { type: 'database', message: 'Erro no banco de dados' },
  408: { type: 'timeout', message: 'Tempo limite excedido' }
}
```

### Frontend Error Handling
- Retry automático para erros de rede/timeout
- Mensagens específicas por tipo de erro
- Fallback para casos sem dados
- Loading states durante requisições

## Testing Strategy

### Unit Tests
- Serviço de promoções com mocks
- Filtros de configuração isolados
- Validação de dados de entrada
- Formatação de dados de saída

### Integration Tests
- API endpoints com banco de dados real
- Autenticação via cookie
- Filtros por empresa
- Geração de PDF

### E2E Tests
- Fluxo completo do modal
- Salvamento de configurações
- Carregamento de configurações
- Isolamento entre tipos de relatório

## Performance Considerations

### Database Optimization
- Índices em `Rede` e `Data_Envio`
- Limit de 1000 registros
- Ordenação otimizada
- Campos selecionados dinamicamente

### Frontend Optimization
- Paginação de dados (9 itens por página)
- Lazy loading do modal
- Cache de configurações
- Debounce em filtros

### Memory Management
- Limpeza de URLs de blob após uso
- Garbage collection de dados grandes
- Otimização de re-renders

## Security Measures

### Authentication
- Validação de cookie de sessão
- Verificação de usuário ativo
- Validação de empresa/rede

### Data Access Control
- Filtro obrigatório por empresa
- Validação de campos selecionados
- Sanitização de parâmetros de entrada

### SQL Injection Prevention
- Uso de parâmetros preparados
- Validação de tipos de dados
- Escape de caracteres especiais