# Correção da Tabela de Aniversários

## 🎯 Objetivo
Corrigir a API de aniversários para usar a tabela correta `relatorio_niver_decor_fabril` ao invés da tabela `msg_aniversarios` que foi mencionada incorretamente.

## 📊 Estrutura Correta da Tabela

### **Tabela: `relatorio_niver_decor_fabril`**
```sql
CREATE TABLE public.relatorio_niver_decor_fabril (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  criado_em date NOT NULL DEFAULT now(),
  cliente text NULL,
  "whatsApp" text NULL,
  mensagem_entrege text NULL,
  mensagem_perdida text NULL,
  rede text NULL,
  loja text NULL,
  obs text NULL,
  "Sub_Rede" text NULL,
  CONSTRAINT relatorio_niver_decor_fabril_pkey PRIMARY KEY (id)
);
```

### **Mapeamento de Campos Correto**

| Campo Interface | Campo Tabela | Descrição |
|----------------|--------------|-----------|
| `criado_em` | `criado_em` | Data de criação |
| `cliente` | `cliente` | Nome do cliente |
| `whatsApp` | `whatsApp` | Número do WhatsApp |
| `status` | `obs` | Status/Observações |
| `rede` | `rede` | Rede da empresa |
| `loja` | `loja` | Loja |
| `Sub_Rede` | `Sub_Rede` | Sub-rede |

## ✅ Correções Implementadas

### 1. **API Route Corrigida (`app/api/reports/birthday/route.ts`)**

#### **Mapeamento de Campos Correto:**
```typescript
const mapFieldToColumn = (field: string): string => {
  const fieldMapping: Record<string, string> = {
    'status': 'obs',              // Mapear status para obs (observações)
    'criado_em': 'criado_em',     // Data de criação
    'cliente': 'cliente',         // Nome do cliente
    'whatsApp': 'whatsApp',       // Número do WhatsApp
    'rede': 'rede',              // Rede da empresa
    'loja': 'loja',              // Loja
    'Sub_Rede': 'Sub_Rede'       // Sub-rede
  }
  return fieldMapping[field] || field
}
```

#### **Query na Tabela Correta:**
```typescript
// Construir query para a tabela relatorio_niver_decor_fabril
let query = supabase
  .from('relatorio_niver_decor_fabril')
  .select(mappedFields.join(', '))
  .eq('rede', userNetwork) // Filtrar pela rede do usuário

// Aplicar filtros de data
if (startDate) {
  query = query.gte('criado_em', startDate)
}

if (endDate) {
  query = query.lte('criado_em', endDate)
}

// Ordenar por data (mais recentes primeiro)
query = query.order('criado_em', { ascending: false })
```

#### **Logs Atualizados:**
```typescript
console.log('🔄 API de Aniversários - Tabela relatorio_niver_decor_fabril:', { selectedFields, mappedFields, startDate, endDate })
console.log('🎯 Buscando dados na tabela relatorio_niver_decor_fabril para empresa:', userNetwork)
console.log('📈 Dados obtidos da relatorio_niver_decor_fabril:', data?.length || 0, 'registros')
```

### 2. **Campos da Interface Corrigidos (`app/reports/page.tsx`)**

#### **Campos Disponíveis Corretos:**
```typescript
const availableFields = [
  { id: "criado_em", label: "Data de Criação", description: "Data de criação do registro" },
  { id: "cliente", label: "Cliente", description: "Nome do cliente" },
  { id: "whatsApp", label: "WhatsApp", description: "Número do WhatsApp" },
  { id: "status", label: "Status", description: "Status do envio (observações)", disabled: true },
  { id: "rede", label: "Rede", description: "Rede do usuário", disabled: true },
  { id: "loja", label: "Loja", description: "Loja associada" },
  { id: "Sub_Rede", label: "Sub-rede", description: "Sub-rede associada" }
]
```

### 3. **Script de Teste Atualizado**

#### **Teste da Tabela Correta:**
```javascript
// Script para testar a tabela relatorio_niver_decor_fabril
const { data: allData, error: allError } = await supabase
  .from('relatorio_niver_decor_fabril')
  .select('*')
  .limit(5)

// Testar query com filtros
const { data: filteredData, error: filterError } = await supabase
  .from('relatorio_niver_decor_fabril')
  .select('id, criado_em, cliente, obs, rede, loja')
  .eq('rede', testNetwork)
  .order('criado_em', { ascending: false })
  .limit(3)
```

## 🔧 Fluxo de Funcionamento Correto

### **1. Autenticação (Mantida):**
1. Extrair email do cookie de sessão
2. Buscar dados do usuário na tabela `users`
3. Determinar rede/empresa do usuário
4. Validar permissões

### **2. Busca de Dados (Corrigida):**
1. Mapear campos da interface para colunas da tabela `relatorio_niver_decor_fabril`
2. Construir query com filtro por rede do usuário
3. Aplicar filtros de data se fornecidos (campo `criado_em`)
4. Ordenar por data de criação (mais recentes primeiro)
5. Executar query na tabela `relatorio_niver_decor_fabril`

### **3. Resposta (Atualizada):**
1. Retornar dados filtrados por empresa
2. Incluir informações de debug (total, rede, etc.)
3. Indicar fonte dos dados (`source: 'relatorio_niver_decor_fabril'`)

## 🧪 Como Testar

### **1. Teste do Script:**
```bash
# Executar script de teste atualizado
node test-birthday-new-table.js
```

### **2. Teste no Modal:**
1. Fazer login com usuário que tem empresa/rede definida
2. Abrir modal de aniversários
3. Verificar se dados são carregados da tabela correta
4. Confirmar que apenas dados da empresa do usuário aparecem

### **3. Verificar Logs:**
1. Abrir DevTools → Console
2. Procurar logs com "relatorio_niver_decor_fabril"
3. Verificar se rede do usuário está sendo detectada
4. Confirmar que query está sendo executada na tabela correta

## 🎯 Diferenças Principais

### **Antes (Tabela Errada):**
- ❌ Tabela: `msg_aniversarios`
- ❌ Campo data: `created_at`
- ❌ Campo cliente: `mensagem`
- ❌ Campo whatsApp: `url_foto`

### **Depois (Tabela Correta):**
- ✅ Tabela: `relatorio_niver_decor_fabril`
- ✅ Campo data: `criado_em`
- ✅ Campo cliente: `cliente`
- ✅ Campo whatsApp: `whatsApp`
- ✅ Campo status: `obs` (observações)

## 🎉 Resultado Esperado

Após a correção, o modal de aniversários deve:
- ✅ **Carregar dados** da tabela correta `relatorio_niver_decor_fabril`
- ✅ **Filtrar por empresa** do usuário logado
- ✅ **Exibir campos corretos** (cliente, whatsApp, obs como status, etc.)
- ✅ **Funcionar com paginação** e todos os recursos existentes
- ✅ **Manter compatibilidade** com geração de PDF

Agora o modal está conectado à tabela correta e deve funcionar perfeitamente! 🚀