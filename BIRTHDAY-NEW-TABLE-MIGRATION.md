# Migração para Nova Tabela de Aniversários

## 🎯 Objetivo
Conectar o modal de aniversários à nova tabela `msg_aniversarios` ao invés da tabela antiga `relatorio_niver_decor_fabril`, implementando autenticação por empresa/rede do usuário.

## 📊 Nova Estrutura da Tabela

### **Tabela: `msg_aniversarios`**
```sql
CREATE TABLE public.msg_aniversarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  mensagem text NULL,
  url_foto text NULL,
  loja text NULL,
  rede text NULL,
  "subRede" text NULL,
  bot text NULL,
  criador text NULL,
  status text NULL,
  CONSTRAINT msg_aniversarios_pkey PRIMARY KEY (id)
);
```

### **Mapeamento de Campos**

| Campo Interface | Campo Antigo | Campo Novo | Descrição |
|----------------|--------------|------------|-----------|
| `criado_em` | `criado_em` | `created_at` | Data de criação |
| `cliente` | `cliente` | `mensagem` | Mensagem de aniversário |
| `whatsApp` | `whatsApp` | `url_foto` | URL da foto |
| `status` | `observações` | `status` | Status do envio |
| `rede` | `rede` | `rede` | Rede da empresa |
| `loja` | `loja` | `loja` | Loja |
| `Sub_Rede` | `Sub_Rede` | `subRede` | Sub-rede |

## ✅ Alterações Implementadas

### 1. **API Route Atualizada (`app/api/reports/birthday/route.ts`)**

#### **Mapeamento de Campos:**
```typescript
const mapFieldToColumn = (field: string): string => {
  const fieldMapping: Record<string, string> = {
    'status': 'status',           // Status do envio
    'criado_em': 'created_at',    // Data de criação
    'cliente': 'mensagem',        // Mensagem de aniversário
    'whatsApp': 'url_foto',       // URL da foto
    'rede': 'rede',              // Rede da empresa
    'loja': 'loja',              // Loja
    'Sub_Rede': 'subRede'        // Sub-rede
  }
  return fieldMapping[field] || field
}
```

#### **Query Direta na Nova Tabela:**
```typescript
// Construir query para a nova tabela msg_aniversarios
let query = supabase
  .from('msg_aniversarios')
  .select(mappedFields.join(', '))
  .eq('rede', userNetwork) // Filtrar pela rede do usuário

// Aplicar filtros de data
if (startDate) {
  query = query.gte('created_at', startDate)
}

if (endDate) {
  const endDateTime = new Date(endDate)
  endDateTime.setHours(23, 59, 59, 999)
  query = query.lte('created_at', endDateTime.toISOString())
}

// Ordenar por data (mais recentes primeiro)
query = query.order('created_at', { ascending: false })
```

#### **Autenticação por Empresa:**
```typescript
// Buscar dados do usuário autenticado
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('id, email, nome, empresa, rede, sistema')
  .eq('email', email)
  .eq('sistema', 'Praise Shot')
  .single()

// Determinar rede do usuário (priorizar 'rede', depois 'empresa')
const userNetwork = userData.rede || userData.empresa

// Filtrar dados apenas da rede do usuário
.eq('rede', userNetwork)
```

### 2. **Campos Atualizados na Interface (`app/reports/page.tsx`)**

#### **Antes (Tabela Antiga):**
```typescript
const availableFields = [
  { id: "cliente", label: "Cliente", description: "Nome do cliente" },
  { id: "whatsApp", label: "WhatsApp", description: "Número do WhatsApp" },
  // ...
]
```

#### **Depois (Nova Tabela):**
```typescript
const availableFields = [
  { id: "cliente", label: "Mensagem", description: "Mensagem de aniversário" },
  { id: "whatsApp", label: "URL da Foto", description: "URL da foto de aniversário" },
  // ...
]
```

### 3. **Logs e Debug Melhorados**

#### **Logs Específicos:**
```typescript
console.log('🔄 API de Aniversários - Nova tabela msg_aniversarios:', { selectedFields, mappedFields, startDate, endDate })
console.log('🎯 Buscando dados na tabela msg_aniversarios para empresa:', userNetwork)
console.log('🔍 Executando query na tabela msg_aniversarios...')
console.log('📈 Dados obtidos da msg_aniversarios:', data?.length || 0, 'registros')
```

#### **Investigação de Dados Vazios:**
```typescript
if (!data || data.length === 0) {
  // Verificar se há dados na tabela para esta rede
  const { data: allDataForNetwork } = await supabase
    .from('msg_aniversarios')
    .select('id, rede, created_at')
    .eq('rede', userNetwork)
    .limit(5)
  
  // Verificar quais redes existem na tabela
  const { data: availableNetworks } = await supabase
    .from('msg_aniversarios')
    .select('rede')
    .not('rede', 'is', null)
    .limit(10)
}
```

## 🔧 Fluxo de Funcionamento

### **1. Autenticação:**
1. Extrair email do cookie de sessão
2. Buscar dados do usuário na tabela `users`
3. Determinar rede/empresa do usuário
4. Validar permissões

### **2. Busca de Dados:**
1. Mapear campos da interface para colunas da nova tabela
2. Construir query com filtro por rede do usuário
3. Aplicar filtros de data se fornecidos
4. Ordenar por data de criação (mais recentes primeiro)
5. Executar query na tabela `msg_aniversarios`

### **3. Resposta:**
1. Retornar dados filtrados por empresa
2. Incluir informações de debug (total, rede, etc.)
3. Indicar fonte dos dados (`source: 'msg_aniversarios'`)

## 🧪 Como Testar

### **1. Teste Básico:**
```bash
# Executar script de teste
node test-birthday-new-table.js
```

### **2. Teste no Modal:**
1. Fazer login com usuário que tem empresa/rede definida
2. Abrir modal de aniversários
3. Verificar se dados são carregados
4. Confirmar que apenas dados da empresa do usuário aparecem

### **3. Verificar Logs:**
1. Abrir DevTools → Console
2. Procurar logs com prefixo "🔄 API de Aniversários"
3. Verificar se rede do usuário está sendo detectada
4. Confirmar que query está sendo executada corretamente

## 🎯 Benefícios da Migração

### **Segurança:**
- ✅ **Filtro por empresa** - Usuário só vê dados da sua empresa
- ✅ **Autenticação rigorosa** - Validação de sessão e permissões
- ✅ **Isolamento de dados** - Cada empresa vê apenas seus dados

### **Performance:**
- ✅ **Query direta** - Sem necessidade de serviço intermediário
- ✅ **Filtros otimizados** - Filtro por rede aplicado no banco
- ✅ **Índices eficientes** - Query otimizada por rede e data

### **Manutenibilidade:**
- ✅ **Código mais simples** - Menos camadas de abstração
- ✅ **Logs detalhados** - Debug facilitado
- ✅ **Estrutura clara** - Mapeamento explícito de campos

## 🚨 Pontos de Atenção

### **1. Dados de Teste:**
- Verificar se há dados na tabela `msg_aniversarios`
- Confirmar que campo `rede` está preenchido
- Validar que rede do usuário corresponde aos dados

### **2. Mapeamento de Campos:**
- Campo `cliente` agora mapeia para `mensagem`
- Campo `whatsApp` agora mapeia para `url_foto`
- Campo `status` mapeia diretamente para `status`

### **3. Filtros de Data:**
- Data final inclui todo o dia (23:59:59)
- Formato de data deve ser ISO string
- Timezone considerado na comparação

## 🎉 Resultado Esperado

Após a migração, o modal de aniversários deve:
- ✅ **Carregar dados** da nova tabela `msg_aniversarios`
- ✅ **Filtrar por empresa** do usuário logado
- ✅ **Exibir campos corretos** (mensagem, url_foto, status, etc.)
- ✅ **Funcionar com paginação** e todos os recursos existentes
- ✅ **Manter compatibilidade** com geração de PDF

A experiência do usuário permanece a mesma, mas agora com dados seguros e filtrados por empresa! 🚀