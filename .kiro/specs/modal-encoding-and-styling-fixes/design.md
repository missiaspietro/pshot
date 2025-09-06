# Design Document

## Overview

Este documento descreve a solução para corrigir problemas de codificação de caracteres e estilização dos cabeçalhos nos modais de preview.

## Architecture

### Problema 1: Codificação de Caracteres
- **Causa:** Dados do banco podem estar com codificação incorreta ou sendo corrompidos durante o transporte
- **Solução:** Implementar normalização de texto e garantir UTF-8 em toda a cadeia

### Problema 2: Estilização dos Cabeçalhos
- **Causa:** Cabeçalhos das tabelas usando cor padrão (preta)
- **Solução:** Aplicar classe CSS para cor cinza nos TableHead components

## Components and Interfaces

### 1. Função de Normalização de Texto
```typescript
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return text || ''
  
  // Corrigir caracteres corrompidos comuns
  const corrections: Record<string, string> = {
    'Ã¡': 'á', 'Ã ': 'à', 'Ã¢': 'â', 'Ã£': 'ã',
    'Ã©': 'é', 'Ãª': 'ê', 'Ã­': 'í', 'Ã³': 'ó',
    'Ãµ': 'õ', 'Ãº': 'ú', 'Ã§': 'ç', 'Ã‡': 'Ç',
    'Â': '', '�': '', // Remover caracteres de controle
  }
  
  let normalized = text
  Object.entries(corrections).forEach(([wrong, correct]) => {
    normalized = normalized.replace(new RegExp(wrong, 'g'), correct)
  })
  
  return normalized.trim()
}
```

### 2. Estilização dos Cabeçalhos
```typescript
// Em ambos os modais
<TableHead className="whitespace-nowrap text-gray-600">
  {fieldLabels[field] || field}
</TableHead>
```

## Data Models

### Estrutura de Dados Normalizada
```typescript
interface NormalizedData {
  [key: string]: string | number | null
}

// Aplicar normalização em todos os campos de texto
const normalizeDataRow = (row: any): NormalizedData => {
  const normalized: NormalizedData = {}
  Object.entries(row).forEach(([key, value]) => {
    if (typeof value === 'string') {
      normalized[key] = normalizeText(value)
    } else {
      normalized[key] = value
    }
  })
  return normalized
}
```

## Error Handling

### Tratamento de Erros de Codificação
- Verificar se texto é válido antes de normalizar
- Fallback para string vazia se normalização falhar
- Log de caracteres problemáticos para debug

## Testing Strategy

### Testes de Codificação
1. Testar nomes com acentos comuns (á, é, í, ó, ú, ã, ç)
2. Testar caracteres corrompidos conhecidos
3. Verificar preservação de maiúsculas/minúsculas

### Testes de Estilização
1. Verificar cor cinza nos cabeçalhos
2. Testar consistência entre modais
3. Verificar legibilidade e contraste