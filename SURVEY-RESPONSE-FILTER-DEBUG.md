# Debug do Filtro de Resposta das Pesquisas

## Problema Identificado
O filtro de resposta no dropdown das pesquisas não está funcionando corretamente. O usuário seleciona uma opção no dropdown (1-Ótimo, 2-Bom, 3-Regular, 4-Péssimo), mas a consulta não está filtrando os dados corretamente.

## Análise do Fluxo

### 1. Frontend (Página de Relatórios)
- ✅ Dropdown implementado corretamente
- ✅ Estado `surveyResponseFilter` sendo atualizado
- ✅ Valor sendo passado para o modal

### 2. Modal de Preview
- ✅ Recebe o `responseFilter` como prop
- ✅ Passa o filtro na requisição para a API

### 3. API de Pesquisas
- ✅ Recebe o `responseFilter` no body
- ✅ Aplica o filtro na query do Supabase
- ❓ **Possível problema**: Lógica de validação ou tipo de dados

## Logs Detalhados Implementados

### Na API (`app/api/reports/survey/route.ts`)
```javascript
// Logs do filtro recebido
console.log('🔍 Filtro de resposta recebido:', responseFilter)
console.log('🔍 Tipo do filtro de resposta:', typeof responseFilter)

// Logs da aplicação do filtro
console.log('🔍 Verificando se deve aplicar filtro de resposta...')
console.log('✅ Filtro de resposta aplicado com sucesso:', responseFilter, '→', filterValue)

// Logs da resposta
console.log('🚀 DETALHES DO FILTRO NA RESPOSTA:')
console.log('🚀 responseFilter original:', responseFilter)
console.log('🚀 filtered calculado:', responseData.filtered)
```

### No Modal (`components/ui/survey-preview-modal.tsx`)
```javascript
// Logs da requisição
console.log('🔍 [MODAL] Filtro de resposta:', responseFilter)
console.log('🔍 [MODAL] Tipo do filtro de resposta:', typeof responseFilter)
console.log('🔍 [MODAL] JSON.stringify do requestData:', JSON.stringify(requestData, null, 2))
```

## Script de Teste Criado

### `test-survey-response-filter.js`
- Testa diferentes valores de filtro
- Verifica se a API está recebendo corretamente
- Mostra os dados retornados para cada filtro
- Testa casos extremos (valores inválidos, null, undefined)

## Como Usar o Script de Teste

1. **Abra o console do navegador**
2. **Cole o conteúdo do arquivo `test-survey-response-filter.js`**
3. **Pressione Enter**
4. **Observe os resultados dos testes**

## Possíveis Causas do Problema

### 1. Tipo de Dados Incorreto
- O filtro pode estar sendo enviado como string mas esperado como número
- Ou vice-versa

### 2. Validação Muito Restritiva
- A validação `[1, 2, 3, 4].includes(filterValue)` pode estar falhando
- Problema na conversão `parseInt(responseFilter)`

### 3. Query do Supabase
- O campo `resposta` no banco pode ter tipo diferente do esperado
- Valores podem estar armazenados como string no banco

### 4. Lógica de Filtro
- A condição `responseFilter && responseFilter !== ""` pode estar falhando
- Problema na construção da query

## Próximos Passos

1. **Execute o script de teste** para ver exatamente o que está acontecendo
2. **Verifique os logs detalhados** no console
3. **Compare os valores enviados vs recebidos**
4. **Verifique o tipo de dados no banco de dados**

## Estrutura do Dropdown

```javascript
const responseOptions = [
  { value: "", label: "Todas" },           // Sem filtro
  { value: "1", label: "Apenas ótimas" },  // Resposta = 1
  { value: "2", label: "Apenas boas" },    // Resposta = 2
  { value: "3", label: "Apenas regulares" }, // Resposta = 3
  { value: "4", label: "Apenas péssimas" }   // Resposta = 4
]
```

## Mapeamento Esperado
- **1** = Ótimo
- **2** = Bom  
- **3** = Regular
- **4** = Péssimo

Execute o script de teste e me informe os resultados para identificar o problema específico!