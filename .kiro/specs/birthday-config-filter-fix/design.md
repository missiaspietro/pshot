# Design - Correção do Filtro de Configurações de Aniversários

## Overview

O problema atual é que o card de aniversários está usando o mesmo hook `useFilterConfigurations` que outros cards, mas não está aplicando o filtro correto para separar as configurações por tipo. O sistema precisa ser ajustado para garantir que cada card exiba apenas suas próprias configurações baseado no sufixo do nome.

## Architecture

### Componentes Afetados

1. **ReportsPageContent** (app/reports/page.tsx)
   - Filtro de configurações de aniversários
   - Lógica de carregamento de configurações
   - Validação de tipos de configuração

2. **useFilterConfigurations Hook**
   - Pode precisar de ajustes para melhor suporte a filtros por tipo

### Fluxo de Dados Atual vs Desejado

**Atual (Problemático):**
```
useFilterConfigurations() → allConfigurations → configurations (filtro incorreto)
```

**Desejado (Correto):**
```
useFilterConfigurations() → allConfigurations → configurations (filtro por "(Aniversários)")
```

## Components and Interfaces

### Filtro de Configurações de Aniversários

```typescript
// Filtro atual (incorreto)
const configurations = allConfigurations.filter(config =>
  config.name.includes('(Aniversários)') || !config.name.includes('(Cashback)')
)

// Filtro correto (desejado)
const configurations = allConfigurations.filter(config =>
  config.name.includes('(Aniversários)')
)
```

### Validação de Configurações

```typescript
const handleLoadConfiguration = (config: FilterConfiguration) => {
  // Verificar se é uma configuração de aniversários
  if (!config.name.includes('(Aniversários)')) {
    console.warn('Tentativa de carregar configuração de tipo incorreto na seção de aniversários:', config)
    return
  }
  // ... resto da lógica
}
```

## Data Models

### FilterConfiguration Interface
```typescript
interface FilterConfiguration {
  id: string
  name: string // Deve conter "(Aniversários)" para configurações de aniversários
  selectedFields: string[]
  type: 'birthday' | 'cashback' | 'survey' | 'promotions'
  // ... outros campos
}
```

### Tipos de Configuração por Sufixo
- **Aniversários**: `"(Aniversários)"`
- **Cashback**: `"(Cashback)"`
- **Pesquisas**: `"(Pesquisas)"`
- **Promoções**: `"(Promoções)"` (futuro)

## Error Handling

### Validação de Tipo de Configuração
```typescript
const validateConfigurationType = (config: FilterConfiguration, expectedType: string): boolean => {
  return config.name.includes(expectedType)
}
```

### Tratamento de Configurações Incompatíveis
- Log de warning quando configuração incompatível é detectada
- Prevenção de carregamento de configurações incorretas
- Mensagens de erro claras para o usuário

## Testing Strategy

### Cenários de Teste

1. **Filtro Correto de Configurações**
   - Verificar que apenas configurações com "(Aniversários)" são exibidas
   - Confirmar que configurações de outros tipos são filtradas

2. **Carregamento de Configurações**
   - Testar carregamento de configuração válida de aniversários
   - Testar rejeição de configuração de tipo incorreto

3. **Salvamento de Configurações**
   - Verificar que novas configurações recebem o sufixo correto
   - Confirmar que configurações são salvas com tipo correto

4. **Exclusão de Configurações**
   - Testar exclusão apenas de configurações do tipo correto
   - Verificar que configurações de outros tipos não são afetadas

## Implementation Notes

### Prioridades de Implementação

1. **Alta Prioridade**: Corrigir filtro de configurações de aniversários
2. **Média Prioridade**: Adicionar validação de tipo ao carregar configurações
3. **Baixa Prioridade**: Melhorar mensagens de erro e logging

### Considerações de Compatibilidade

- Manter compatibilidade com configurações existentes
- Não quebrar funcionalidade de outros cards
- Preservar dados de configurações já salvas

### Performance

- Filtros são aplicados em memória (dados já carregados)
- Impacto mínimo na performance
- Operações de filtro são O(n) onde n é o número de configurações