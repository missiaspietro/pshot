# Design - Implementação Completa do Sistema de Promoções

## Visão Geral

Este documento descreve o design técnico para implementar completamente o sistema de promoções baseado no prompt original, focando nas 4 tarefas principais.

## Arquitetura

### Estrutura de Arquivos
```
app/api/reports/promotions/pdf/
└── route.ts                    # Nova rota PDF para promoções

app/reports/page.tsx            # Correções no sistema de configurações

components/ui/
├── save-configuration-modal.tsx    # Reutilizar existente
└── saved-configurations-list.tsx   # Reutilizar existente

lib/
└── promotions-pdf-service.ts   # Novo serviço para PDF de promoções
```

## Tarefas e Implementação

### TAREFA 1: Modal com Dados Reais (✅ JÁ IMPLEMENTADO)
- Modal já puxa dados da tabela "Relatorio Envio de Promoções"
- Filtra por empresa do usuário logado (campo "Rede")
- Mostra apenas campos selecionados nos checkboxes
- Implementado em: `components/ui/promotions-preview-modal.tsx`

### TAREFA 2: Sistema de Configurações para Promoções
**Problema Atual:** Botão "Salvar Configuração" não funciona (apenas comentário TODO)

**Implementação Necessária:**
```typescript
// Estados necessários (alguns já existem)
const [isPromotionsSaveModalOpen, setIsPromotionsSaveModalOpen] = useState(false)
const [isPromotionsConfigListExpanded, setIsPromotionsConfigListExpanded] = useState(false)

// Hook para configurações (reutilizar existente)
const {
  configurations: allPromotionsConfigurations,
  saveConfiguration: savePromotionsConfiguration,
  deleteConfiguration: deletePromotionsConfiguration,
  // ... outros
} = useFilterConfigurations()

// Filtrar configurações por tipo
const promotionsConfigurations = allPromotionsConfigurations.filter(config =>
  config.name.includes('(Promoções)')
)

// Função para salvar (implementar)
const handleSavePromotionsConfiguration = async (name: string): Promise<boolean> => {
  const nameWithSuffix = `${name} (Promoções)`
  return await savePromotionsConfiguration({
    name: nameWithSuffix,
    selectedFields: selectedPromotionsFields,
    type: 'promotions'
  })
}
```

### TAREFA 3: Correção do Filtro de Aniversários
**Problema Atual:** Card de aniversários mostra configurações de pesquisas

**Correção Necessária:**
```typescript
// ANTES (incorreto)
const configurations = allConfigurations.filter(config =>
  !config.name.includes('(Cashback)') // Lógica errada
)

// DEPOIS (correto)
const configurations = allConfigurations.filter(config =>
  config.name.includes('(Aniversários)')
)
```

### TAREFA 4: Rota PDF para Promoções
**Estrutura da Nova Rota:**
```typescript
// app/api/reports/promotions/pdf/route.ts
export async function POST(request: NextRequest) {
  // 1. Validar autenticação
  // 2. Buscar dados do usuário
  // 3. Gerar HTML com tema amarelo
  // 4. Converter para PDF com Puppeteer
  // 5. Retornar PDF ou fallback HTML
}
```

## Componentes e Interfaces

### Interface de Configuração de Promoções
```typescript
interface PromotionsConfiguration {
  id: string
  name: string // Sempre com sufixo "(Promoções)"
  selectedFields: string[]
  type: 'promotions'
  createdAt: string
}
```

### Serviço de PDF de Promoções
```typescript
class PromotionsPdfService {
  generateReportHTML(data: PromotionsData[], config: PdfConfig): string
  detectLayout(fieldCount: number): 'portrait' | 'landscape'
  formatPromotionsData(data: PromotionsData[]): FormattedData[]
}
```

## Integração com Sistema Existente

### Reutilização de Componentes
- `SaveConfigurationModal`: Usar existente
- `SavedConfigurationsList`: Usar existente  
- `useFilterConfigurations`: Usar hook existente
- `FilterConfigEncryption`: Usar criptografia existente

### Padrões Consistentes
- Sufixos: "(Promoções)", "(Aniversários)", "(Cashback)", "(Pesquisas)"
- Criptografia: Mesma implementação na coluna `config_filtros_relatorios`
- Autenticação: Mesmo padrão de cookie `ps_session`
- Tema: Amarelo (#f59e0b) para combinar com card de promoções

## Configuração do PDF

### Template HTML
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .header { background-color: #f59e0b; } /* Tema amarelo */
    .table-header { background-color: #fef3c7; }
    /* CSS responsivo baseado no número de campos */
  </style>
</head>
<body>
  <div class="report-container">
    <header>Relatório de Promoções</header>
    <table><!-- Dados dinâmicos --></table>
    <footer>Gerado em: {{date}}</footer>
  </div>
</body>
</html>
```

### Configuração Puppeteer
```typescript
const pdfOptions = {
  format: 'A4' as const,
  orientation: fieldCount > 6 ? 'landscape' : 'portrait',
  margin: { top: '15mm', right: '10mm', bottom: '15mm', left: '10mm' },
  printBackground: true,
  timeout: 30000
}
```

## Validação e Segurança

### Validação de Configurações
```typescript
const validatePromotionsConfig = (config: any): boolean => {
  return config.name.includes('(Promoções)') && 
         config.selectedFields.length > 0 &&
         config.type === 'promotions'
}
```

### Segurança de Dados
- Filtrar dados apenas da empresa do usuário
- Validar campos selecionados contra lista permitida
- Criptografar configurações antes de salvar
- Validar tipo de configuração antes de carregar/excluir