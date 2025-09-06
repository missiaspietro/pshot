# Design Document

## Overview

O sistema de layout responsivo para PDFs implementa detecção automática do número de colunas e aplica configurações otimizadas de layout, tipografia e espaçamento. O sistema funciona através de três componentes principais: detecção de colunas, aplicação de estilos responsivos e configuração dinâmica do Puppeteer.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PDF Generation System                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Column        │  │   Responsive    │  │   Puppeteer     │ │
│  │   Detection     │  │   Styling       │  │   Config        │ │
│  │                 │  │                 │  │                 │ │
│  │ - Count fields  │  │ - Font sizes    │  │ - Page format   │ │
│  │ - Classify      │  │ - Padding       │  │ - Margins       │ │
│  │ - Set flags     │  │ - Cell width    │  │ - Orientation   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                     │                     │        │
│           └─────────────────────┼─────────────────────┘        │
│                                 │                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              HTML Generator                             │   │
│  │                                                         │   │
│  │ - Apply responsive CSS                                  │   │
│  │ - Generate table structure                              │   │
│  │ - Add container with overflow                           │   │
│  │ - Include layout feedback                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Selects Fields → Count Columns → Classify Layout → Apply Styles → Generate HTML → Configure Puppeteer → Generate PDF
```

## Components and Interfaces

### 1. Column Detection Component

**Purpose:** Detecta automaticamente o número de colunas e classifica o tipo de layout necessário.

**Interface:**
```typescript
interface ColumnDetection {
  columnCount: number
  isWideTable: boolean
  isVeryWideTable: boolean
}

function detectLayout(selectedFields: string[], reportType: 'birthday' | 'cashback'): ColumnDetection
```

**Implementation:**
```typescript
// Thresholds por tipo de relatório
const THRESHOLDS = {
  birthday: { wide: 6, veryWide: 8 },
  cashback: { wide: 5, veryWide: 7 }
}

function detectLayout(selectedFields: string[], reportType: 'birthday' | 'cashback'): ColumnDetection {
  const columnCount = selectedFields.length
  const threshold = THRESHOLDS[reportType]
  
  return {
    columnCount,
    isWideTable: columnCount > threshold.wide,
    isVeryWideTable: columnCount > threshold.veryWide
  }
}
```

### 2. Responsive Styling Component

**Purpose:** Calcula e aplica estilos responsivos baseados na classificação do layout.

**Interface:**
```typescript
interface ResponsiveStyles {
  fontSize: string
  cellPadding: string
  headerFontSize: string
  maxCellWidth: string
  pageMargin: string
}

function calculateStyles(layout: ColumnDetection): ResponsiveStyles
```

**Implementation:**
```typescript
function calculateStyles(layout: ColumnDetection): ResponsiveStyles {
  const { isWideTable, isVeryWideTable } = layout
  
  return {
    fontSize: isVeryWideTable ? '10px' : isWideTable ? '11px' : '12px',
    cellPadding: isVeryWideTable ? '4px' : isWideTable ? '6px' : '8px',
    headerFontSize: isVeryWideTable ? '11px' : isWideTable ? '12px' : '13px',
    maxCellWidth: isVeryWideTable ? '120px' : isWideTable ? '150px' : '200px',
    pageMargin: isVeryWideTable ? '10mm' : '15mm'
  }
}
```

### 3. HTML Generator Component

**Purpose:** Gera HTML responsivo com estilos e estrutura otimizados.

**Key Features:**
- CSS @page com configurações dinâmicas
- Container com overflow-x para scroll horizontal
- Células com largura máxima e text-overflow
- Nota informativa sobre otimizações aplicadas

**CSS Template:**
```css
@page {
  size: A4 ${isWideTable ? 'landscape' : 'portrait'};
  margin: ${pageMargin};
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: ${isWideTable ? 'max-content' : '100%'};
  min-width: 100%;
}

td {
  max-width: ${maxCellWidth};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 4. Puppeteer Configuration Component

**Purpose:** Configura dinamicamente o Puppeteer baseado no layout detectado.

**Interface:**
```typescript
interface PuppeteerConfig {
  format: 'A4'
  landscape: boolean
  margin: {
    top: string
    right: string
    bottom: string
    left: string
  }
  printBackground: boolean
  preferCSSPageSize: boolean
}

function configurePuppeteer(layout: ColumnDetection, styles: ResponsiveStyles): PuppeteerConfig
```

## Data Models

### Layout Classification

```typescript
enum LayoutType {
  NORMAL = 'normal',      // Poucas colunas - formato retrato
  WIDE = 'wide',          // Muitas colunas - formato paisagem
  VERY_WIDE = 'very_wide' // Muitas colunas - formato paisagem otimizado
}

interface LayoutConfig {
  type: LayoutType
  columnCount: number
  pageOrientation: 'portrait' | 'landscape'
  styles: ResponsiveStyles
}
```

### Report Type Configuration

```typescript
interface ReportTypeConfig {
  name: string
  color: string
  thresholds: {
    wide: number
    veryWide: number
  }
  defaultFields: string[]
}

const REPORT_CONFIGS: Record<string, ReportTypeConfig> = {
  birthday: {
    name: 'Aniversários',
    color: '#e91e63',
    thresholds: { wide: 6, veryWide: 8 },
    defaultFields: ['criado_em', 'cliente', 'whatsApp', 'loja', 'status']
  },
  cashback: {
    name: 'Cashback',
    color: '#10b981',
    thresholds: { wide: 5, veryWide: 7 },
    defaultFields: ['Envio_novo', 'Nome', 'Whatsapp', 'Loja', 'Status']
  }
}
```

## Error Handling

### Column Detection Errors
- **Invalid field count:** Retorna layout normal como fallback
- **Unknown report type:** Usa configuração padrão (birthday)

### Style Application Errors
- **CSS generation failure:** Aplica estilos padrão
- **Invalid style values:** Usa valores seguros (12px, 8px, etc.)

### Puppeteer Configuration Errors
- **Invalid orientation:** Força portrait como padrão
- **Invalid margins:** Usa margens padrão (15mm)

## Testing Strategy

### Unit Tests
1. **Column Detection Tests**
   - Teste com diferentes números de campos
   - Teste com diferentes tipos de relatório
   - Teste com valores extremos (0 campos, 20+ campos)

2. **Style Calculation Tests**
   - Verificar valores corretos para cada tipo de layout
   - Teste de consistência entre estilos relacionados
   - Validação de unidades CSS

3. **HTML Generation Tests**
   - Verificar estrutura HTML correta
   - Validar aplicação de estilos CSS
   - Teste de escape de caracteres especiais

### Integration Tests
1. **PDF Generation Tests**
   - Teste end-to-end com diferentes combinações de campos
   - Verificar orientação correta da página
   - Validar qualidade visual do PDF gerado

2. **Cross-Report Tests**
   - Consistência entre relatórios de aniversários e cashback
   - Verificar cores específicas de cada relatório
   - Teste de performance com grandes volumes de dados

### Visual Regression Tests
1. **Layout Comparison Tests**
   - Screenshots de PDFs com diferentes números de colunas
   - Comparação visual entre versões
   - Teste de responsividade em diferentes resoluções

## Performance Considerations

### Memory Usage
- Reutilização de configurações calculadas
- Cleanup automático de recursos do Puppeteer
- Otimização de strings CSS geradas

### Generation Speed
- Cache de estilos calculados para combinações comuns
- Configuração otimizada do Puppeteer por tipo de layout
- Minimização de re-renderizações desnecessárias

### Scalability
- Suporte para novos tipos de relatório através de configuração
- Extensibilidade dos thresholds de detecção
- Modularidade para futuras otimizações