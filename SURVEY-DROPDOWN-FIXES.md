# Correções do Dropdown de Resposta - Relatório de Pesquisas

## 🎯 Correções Implementadas

### 1. **Checkbox "Resposta" Desmarcado por Padrão**

**Problema**: O checkbox "Resposta" estava pré-marcado quando a página carregava.

**Solução**: Removido "resposta" dos campos pré-selecionados.

**Antes:**
```typescript
const [selectedSurveyFields, setSelectedSurveyFields] = useState<string[]>([
  "nome", "telefone", "resposta", "loja", "rede"  // ❌ "resposta" pré-marcado
])
```

**Depois:**
```typescript
const [selectedSurveyFields, setSelectedSurveyFields] = useState<string[]>([
  "nome", "telefone", "loja", "rede"  // ✅ "resposta" desmarcado
])
```

### 2. **Salvar Valor do Dropdown nas Configurações**

**Problema**: O valor selecionado no dropdown não era salvo nas configurações.

**Solução**: Atualizada toda a cadeia de salvamento para incluir o `responseFilter`.

#### **Interfaces Atualizadas:**

**FilterConfiguration** (`lib/filter-config-encryption.ts`):
```typescript
export interface FilterConfiguration {
  id: string
  name: string
  selectedFields: string[]
  responseFilter?: string // ✅ Adicionado
  type: 'birthday' | 'cashback' | 'survey'
  createdAt: string
  updatedAt: string
}
```

**SaveConfigRequest** (`lib/filter-config-service.ts`):
```typescript
export interface SaveConfigRequest {
  name: string
  selectedFields: string[]
  responseFilter?: string // ✅ Adicionado
  type: 'birthday' | 'cashback' | 'survey'
}
```

#### **Serviço Atualizado:**

**FilterConfigService** (`lib/filter-config-service.ts`):
```typescript
body: JSON.stringify({
  name: sanitizedName,
  selectedFields: request.selectedFields,
  responseFilter: request.responseFilter, // ✅ Incluído
  type: request.type
})
```

#### **API Route Atualizada:**

**POST /api/users/report-filters** (`app/api/users/report-filters/route.ts`):
```typescript
// Extração dos dados
const { name, selectedFields, responseFilter, type } = body

// Criação da configuração
const newConfig: FilterConfiguration = {
  id: uuidv4(),
  name: sanitizedName,
  selectedFields: selectedFields,
  responseFilter: responseFilter, // ✅ Incluído
  type: type,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

#### **Página de Relatórios Atualizada:**

**Salvamento** (`app/reports/page.tsx`):
```typescript
const success = await saveSurveyConfiguration({
  name: nameWithSuffix,
  selectedFields: selectedSurveyFields,
  responseFilter: surveyResponseFilter, // ✅ Incluído
  type: 'survey'
})
```

**Carregamento** (`app/reports/page.tsx`):
```typescript
setSelectedSurveyFields(validFields)

// Carregar filtro de resposta se existir
if (config.responseFilter !== undefined) {
  setSurveyResponseFilter(config.responseFilter || "")
}
```

## ✅ Resultado Final

### **Comportamento Atual:**
1. ✅ **Página carrega** → Checkbox "Resposta" está **desmarcado**
2. ✅ **Usuário marca "Resposta"** → Dropdown aparece
3. ✅ **Usuário seleciona filtro** → Valor é armazenado
4. ✅ **Usuário salva configuração** → Filtro é **incluído na configuração**
5. ✅ **Usuário carrega configuração** → Filtro é **restaurado corretamente**

### **Fluxo Completo:**
- **Estado inicial**: Campos básicos selecionados, "Resposta" desmarcado
- **Interação**: Usuário marca "Resposta" → Dropdown aparece
- **Configuração**: Usuário seleciona filtro → Valor salvo
- **Persistência**: Configuração salva inclui o valor do dropdown
- **Restauração**: Configuração carregada restaura o valor do dropdown

## 🎯 Funcionalidades Confirmadas

- ✅ Checkbox "Resposta" inicia desmarcado
- ✅ Dropdown aparece apenas quando "Resposta" é marcado
- ✅ Valor do dropdown é salvo nas configurações
- ✅ Valor do dropdown é restaurado ao carregar configuração
- ✅ Sistema de configurações funciona completamente
- ✅ Integração com modal de preview mantida
- ✅ API atualizada para suportar responseFilter

As correções estão **completas e funcionais**! 🚀