# Correção do Filtro de Resposta de Pesquisas

## Problema Identificado

O filtro de resposta não estava funcionando porque estava assumindo valores numéricos (1, 2, 3, 4) na coluna `resposta`, quando na verdade a tabela `respostas_pesquisas` armazena valores de texto.

## Estrutura da Tabela

```sql
create table public.respostas_pesquisas (
  id uuid not null default gen_random_uuid(),
  criado_em timestamp with time zone not null default now(),
  telefone text null,
  nome text null,
  resposta text null,  -- ← COLUNA DE TEXTO, não numérica
  loja text null,
  rede text null,
  sub_rede text null,
  passo numeric null,
  pergunta text null,
  vendedor text null,
  data_de_envio date null,
  data_text text null,
  caixa text null,
  constraint relatorio_respostas_pesquisas_pkey primary key (id)
)
```

## Correção Implementada

### 1. Mapeamento Correto no Backend

**Arquivo**: `app/api/reports/survey/route.ts`

```typescript
// Mapear valores do dropdown para valores do banco de dados
const responseMapping: { [key: string]: string } = {
  '1': 'Ótimo',    // Dropdown "Apenas ótimas" → DB "Ótimo"
  '2': 'Bom',      // Dropdown "Apenas boas" → DB "Bom"
  '3': 'Regular',  // Dropdown "Apenas regulares" → DB "Regular"
  '4': 'Péssimo'   // Dropdown "Apenas péssimas" → DB "Péssimo"
}

const dbValue = responseMapping[responseFilter]
if (dbValue) {
  query = query.eq('resposta', dbValue)
  console.log('🔍 Filtro de resposta aplicado:', responseFilter, '→', dbValue)
}
```

### 2. Logs Detalhados Adicionados

Para debug e verificação dos valores reais no banco:

```typescript
console.log('📊 DADOS BRUTOS DO BANCO DE DADOS:')
console.log('📊 Total de registros encontrados:', data?.length || 0)

if (data && data.length > 0) {
  console.log('📊 Primeiros 3 registros completos:')
  data.slice(0, 3).forEach((item, index) => {
    console.log(`📊 Registro ${index + 1}:`, JSON.stringify(item, null, 2))
  })
  
  // Verificar especificamente os valores da coluna 'resposta'
  if (selectedFields.includes('resposta')) {
    const respostasUnicas = [...new Set(data.map(item => item.resposta).filter(r => r !== null && r !== undefined))]
    console.log('📊 VALORES ÚNICOS na coluna RESPOSTA:', respostasUnicas)
    console.log('📊 Tipos dos valores de resposta:', respostasUnicas.map(r => `"${r}" (${typeof r})`))
  }
}
```

## Como Funciona Agora

### Fluxo do Filtro

1. **Usuário seleciona no dropdown**: "Apenas boas"
2. **Frontend envia**: `responseFilter: "2"`
3. **Backend mapeia**: `"2"` → `"Bom"`
4. **Query SQL**: `WHERE resposta = 'Bom'`
5. **Resultado**: Apenas registros com resposta "Bom"

### Mapeamento Completo

| Dropdown | Valor Enviado | Valor no DB | Query SQL |
|----------|---------------|-------------|-----------|
| Todas | `""` | - | Sem filtro |
| Apenas ótimas | `"1"` | `"Ótimo"` | `WHERE resposta = 'Ótimo'` |
| Apenas boas | `"2"` | `"Bom"` | `WHERE resposta = 'Bom'` |
| Apenas regulares | `"3"` | `"Regular"` | `WHERE resposta = 'Regular'` |
| Apenas péssimas | `"4"` | `"Péssimo"` | `WHERE resposta = 'Péssimo'` |

## Verificação

Para verificar se está funcionando:

1. **Abra o console do navegador** (F12)
2. **Acesse a página de relatórios**
3. **Marque o checkbox "Resposta"**
4. **Selecione um filtro** (ex: "Apenas boas")
5. **Clique em "Preview"**
6. **Verifique os logs no console**:
   - `🔍 Filtro de resposta aplicado: 2 → Bom`
   - `📊 VALORES ÚNICOS na coluna RESPOSTA: ["Bom", "Ótimo", ...]`

## Possíveis Valores no Banco

Com base nos logs, os valores reais podem ser:
- `"Ótimo"` ou `"Otimo"` (com/sem acento)
- `"Bom"`
- `"Regular"`
- `"Péssimo"` ou `"Pessimo"` (com/sem acento)
- Ou outras variações

Os logs nos dirão exatamente quais valores existem no banco para ajustarmos o mapeamento se necessário.

## Status

✅ **Correção implementada**
🔍 **Logs adicionados para verificação**
⏳ **Aguardando teste para confirmar valores do banco**