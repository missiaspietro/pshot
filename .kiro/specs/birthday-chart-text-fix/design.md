# Design Document

## Overview

O problema está localizado nos componentes XAxis dos gráficos de aniversários no dashboard. Atualmente, um dos gráficos tem `angle={-45}` configurado, fazendo com que o texto apareça na diagonal. A solução é simples: alterar o ângulo para 0 (horizontal) e ajustar as margens se necessário para acomodar o texto horizontal.

## Architecture

### Componentes Afetados
- **Dashboard Page** (`app/dashboard/page.tsx`): Componente principal que contém os gráficos de aniversários
- **XAxis Configuration**: Configuração específica do eixo X nos BarCharts de aniversários

### Localização dos Problemas
Baseado na análise do código, há dois gráficos de aniversários:

1. **Primeiro gráfico** (birthdayReportData):
   ```typescript
   <XAxis
     dataKey="name"
     tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'Inter, sans-serif' }}
     height={60}
     interval={0}
     angle={-45}  // <- PROBLEMA: texto diagonal
     textAnchor="end"
   />
   ```

2. **Segundo gráfico** (detailedBirthdayReportData):
   ```typescript
   <XAxis
     dataKey="mes"
     tick={{ fontSize: 10, fill: '#6B7280' }}
     height={60}
     interval={0}
     angle={0}  // <- JÁ CORRETO: texto horizontal
   />
   ```

## Components and Interfaces

### Configuração Atual vs Desejada

#### Configuração Problemática (Primeiro Gráfico)
```typescript
<XAxis
  dataKey="name"
  tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'Inter, sans-serif' }}
  height={60}
  interval={0}
  angle={-45}        // Texto diagonal - REMOVER
  textAnchor="end"   // Necessário para texto diagonal - AJUSTAR
/>
```

#### Configuração Corrigida (Primeiro Gráfico)
```typescript
<XAxis
  dataKey="name"
  tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'Inter, sans-serif' }}
  height={60}
  interval={0}
  angle={0}          // Texto horizontal
  textAnchor="middle" // Centralizado para texto horizontal
/>
```

### Ajustes de Layout

#### Margens do BarChart
Pode ser necessário ajustar as margens para acomodar o texto horizontal:
```typescript
// Atual
margin={{ top: 20, right: 30, left: 80, bottom: 60 }}

// Possível ajuste se necessário
margin={{ top: 20, right: 30, left: 80, bottom: 80 }}
```

## Data Models

### Estruturas Mantidas
- `birthdayReportData`: Array de dados do primeiro gráfico (não modificado)
- `detailedBirthdayReportData`: Array de dados do segundo gráfico (não modificado)
- Todas as interfaces e tipos existentes permanecem inalterados

### Estados Preservados
- Todos os estados relacionados aos gráficos de aniversários são mantidos
- Funcionalidades de hover e interação não são afetadas
- Cores e estilos das barras permanecem os mesmos

## Error Handling

### Validação de Mudanças
1. **Teste Visual**: Verificar que o texto aparece horizontalmente
2. **Teste de Espaçamento**: Confirmar que não há sobreposição ou corte de texto
3. **Teste de Responsividade**: Validar em diferentes tamanhos de tela
4. **Teste de Consistência**: Garantir que ambos os gráficos tenham aparência similar

### Possíveis Problemas e Soluções
1. **Texto Cortado**: Aumentar `height` do XAxis ou `bottom` margin do BarChart
2. **Sobreposição**: Ajustar `interval` ou reduzir `fontSize` se necessário
3. **Desalinhamento**: Usar `textAnchor="middle"` para centralizar o texto

## Testing Strategy

### Testes Visuais
1. **Orientação do Texto**: Confirmar que está horizontal (0 graus)
2. **Legibilidade**: Verificar que todos os nomes das lojas são legíveis
3. **Espaçamento**: Validar que há espaço adequado entre labels
4. **Alinhamento**: Confirmar que o texto está bem centralizado

### Testes de Compatibilidade
1. **Diferentes Navegadores**: Testar em Chrome, Firefox, Safari, Edge
2. **Dispositivos Móveis**: Verificar responsividade em tablets e smartphones
3. **Diferentes Resoluções**: Testar em monitores de várias resoluções
4. **Zoom**: Validar comportamento com diferentes níveis de zoom

### Testes de Regressão
1. **Funcionalidade Existente**: Confirmar que hover e tooltips ainda funcionam
2. **Outros Gráficos**: Verificar que outros gráficos não foram afetados
3. **Performance**: Validar que não há impacto na performance de renderização
4. **Dados Dinâmicos**: Testar com diferentes quantidades de lojas

## Implementation Details

### Mudanças Específicas

#### Arquivo: `app/dashboard/page.tsx`
**Localização**: Primeiro gráfico de aniversários (birthdayReportData)

**Mudança 1**: Alterar angle de -45 para 0
```typescript
// De:
angle={-45}
// Para:
angle={0}
```

**Mudança 2**: Ajustar textAnchor
```typescript
// De:
textAnchor="end"
// Para:
textAnchor="middle"
```

**Mudança 3** (se necessário): Ajustar margens
```typescript
// Pode ser necessário aumentar bottom margin
margin={{ top: 20, right: 30, left: 80, bottom: 80 }}
```

### Considerações de Performance
- As mudanças são puramente de configuração CSS/SVG
- Não há impacto na performance de renderização
- Não afeta o carregamento ou processamento de dados
- Mudanças são aplicadas apenas na camada de apresentação