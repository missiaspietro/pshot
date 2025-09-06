# Teste de Autenticação - Instruções

## 🔐 **COMO TESTAR A 3ª OPÇÃO (Autenticação)**

### **Método 1: Teste Automático**
1. **Abra o console** (F12)
2. **Cole e execute**:
```javascript
// Carregar o arquivo de teste
const script = document.createElement('script');
script.src = '/test-authentication.js';
document.head.appendChild(script);
```
3. **Aguarde** os resultados automáticos

### **Método 2: Teste Manual**
**Cole no console:**
```javascript
// Verificar cookie
console.log('Cookie ps_session:', document.cookie.split(';').find(c => c.includes('ps_session')))

// Testar API
fetch('/api/reports/survey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    selectedFields: ['nome'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    responseFilter: '2'
  })
}).then(r => console.log('Status:', r.status)).catch(console.error)
```

## 📊 **RESULTADOS POSSÍVEIS**

### **✅ Se Status = 200:**
- **Autenticação OK** ✅
- **Problema NÃO é autenticação**
- **Vamos para opção 2**

### **❌ Se Status = 401:**
- **PROBLEMA DE AUTENTICAÇÃO CONFIRMADO** ❌
- **Causa**: Cookie ps_session ausente/inválido
- **Solução**: Usuário precisa fazer login novamente

### **❌ Se Status = 404:**
- **PROBLEMA DE USUÁRIO NO BANCO** ❌
- **Causa**: Email não existe na tabela users
- **Solução**: Verificar banco de dados

### **❌ Se der erro de rede:**
- **PROBLEMA DE CONEXÃO** ❌
- **Causa**: Servidor não responde
- **Solução**: Verificar se servidor está rodando

## 🔍 **LOGS ESPERADOS (se autenticação OK)**

No console do navegador:
```
🚀 === INÍCIO DA API DE PESQUISAS ===
🔐 Cookies recebidos: Sim
🔐 Cookies (primeiros 100 chars): ps_session=user@example.com_abc123...
👤 Email da sessão: user@example.com
✅ Usuário encontrado: {...}
```

## 🔍 **LOGS ESPERADOS (se problema de autenticação)**

No console do navegador:
```
🚀 === INÍCIO DA API DE PESQUISAS ===
🔐 Cookies recebidos: Não
❌ Nenhuma sessão encontrada
❌ Cookies disponíveis: (vazio ou sem ps_session)
```

## 🎯 **PRÓXIMOS PASSOS**

### **Se autenticação estiver OK:**
- ✅ Eliminamos a opção 3
- ➡️ **Vamos para opção 2**: Modal não envia responseFilter

### **Se autenticação estiver com problema:**
- ❌ **PROBLEMA ENCONTRADO!**
- 🔧 **Solução**: Usuário fazer login novamente
- 🔧 **Ou**: Verificar se usuário existe no banco

## 🚀 **EXECUTE AGORA**

**Cole no console e me diga o resultado:**
```javascript
fetch('/api/reports/survey', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({selectedFields: ['nome'], startDate: '2024-01-01', endDate: '2024-12-31', responseFilter: '2'})}).then(r => console.log('🔐 Status:', r.status, r.ok ? '✅ OK' : '❌ ERRO')).catch(e => console.log('🔐 Erro:', e))
```

**Me diga qual status você obteve!** 🔍