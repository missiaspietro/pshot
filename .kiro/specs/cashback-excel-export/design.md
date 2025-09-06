# Design Document

## Overview

Esta funcionalidade adiciona capacidade de exportação para Excel ao gráfico de cashback no dashboard. A implementação utilizará a biblioteca `xlsx` para gerar arquivos Excel no lado do cliente e permitir download direto pelo navegador. O botão será integrado visualmente ao card do gráfico de cashback existente.

## Architecture

### Client-Side Excel Generation
- Utilização da biblioteca `xlsx` (SheetJS) para geração de arquivos Excel
- Processamento dos dados no cliente para evitar sobrecarga no servidor
- Download automático via blob URLs e elemento `<a>` temporário

### Component Integration
- Integração do botão de exportação no componente existente do dashboard
- Reutilização dos dados já carregados pelo `getCashbackData`
- Manutenção da consistência visual com outros elementos da UI

## Components and Interfaces

### 1. ExcelExportButton Component
```typescript
interface ExcelExportButtonProps {
  data: CashbackData[]
  lojas: string[]
  isLoading?: boolean
  disabled?: boolean
}
```

**Responsabilidades:**
- Renderizar botão de exportação com ícone apropriado
- Gerenciar estado de loading durante exportação
- Executar processo de exportação quando clicado

### 2. Excel Export Service
```typescript
interface ExcelExportService {
  exportCashbackToExcel(data: CashbackData[], lojas: string[]): void
}
```

**Responsabilidades:**
- Transformar dados do gráfico em formato adequado para Excel
- Gerar arquivo Excel com formatação apropriada
- Iniciar download automático do arquivo

### 3. Data Transformation
```typescript
interface ExcelRowData {
  mes: string
  [loja: string]: string | number
}
```

## Data Models

### Input Data Structure
Os dados de entrada seguem a interface `CashbackData` existente:
```typescript
interface CashbackData {
  mes: string
  [key: string]: string | number // Propriedades dinâmicas das lojas
}
```

### Excel Output Structure
A planilha Excel terá a seguinte estrutura:
- **Coluna A**: "Mês" - contendo os períodos de tempo
- **Colunas B+**: Uma coluna para cada loja (ex: "Loja 1", "Loja 2", etc.)
- **Linha 1**: Cabeçalhos das colunas
- **Linhas 2+**: Dados dos cashbacks por mês e loja

### File Naming Convention
- Formato: `cashback-export-YYYY-MM-DD.xlsx`
- Exemplo: `cashback-export-2025-01-30.xlsx`

## Error Handling

### Export Errors
- **Dados vazios**: Exibir toast informando que não há dados para exportar
- **Erro de geração**: Exibir toast com mensagem de erro genérica
- **Erro de download**: Fallback para tentar novamente ou orientar usuário

### Loading States
- Botão desabilitado durante exportação
- Spinner/loading indicator no botão
- Texto do botão alterado para "Exportando..."

## Testing Strategy

### Unit Tests
1. **ExcelExportButton Component**
   - Renderização correta do botão
   - Estados de loading e disabled
   - Chamada da função de exportação ao clicar

2. **Excel Export Service**
   - Transformação correta dos dados
   - Geração de arquivo Excel válido
   - Nomenclatura correta do arquivo

### Integration Tests
1. **Dashboard Integration**
   - Botão aparece no local correto
   - Dados do gráfico são passados corretamente
   - Exportação funciona com dados reais

### Manual Testing
1. **User Experience**
   - Download automático funciona em diferentes navegadores
   - Arquivo Excel abre corretamente
   - Dados na planilha correspondem ao gráfico

## Implementation Details

### Dependencies
Nova dependência necessária:
```json
{
  "xlsx": "^0.18.5"
}
```

### File Structure
```
lib/
  excel-export-service.ts     # Serviço de exportação
components/
  ui/
    excel-export-button.tsx   # Componente do botão
app/
  dashboard/
    page.tsx                  # Integração no dashboard
```

### Visual Design
- **Ícone**: Download ou Excel icon do Lucide React
- **Posicionamento**: Ao lado do seletor de período do gráfico
- **Estilo**: Consistente com outros botões do dashboard (Button component do shadcn/ui)
- **Cores**: Tema padrão do sistema

### Performance Considerations
- Exportação assíncrona para não bloquear UI
- Limite razoável de dados (atual: 6 meses de dados)
- Cleanup de blob URLs após download

### Browser Compatibility
- Suporte para navegadores modernos (Chrome, Firefox, Safari, Edge)
- Fallback gracioso para navegadores que não suportam download automático