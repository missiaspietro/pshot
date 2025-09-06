# Design Document

## Overview

Esta funcionalidade adiciona uma seção de configuração expansível ao card "Relatório de Aniversários", permitindo personalização de campos e aplicação de filtros. A interface será integrada diretamente no card existente, mantendo a consistência visual com o design atual.

## Architecture

### Component Structure
```
BirthdayReportCard
├── CardHeader (existing)
├── ReportConfigurationSection (new)
│   ├── FieldSelectionGroup
│   ├── InvalidNumbersFilter
│   └── BotStatusFilter
├── InsightsSection (modified)
└── ActionButtons (existing)
```

### State Management
- Utilizar React useState para gerenciar configurações locais
- Estados principais:
  - `selectedFields`: array de campos selecionados
  - `invalidNumbersFilter`: string com opção selecionada
  - `botStatusFilter`: string com opção selecionada
  - `isConfigExpanded`: boolean para controlar visibilidade

## Components and Interfaces

### ReportConfigurationSection
```typescript
interface ReportConfig {
  selectedFields: string[]
  invalidNumbersFilter: 'all' | 'valid' | 'invalid'
  botStatusFilter: 'all' | 'connected' | 'disconnected' | 'sent' | 'not_sent'
}

interface ReportConfigurationProps {
  config: ReportConfig
  onConfigChange: (config: ReportConfig) => void
  isExpanded: boolean
}
```

### FieldSelectionGroup
```typescript
interface FieldOption {
  id: string
  label: string
  description?: string
}

const AVAILABLE_FIELDS: FieldOption[] = [
  { id: 'name', label: 'Nome', description: 'Nome completo do cliente' },
  { id: 'birthdate', label: 'Data de Nascimento' },
  { id: 'phone', label: 'Telefone' },
  { id: 'email', label: 'Email' },
  { id: 'send_status', label: 'Status de Envio' },
  { id: 'send_date', label: 'Data de Envio' }
]
```

## Data Models

### ReportFilters
```typescript
interface ReportFilters {
  fields: string[]
  invalidNumbers: 'all' | 'valid' | 'invalid'
  botStatus: 'all' | 'connected' | 'disconnected' | 'sent' | 'not_sent'
}
```

### FilteredInsights
```typescript
interface FilteredInsights {
  conversionRate: number
  averagePaymentTime: number
  averageInvoiceValue: number
  totalRecords: number
  filteredRecords: number
}
```

## Error Handling

### Validation Rules
1. **Campo Selection**: Pelo menos um campo deve estar selecionado
2. **Filter Conflicts**: Validar combinações de filtros que podem resultar em zero registros
3. **Data Availability**: Verificar se existem dados para os filtros selecionados

### Error States
- Exibir mensagem quando nenhum campo está selecionado
- Mostrar aviso quando filtros resultam em zero registros
- Feedback visual para estados de carregamento

## Testing Strategy

### Unit Tests
- Testar seleção/deseleção de campos
- Validar aplicação de filtros
- Verificar cálculo de insights filtrados
- Testar estados de erro

### Integration Tests
- Testar integração com componentes existentes
- Validar persistência de configurações
- Testar responsividade em diferentes tamanhos de tela

### E2E Tests
- Fluxo completo de configuração e geração de relatório
- Testar combinações de filtros
- Validar exportação com configurações personalizadas

## Implementation Details

### UI Components Needed
- Checkbox component (usar existente ou criar)
- Select/Dropdown component (usar existente)
- Toggle/Switch component para expandir configurações
- Loading states para insights dinâmicos

### Styling Approach
- Manter consistência com design system existente
- Usar Tailwind classes existentes
- Adicionar animações suaves para expansão/colapso
- Garantir acessibilidade com ARIA labels

### Performance Considerations
- Debounce para atualizações de insights (300ms)
- Memoização de cálculos de filtros
- Lazy loading de dados quando configurações mudam
- Otimizar re-renders com React.memo quando apropriado