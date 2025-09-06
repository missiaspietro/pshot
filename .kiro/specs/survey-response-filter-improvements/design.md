# Design Document

## Overview

Esta funcionalidade implementa um sistema de filtro robusto para respostas de pesquisas de satisfação, corrigindo problemas de layout do dropdown e adicionando lógica de filtro real que afeta os dados exibidos nos relatórios. O design foca em uma experiência de usuário fluida com feedback visual claro e integração completa com o sistema existente.

## Architecture

### Componentes Principais

1. **SurveyResponseDropdown** - Componente de interface melhorado
2. **Survey API Routes** - Endpoints que processam filtros
3. **Survey Preview Modal** - Modal que exibe dados filtrados
4. **Configuration System** - Sistema que persiste filtros
5. **Export Services** - Serviços que aplicam filtros nas exportações

### Fluxo de Dados

```
User Selection → Dropdown State → API Request → Filtered Data → UI Update
                      ↓
                Configuration Save → Persistent Storage
```

## Components and Interfaces

### 1. Enhanced SurveyResponseDropdown Component

**Localização:** `components/ui/survey-response-dropdown.tsx`

**Melhorias de Layout:**
- Largura dinâmica com `min-width` e `max-width` apropriados
- Altura fixa para evitar "quadrado"
- Expansão horizontal para textos longos
- Truncamento inteligente com tooltip para textos muito longos

**Props Interface:**
```typescript
interface SurveyResponseDropdownProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  showActiveIndicator?: boolean // Nova prop para mostrar filtro ativo
}
```

**Estilos CSS Melhorados:**
```css
.dropdown-button {
  min-width: 120px;
  max-width: 200px;
  height: 32px; /* Altura fixa */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-expanded {
  width: auto;
  min-width: 160px;
}
```

### 2. API Route Enhancements

**Localização:** `app/api/reports/survey/route.ts`

**Filtro de Resposta:**
```typescript
interface SurveyReportRequest {
  selectedFields: string[]
  startDate?: string
  endDate?: string
  responseFilter?: string // "1", "2", "3", "4", ou "" para todas
}

// Lógica de filtro SQL
const buildWhereClause = (responseFilter: string) => {
  if (!responseFilter) return ""
  return `AND resposta = ${responseFilter}`
}
```

**Mapeamento de Valores:**
- "" (vazio) = Todas as respostas
- "1" = Apenas ótimas
- "2" = Apenas boas  
- "3" = Apenas regulares
- "4" = Apenas péssimas

### 3. Survey Preview Modal Updates

**Localização:** `components/ui/survey-preview-modal.tsx`

**Novas Funcionalidades:**
- Indicador visual de filtro ativo
- Contagem de registros filtrados
- Mensagem quando não há dados
- Botão para limpar filtro

**Interface:**
```typescript
interface SurveyPreviewModalProps {
  // ... props existentes
  responseFilter: string
  onResponseFilterChange: (filter: string) => void
  filteredCount?: number
  totalCount?: number
}
```

### 4. Configuration System Integration

**Localização:** `lib/filter-config-encryption.ts`

**Interface Atualizada:**
```typescript
interface FilterConfiguration {
  // ... campos existentes
  responseFilter?: string // Novo campo para persistir filtro
}
```

## Data Models

### Response Filter Mapping

```typescript
const RESPONSE_FILTER_MAP = {
  "": "Todas",
  "1": "Apenas ótimas", 
  "2": "Apenas boas",
  "3": "Apenas regulares",
  "4": "Apenas péssimas"
} as const

type ResponseFilterValue = keyof typeof RESPONSE_FILTER_MAP
```

### Database Query Structure

```sql
SELECT [campos_selecionados]
FROM respostas_pesquisas rp
JOIN [outras_tabelas] ON [joins_necessarios]
WHERE 1=1
  [AND data_de_envio >= ?]
  [AND data_de_envio <= ?]
  [AND resposta = ?] -- Novo filtro
ORDER BY data_de_envio DESC
```

## Error Handling

### 1. Filtro Sem Resultados
- Detectar quando query retorna 0 registros
- Mostrar mensagem: "Nenhum registro encontrado para este filtro no período selecionado"
- Sugerir ações: expandir período ou remover filtro

### 2. Erro de API
- Capturar erros de SQL/conexão
- Fallback para "Todas" em caso de erro
- Log detalhado para debugging

### 3. Validação de Entrada
- Validar valores de filtro (apenas "1", "2", "3", "4", "")
- Sanitizar entrada para prevenir SQL injection
- Validar combinação de filtros

## Testing Strategy

### 1. Unit Tests

**Dropdown Component:**
```typescript
describe('SurveyResponseDropdown', () => {
  test('maintains fixed height with long text')
  test('expands horizontally when needed')
  test('shows active indicator when filtered')
  test('truncates very long text with tooltip')
})
```

**API Route:**
```typescript
describe('Survey API with Response Filter', () => {
  test('filters by response value 1 (ótimas)')
  test('filters by response value 2 (boas)')
  test('returns all when filter is empty')
  test('handles invalid filter values')
})
```

### 2. Integration Tests

**End-to-End Filter Flow:**
```typescript
describe('Survey Filter Integration', () => {
  test('dropdown selection updates modal data')
  test('filter persists in saved configurations')
  test('export includes filtered data only')
  test('filter indicator shows/hides correctly')
})
```

### 3. Visual Regression Tests

**Layout Consistency:**
- Screenshots do dropdown em diferentes estados
- Verificação de altura fixa
- Teste de responsividade

## Performance Considerations

### 1. Database Optimization
- Índice na coluna `resposta` para filtros rápidos
- Query otimizada para evitar full table scans
- Limit/offset para paginação se necessário

### 2. Frontend Optimization
- Debounce em mudanças de filtro (300ms)
- Cache de resultados para filtros recentes
- Lazy loading do modal com dados filtrados

### 3. Memory Management
- Cleanup de event listeners no dropdown
- Garbage collection de dados filtrados antigos
- Otimização de re-renders desnecessários

## Security Considerations

### 1. Input Validation
- Whitelist de valores permitidos para responseFilter
- Sanitização de todos os parâmetros de entrada
- Validação de tipos TypeScript

### 2. SQL Injection Prevention
- Uso de prepared statements
- Validação rigorosa de parâmetros
- Escape de caracteres especiais

### 3. Access Control
- Verificação de permissões antes de aplicar filtros
- Log de ações de filtro para auditoria
- Rate limiting em requests de filtro