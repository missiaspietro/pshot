# Lista de Prioridades - Problema do Filtro de Pesquisas

## 🎯 **ORDEM DE TESTE (conforme solicitado)**

### **4ª - Problema de Rota da API** 
**TESTE PRIMEIRO: Reiniciar servidor**
- Causa: URL da API está incorreta ou arquivo não está no local certo
- Verificação: Confirmar se arquivo está em `app/api/reports/survey/route.ts`
- **Ação**: Reiniciar servidor e testar novamente

### **3ª - Problema de Autenticação**
**SE REINICIAR NÃO RESOLVER**
- Causa: Cookie `ps_session` não está sendo enviado ou é inválido
- API retorna 401 (não autenticado)
- Logs não aparecem porque API falha antes

**Teste:**
```javascript
// Verificar se cookie existe
document.cookie.split(';').find(c => c.includes('ps_session'))
```

### **2ª - Modal não está passando responseFilter**
**SE AUTENTICAÇÃO ESTIVER OK**
- Causa: O `fetchSurveyData` não está usando o `responseFilter`
- Modal faz requisição mas sem o filtro
- API recebe requisição mas responseFilter vem undefined/null

**Verificação:** Logs da API mostrarão `responseFilter: undefined`

### **1ª - useEffect sem responseFilter nas dependências**
**SE MODAL ESTIVER ENVIANDO FILTRO**
- Causa: `useEffect` não tem `responseFilter` nas dependências
- Quando muda dropdown, modal não faz nova requisição
- Primeira requisição funciona, mas mudanças no filtro são ignoradas

**Problema:**
```typescript
useEffect(() => {
  if (isOpen) {
    fetchSurveyData()
  }
}, [isOpen, startDate, endDate, selectedFields]) // ← responseFilter FALTANDO
```

## 🧪 **TESTE UNIVERSAL (para qualquer etapa)**

Execute no console para diagnosticar:
```javascript
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

## 📊 **INTERPRETAÇÃO DOS RESULTADOS**

### **✅ Se aparecerem logs da API:**
- **Problema**: Modal (opções 1 ou 2)
- **Próximo passo**: Verificar se responseFilter está sendo enviado

### **❌ Se der 401 Unauthorized:**
- **Problema**: Autenticação (opção 3)
- **Solução**: Verificar cookie ps_session

### **❌ Se der 404 Not Found:**
- **Problema**: Rota (opção 4)
- **Solução**: Verificar localização do arquivo da API

### **❌ Se der 500 Internal Server Error:**
- **Problema**: Erro na API
- **Solução**: Verificar logs do servidor

### **❌ Se der erro de rede:**
- **Problema**: Servidor não está rodando
- **Solução**: Reiniciar servidor

## 🎯 **PLANO DE AÇÃO**

1. **AGORA**: Reinicie o servidor
2. **TESTE**: Execute o comando JavaScript acima
3. **REPORTE**: Me diga qual resultado você obteve
4. **PRÓXIMO**: Vamos para a próxima opção na lista

## 📝 **PREPARAÇÃO PARA PRÓXIMAS ETAPAS**

Se o restart não resolver, já tenho as correções prontas para:
- ✅ Adicionar responseFilter no useEffect
- ✅ Corrigir envio do responseFilter na requisição  
- ✅ Verificar problemas de autenticação

**Vamos descobrir qual é o problema!** 🔍