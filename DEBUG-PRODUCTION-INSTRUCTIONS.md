# 🔍 Instruções para Debug do Problema de QR Code em Produção

## 🎯 **Objetivo**
Identificar por que a função `handleGenerateQRCode` não está sendo executada em produção (não aparece o console.log inicial), enquanto funciona normalmente em desenvolvimento local.

## 🛠️ **Ferramentas de Debug Criadas**

### 1. **Script de Debug no Browser** (`debug-production-click.js`)
- Monitora cliques nos botões
- Verifica elementos DOM
- Intercepta requisições de rede
- Detecta erros JavaScript

### 2. **Componente de Debug React** (`components/debug-production-qrcode.tsx`)
- Interface visual para debug
- Testes interativos
- Logs em tempo real
- Simulação de cliques

### 3. **Página com Debug Integrado** (`debug-robots-page-with-debug.tsx`)
- Versão da página de robôs com debug
- Logs detalhados na função `handleGenerateQRCode`
- Componente de debug integrado

## 🚀 **Como Usar as Ferramentas**

### **Método 1: Script no Console do Browser**

1. **Acesse a produção**: https://pshot.praisechat.com.br/robots
2. **Abra o DevTools** (F12)
3. **Vá para a aba Console**
4. **Cole e execute o script**:
   ```javascript
   // Cole o conteúdo completo do arquivo debug-production-click.js
   // Ou execute diretamente:
   window.productionDebug.runProductionDebug()
   ```
5. **Analise os logs** para identificar problemas

### **Método 2: Componente de Debug Temporário**

1. **Substitua temporariamente** o arquivo `app/robots/page.tsx` pelo conteúdo de `debug-robots-page-with-debug.tsx`
2. **Faça o deploy** da versão com debug
3. **Acesse a página** em produção
4. **Use a interface de debug** no topo da página
5. **Execute os testes** e analise os resultados
6. **IMPORTANTE**: Remova o debug após identificar o problema

### **Método 3: Debug Manual no Console**

Execute estes comandos no console do browser em produção:

```javascript
// 1. Verificar ambiente
console.log('Ambiente:', {
  url: window.location.href,
  hostname: window.location.hostname,
  webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL
});

// 2. Verificar botões
const buttons = document.querySelectorAll('button');
const qrButtons = Array.from(buttons).filter(btn => 
  btn.textContent?.toLowerCase().includes('qr') || 
  btn.textContent?.toLowerCase().includes('gerar')
);
console.log('Botões de QR Code encontrados:', qrButtons.length);

// 3. Simular clique
if (qrButtons.length > 0) {
  console.log('Simulando clique...');
  qrButtons[0].click();
}

// 4. Testar API diretamente
fetch('/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: "teste-debug",
    token: "teste",
    qrcode: true,
    integration: "WHATSAPP-BAILEYS"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

## 🔍 **Possíveis Causas do Problema**

### **1. Problemas de JavaScript**
- Erros que impedem a execução da função
- Problemas de bundling/minificação
- Conflitos de dependências

### **2. Problemas de Event Listeners**
- Botões não têm event listeners anexados
- Problemas com React event handling
- Conflitos de CSS que impedem cliques

### **3. Problemas de Ambiente**
- Diferenças nas variáveis de ambiente
- Problemas de build/deploy
- Configurações de produção diferentes

### **4. Problemas de Rede/Segurança**
- CSP (Content Security Policy) bloqueando execução
- CORS issues
- Proxy/Load balancer interferindo

### **5. Problemas de Estado React**
- Componente não renderizando corretamente
- Estado não sendo inicializado
- Problemas de hidratação SSR

## 📊 **O Que Procurar nos Logs**

### **Logs Esperados (Funcionando)**
```
🚀 [DEBUG] Iniciando geração de QR Code para: nome-do-bot
🚀 [DEBUG] Timestamp: 2025-01-09T...
🚀 [DEBUG] User: {...}
📋 [DEBUG] Dados do bot: {...}
📤 [DEBUG] Enviando requisição: {...}
```

### **Logs de Problema**
```
❌ Erro JavaScript capturado: {...}
❌ Promise rejeitada capturada: {...}
❌ Botão não encontrado ou desabilitado
❌ Event listener não anexado
❌ Erro de rede: {...}
```

## 🎯 **Checklist de Investigação**

### **Verificações Básicas**
- [ ] Página carrega sem erros no console
- [ ] Botões de QR Code são renderizados
- [ ] Botões não estão desabilitados
- [ ] Event listeners estão anexados
- [ ] Variáveis de ambiente estão corretas

### **Verificações de Rede**
- [ ] API `/api/webhook` responde
- [ ] Webhook externo está acessível
- [ ] Não há bloqueios de CORS/CSP
- [ ] Headers de requisição estão corretos

### **Verificações de Estado**
- [ ] Usuário está autenticado
- [ ] Dados dos bots são carregados
- [ ] Estado do React está correto
- [ ] Não há erros de hidratação

## 🔧 **Soluções Possíveis**

### **Se for problema de JavaScript:**
```javascript
// Verificar se há erros não capturados
window.addEventListener('error', console.error);
window.addEventListener('unhandledrejection', console.error);
```

### **Se for problema de Event Listeners:**
```javascript
// Anexar listener manualmente
document.querySelectorAll('button').forEach(btn => {
  if (btn.textContent?.includes('QR')) {
    btn.addEventListener('click', () => {
      console.log('Clique manual capturado');
    });
  }
});
```

### **Se for problema de Estado:**
```javascript
// Verificar estado do React (se React DevTools estiver disponível)
// Ou forçar re-render do componente
```

## 📝 **Relatório de Debug**

Após executar os testes, documente:

1. **Ambiente testado**: URL, browser, versão
2. **Ferramentas usadas**: Qual método de debug
3. **Logs capturados**: Console outputs relevantes
4. **Erros encontrados**: JavaScript, rede, etc.
5. **Comportamento observado**: O que acontece vs. esperado
6. **Hipótese da causa**: Baseada nas evidências
7. **Próximos passos**: Como resolver o problema

## ⚠️ **Importante**

- **SEMPRE REMOVER** componentes de debug após identificar o problema
- **NÃO DEIXAR** logs de debug em produção permanentemente
- **TESTAR** a correção em ambiente de desenvolvimento primeiro
- **DOCUMENTAR** a solução para problemas futuros

## 🎯 **Próximos Passos Após Identificar o Problema**

1. **Implementar a correção** no código
2. **Testar localmente** para confirmar
3. **Fazer deploy** da correção
4. **Validar** em produção
5. **Remover** ferramentas de debug
6. **Documentar** a solução

---

**Status**: 🔍 **FERRAMENTAS DE DEBUG PRONTAS PARA USO**

Execute os testes e reporte os resultados para identificar a causa raiz do problema.