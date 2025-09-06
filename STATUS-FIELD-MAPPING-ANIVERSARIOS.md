# Mapeamento do Campo Status para Aniversários

## 🎯 Objetivo
Simplificar os campos de relatório de aniversários substituindo "mensagem_entrege" e "mensagem_perdida" por um único campo "status" que mapeia para a coluna "observações" do banco de dados.

## ✅ Alterações Implementadas

### 1. **Campos Disponíveis para Aniversários**

#### **Antes:**
```typescript
const availableFields = [
  { id: "mensagem_entrege", label: "Mensagem Entregue", description: "Mensagem que foi entregue" },
  { id: "mensagem_perdida", label: "Mensagem Perdida", description: "Mensagem que foi perdida" },
  { id: "obs", label: "Observações", description: "Observações adicionais" },
  // outros campos...
]
```

#### **Depois:**
```typescript
const availableFields = [
  { id: "status", label: "Status", description: "Status do envio (observações)" },
  // outros campos... (mensagem_entrege, mensagem_perdida e obs removidos)
]
```

### 2. **Campos Selecionados por Padrão**

#### **Aniversários - Antes:**
```typescript
const [selectedFields, setSelectedFields] = useState<string[]>([
  "criado_em", "cliente", "whatsApp", "rede", "loja", "mensagem_entrege"
])
```

#### **Aniversários - Depois:**  
```typescript
const [selectedFields, setSelectedFields] = useState<string[]>([
  "criado_em", "cliente", "whatsApp", "rede", "loja", "status"
])
```

#### **Cashback - Antes:**
```typescript
const [selectedCashbackFields, setSelectedCashbackFields] = useState<string[]>([
  "Envio_novo", "Nome", "Whatsapp", "Rede_de_loja", "Loja"
])
```

#### **Cashback - Depois:**
```typescript
const [selectedCashbackFields, setSelectedCashbackFields] = useState<string[]>([
  "Envio_novo", "Nome", "Whatsapp", "Rede_de_loja", "Loja", "Status"
])
```

### 3. **Mapeamento de Campos na API de Aniversários**

```typescript
// Mapear campos da interface para colunas do banco
const mapFieldToColumn = (field: string): string => {
  const fieldMapping: Record<string, string> = {
    'status': 'observações',  // ← Mapeamento principal
    'criado_em': 'criado_em',
    'cliente': 'cliente', 
    'whatsApp': 'whatsApp',
    'rede': 'rede',
    'loja': 'loja',
    'Sub_Rede': 'Sub_Rede'
  }
  return fieldMapping[field] || field
}

// Mapear campos selecionados para colunas do banco
const mappedFields = selectedFields.map(mapFieldToColumn)
```

### 4. **Campo Status como Obrigatório**

```typescript
// Campo status configurado como obrigatório (não pode ser desmarcado)
const availableFields = [
  { id: "status", label: "Status", description: "Status do envio (observações)", disabled: true },
  { id: "rede", label: "Rede", description: "Rede do usuário", disabled: true },
  // outros campos...
]

// Função de toggle protege campos obrigatórios (Aniversários)
const toggleField = (fieldId: string) => {
  // Não permitir desmarcar a rede e status (sempre obrigatórios)
  if (fieldId === "rede" || fieldId === "status") return
  // resto da lógica...
}

// Função de toggle protege campos obrigatórios (Cashback)
const toggleCashbackField = (fieldId: string) => {
  // Não permitir desmarcar a rede e status (sempre obrigatórios)
  if (fieldId === "Rede_de_loja" || fieldId === "Status") return
  // resto da lógica...
}
```

### 5. **Uso dos Campos Mapeados**

```typescript
// Antes
const data = await getCustomBirthdayReport({
  selectedFields,  // ← Campos originais
  startDate,
  endDate,
  userNetwork
})

// Depois
const data = await getCustomBirthdayReport({
  selectedFields: mappedFields,  // ← Campos mapeados
  startDate,
  endDate,
  userNetwork
})
```

## 🔧 Como Funciona

### **Fluxo do Mapeamento:**
1. **Frontend:** Usuário seleciona campo "status"
2. **API:** Campo "status" é mapeado para "observações"
3. **Banco:** Query busca dados da coluna "observações"
4. **Resposta:** Dados retornados com a chave "observações"
5. **Frontend:** Modal exibe dados na coluna "Status"

### **Exemplo Prático:**
```typescript
// Campos selecionados pelo usuário
selectedFields = ["cliente", "status", "whatsApp"]

// Campos mapeados para o banco
mappedFields = ["cliente", "observações", "whatsApp"]

// Query executada
SELECT cliente, observações, whatsApp FROM relatorio_niver_decor_fabril

// Dados retornados
[
  { cliente: "João", observações: "Mensagem enviada", whatsApp: "11999999999" },
  { cliente: "Maria", observações: "Falha no envio", whatsApp: "11888888888" }
]
```

## 🎯 Benefícios

### **Simplificação:**
- ✅ **1 campo** ao invés de 3 (mensagem_entrege + mensagem_perdida + obs)
- ✅ **Interface mais limpa** e intuitiva
- ✅ **Menos confusão** para o usuário (campo "status" é mais claro que "observações")
- ✅ **API mais leve** (menos campos para buscar)
- ✅ **Evita duplicação** (obs e status apontavam para a mesma coluna)
- ✅ **Campo obrigatório** - Status sempre presente (não pode ser desmarcado)

### **Consistência:**
- ✅ **Mesmo padrão** para aniversários e cashback
- ✅ **Campo "Status"** sempre presente por padrão
- ✅ **Nomenclatura padronizada** em todo o sistema

### **Performance:**
- ✅ **Menos campos** na query = menos dados transferidos
- ✅ **Query mais simples** = execução mais rápida
- ✅ **Menos processamento** no frontend

## 📊 Estrutura dos Dados

### **Tabela de Aniversários:**
```sql
-- Coluna no banco de dados
observações TEXT  -- Contém status como "Mensagem enviada", "Falha no envio", etc.
```

### **Interface Unificada:**
```typescript
// Ambos os relatórios mostram campo "Status"
fieldLabels = {
  "status": "Status"  // Para aniversários (mapeia para observações)
}
```

## 🧪 Como Testar

### **Teste de Aniversários:**
1. Acesse a página de relatórios
2. Verifique que há apenas 1 campo "Status" (não mais mensagem_entrege/perdida/obs)
3. Confirme que "Status" está selecionado por padrão e **não pode ser desmarcado**
4. Tente clicar no checkbox "Status" - deve permanecer marcado
5. Gere o relatório e verifique que mostra dados da coluna "observações"
6. Confirme que não há mais campo "Observações" duplicado

### **Teste de Cashback:**
1. Acesse a página de relatórios
2. Abra as configurações do relatório de cashback
3. Confirme que "Status" está selecionado por padrão e **não pode ser desmarcado**
4. Tente clicar no checkbox "Status" - deve permanecer marcado
5. Gere o relatório e verifique que mostra dados da coluna "Status"

### **Verificação no Console:**
```javascript
// Deve mostrar campos mapeados
console.log('Campos mapeados:', mappedFields)
// Exemplo: ["cliente", "observações", "whatsApp"] ao invés de ["cliente", "status", "whatsApp"]
```

## 🎉 Resultado Final

Agora ambos os relatórios (aniversários e cashback) têm:
- ✅ **Campo "Status" sempre selecionado** por padrão
- ✅ **Interface simplificada** sem campos redundantes
- ✅ **Mapeamento transparente** para as colunas corretas do banco
- ✅ **Performance otimizada** com menos campos desnecessários
- ✅ **Experiência consistente** entre diferentes tipos de relatório
- ✅ **Campos obrigatórios protegidos** - não podem ser desmarcados

O sistema está mais limpo, rápido e fácil de usar! 🚀