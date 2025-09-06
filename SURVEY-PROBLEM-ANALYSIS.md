# Análise do Problema - Filtro de Pesquisas

## 🚨 Problemas Identificados

### 1. **API não está sendo chamada (sem logs)**
### 2. **Filtro não está funcionando**
### 3. **Modal pode não estar fazendo requisição**

## 🔍 Possíveis Causas (em ordem de probabilidade)

### **MAIS PROVÁVEL - Problema no useEffect do Modal**

**Causa:** O `responseFilter` não está nas dependências do `useEffect`
```typescript
// PROBLEMA: responseFilter não está nas dependências
useEffect(() => {
  if (isOpen) {
    fetchSurveyData()
  }
}, [isOpen, startDate, endDate, selectedFields]) // ← responseFilter FALTANDO
```

**Solução:** Adicionar `responseFilter` nas dependências
```typescript
useEffect(() => {
  if (isOpen) {
    fetchSurveyData()
  }
}, [isOpen, startDate, endDate, selectedFields, responseFilter]) // ← CORRIGIDO
```

### **SEGUNDA MAIS PROVÁVEL - Modal não está passando responseFilter**

**Causa:** O `fetchSurveyData` não está usando o `responseFilter`
```typescript
// PROBLEMA: responseFilter não está sendo enviado
const requestData = {
  selectedFields,
  startDate,
  endDate
  // responseFilter FALTANDO
}
```

**Solução:** Incluir responseFilter na requisição
```typescript
const requestData = {
  selectedFields,
  startDate,
  endDate,
  responseFilter // ← ADICIONAR
}
```

### **TERCEIRA MAIS PROVÁVEL - Problema de Autenticação**

**Causa:** Cookie de sessão não está sendo enviado
- API retorna 401 (não autenticado)
- Logs não aparecem porque API falha antes

**Verificação:** Checar se cookie `ps_session` existe

### **QUARTA MAIS PROVÁVEL - Rota da API Incorreta**

**Causa:** URL da API está errada
- Frontend chama `/api/reports/survey`
- Mas arquivo está em local diferente

**Verificação:** Confirmar se arquivo está em `app/api/reports/survey/route.ts`

### **QUINTA MAIS PROVÁVEL - Problema de Build/Cache**

**Causa:** Código não foi atualizado
- Build antigo em cache
- Hot reload não funcionou

**Solução:** Restart do servidor de desenvolvimento

## 🧪 Testes para Identificar a Causa

### **Teste 1: API Direta (mais importante)**
```javascript
// Cole no console do navegador:
fetch('/api/reports/survey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    selectedFields: ['nome', 'telefone', 'resposta'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    responseFilter: '2'
  })
}).then(r => r.json()).then(console.log).catch(console.error)
```

**Resultados possíveis:**
- ✅ **Logs aparecem**: Problema é no modal
- ❌ **401 Unauthorized**: Problema de autenticação
- ❌ **404 Not Found**: Problema de rota
- ❌ **500 Error**: Problema na API

### **Teste 2: Verificar Modal**
```javascript
// Cole no console:
runAllTests() // Usar o arquivo debug-survey-issue.js
```

### **Teste 3: Verificar Dependências do useEffect**
- Abrir DevTools
- Ir em Sources
- Procurar `survey-preview-modal.tsx`
- Verificar se `responseFilter` está nas dependências

### **Teste 4: Verificar Autenticação**
```javascript
// Cole no console:
document.cookie.split(';').find(c => c.includes('ps_session'))
```

## 🎯 Plano de Ação

### **Passo 1: Teste da API Direta**
Execute o Teste 1 acima. Se:
- **Funcionar**: Problema é no modal → Vá para Passo 2
- **Não funcionar**: Problema é na API → Vá para Passo 3

### **Passo 2: Corrigir Modal**
1. Adicionar `responseFilter` nas dependências do useEffect
2. Verificar se `responseFilter` está sendo enviado na requisição
3. Adicionar logs no `fetchSurveyData`

### **Passo 3: Corrigir API**
1. Verificar autenticação (cookie ps_session)
2. Verificar se arquivo está no local correto
3. Restart do servidor

## 📊 Diagnóstico Rápido

Execute este comando no console:
```javascript
// Diagnóstico completo
console.log('🔍 Cookie:', document.cookie.includes('ps_session'))
console.log('🔍 URL atual:', window.location.href)
fetch('/api/reports/survey', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({selectedFields: ['nome'], startDate: '2024-01-01', endDate: '2024-12-31', responseFilter: '2'})}).then(r => console.log('🔍 Status:', r.status)).catch(e => console.log('🔍 Erro:', e))
```

## 🎯 Minha Aposta

**90% de certeza:** O problema é que `responseFilter` não está nas dependências do `useEffect` do modal, então quando você muda o dropdown, o modal não faz uma nova requisição.

**Teste isso primeiro!** 👆