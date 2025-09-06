# Guia do Sistema de Layout Responsivo para PDFs

## Visão Geral

O sistema de layout responsivo para PDFs detecta automaticamente o número de colunas selecionadas pelo usuário e aplica configurações otimizadas de layout, tipografia e espaçamento para garantir que todas as informações sejam visíveis e legíveis no PDF gerado.

## Como Funciona

### 1. Detecção Automática de Colunas

O sistema analisa o número de campos selecionados e classifica o layout em três categorias:

#### Relatórios de Aniversários
- **Normal**: ≤ 6 colunas → Formato retrato
- **Larga**: 7-8 colunas → Formato paisagem  
- **Muito Larga**: > 8 colunas → Formato paisagem otimizado

#### Relatórios de Cashback
- **Normal**: ≤ 5 colunas → Formato retrato
- **Larga**: 6-7 colunas → Formato paisagem
- **Muito Larga**: > 7 colunas → Formato paisagem otimizado

### 2. Aplicação de Estilos Responsivos

Baseado na classificação, o sistema aplica automaticamente:

| Layout | Fonte | Padding | Cabeçalho | Largura Célula | Margens |
|--------|-------|---------|-----------|----------------|---------|
| Normal | 12px | 8px | 13px | 200px | 15mm |
| Larga | 11px | 6px | 12px | 150px | 15mm |
| Muito Larga | 10px | 4px | 11px | 120px | 10mm |

### 3. Configuração Dinâmica do PDF

O sistema configura automaticamente:
- **Orientação**: Portrait ou Landscape
- **Margens**: Padrão (15mm) ou Reduzidas (10mm)
- **Scroll**: Container com overflow-x para tabelas muito largas

## Guia de Uso

### Para Usuários

1. **Selecione os campos desejados** no relatório
2. **Clique em "Gerar PDF"**
3. **O sistema detecta automaticamente** o melhor layout
4. **Receba o PDF otimizado** com todas as informações visíveis

### Feedback Visual

Quando otimizações são aplicadas, você verá uma nota no PDF:
> *"Tabela com X colunas - Formato paisagem otimizado"*

### Exemplos Práticos

#### Exemplo 1: Relatório de Aniversários Normal
**Campos selecionados**: Data, Cliente, WhatsApp, Loja, Status (5 campos)
**Resultado**: PDF em formato retrato, fonte 12px, layout tradicional

#### Exemplo 2: Relatório de Cashback Largo  
**Campos selecionados**: Data, Nome, WhatsApp, Loja, Status, Extra (6 campos)
**Resultado**: PDF em formato paisagem, fonte 11px, otimizado para mais colunas

#### Exemplo 3: Relatório com Muitas Colunas
**Campos selecionados**: Todos os campos disponíveis (9+ campos)
**Resultado**: PDF paisagem, fonte 10px, margens reduzidas, scroll horizontal

## Guia Técnico

### Arquitetura do Sistema

```typescript
// 1. Detecção de Layout
function detectLayout(selectedFields: string[], reportType: 'birthday' | 'cashback') {
  const columnCount = selectedFields.length
  const thresholds = {
    birthday: { wide: 6, veryWide: 8 },
    cashback: { wide: 5, veryWide: 7 }
  }
  
  return {
    columnCount,
    isWideTable: columnCount > thresholds[reportType].wide,
    isVeryWideTable: columnCount > thresholds[reportType].veryWide
  }
}

// 2. Cálculo de Estilos
function calculateStyles(layout: LayoutDetection) {
  return {
    fontSize: layout.isVeryWideTable ? '10px' : layout.isWideTable ? '11px' : '12px',
    cellPadding: layout.isVeryWideTable ? '4px' : layout.isWideTable ? '6px' : '8px',
    // ... outros estilos
  }
}

// 3. Configuração do Puppeteer
const pdfConfig = {
  format: 'A4',
  landscape: layout.isWideTable,
  margin: {
    top: layout.isVeryWideTable ? '10mm' : '15mm',
    // ... outras margens
  },
  preferCSSPageSize: true
}
```

### CSS Responsivo Gerado

```css
@page {
  size: A4 landscape; /* ou portrait */
  margin: 10mm; /* ou 15mm */
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: max-content; /* para tabelas largas */
  min-width: 100%;
}

td {
  max-width: 120px; /* varia conforme layout */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### Configurações por Tipo de Relatório

#### Aniversários
- **Cor**: Rosa (#e91e63)
- **Threshold Larga**: > 6 colunas
- **Threshold Muito Larga**: > 8 colunas
- **Campos Típicos**: 6-7 campos

#### Cashback
- **Cor**: Verde (#10b981)  
- **Threshold Larga**: > 5 colunas
- **Threshold Muito Larga**: > 7 colunas
- **Campos Típicos**: 5-6 campos

#### Pesquisas
- **Cor**: Roxa (#8b5cf6)
- **Threshold Larga**: > 6 colunas  
- **Threshold Muito Larga**: > 8 colunas
- **Campos Típicos**: 8-9 campos

## Manutenção e Extensão

### Adicionando Novo Tipo de Relatório

1. **Defina os thresholds** no arquivo de configuração
2. **Implemente a detecção** na função `detectLayout`
3. **Configure a cor** específica no CSS
4. **Adicione testes** para o novo tipo

### Ajustando Thresholds

Para modificar quando um relatório muda de layout:

```typescript
const THRESHOLDS = {
  birthday: { wide: 6, veryWide: 8 }, // Modificar aqui
  cashback: { wide: 5, veryWide: 7 },  // Modificar aqui
  newReport: { wide: 4, veryWide: 6 }  // Adicionar novo
}
```

### Personalizando Estilos

Para ajustar tamanhos de fonte ou padding:

```typescript
const STYLES = {
  normal: { fontSize: '12px', padding: '8px' },
  wide: { fontSize: '11px', padding: '6px' },     // Modificar aqui
  veryWide: { fontSize: '10px', padding: '4px' }  // Modificar aqui
}
```

## Troubleshooting

### Problema: PDF cortado mesmo com otimizações
**Solução**: Verificar se os thresholds estão adequados para o tipo de relatório

### Problema: Fonte muito pequena
**Solução**: Ajustar os valores de `fontSize` na configuração de estilos

### Problema: Margens inadequadas
**Solução**: Modificar os valores de `pageMargin` ou thresholds de `isVeryWideTable`

### Problema: Scroll não funciona
**Solução**: Verificar se o container `.table-container` tem `overflow-x: auto`

## Performance

### Otimizações Implementadas
- **Cache de estilos** calculados para combinações comuns
- **Configuração otimizada** do Puppeteer por tipo de layout
- **Cleanup automático** de recursos
- **Minimização** de re-renderizações

### Métricas Esperadas
- **Detecção de layout**: < 1ms
- **Cálculo de estilos**: < 1ms  
- **Geração de HTML**: 10-50ms
- **Geração de PDF**: 1-3 segundos

## Testes

### Executar Testes
```bash
npm test pdf-responsive-layout
npm test pdf-responsive-integration
```

### Cobertura de Testes
- ✅ Detecção de colunas para todos os tipos
- ✅ Cálculo de estilos para todos os layouts
- ✅ Geração de HTML responsivo
- ✅ Configuração do Puppeteer
- ✅ Casos extremos e tratamento de erros
- ✅ Integração end-to-end

## Changelog

### v1.0.0 - Implementação Inicial
- ✅ Sistema de detecção automática de colunas
- ✅ Estilos responsivos para 3 tipos de layout
- ✅ Configuração dinâmica do Puppeteer
- ✅ Suporte para aniversários e cashback
- ✅ Testes unitários e de integração
- ✅ Documentação completa

### Próximas Versões
- 🔄 Suporte para relatórios de pesquisas
- 🔄 Interface de configuração para thresholds
- 🔄 Métricas de performance em tempo real
- 🔄 Testes visuais automatizados