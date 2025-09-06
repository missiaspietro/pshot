# 🔧 Correção do Problema de QR Code em Produção

## 🔍 **Problema Identificado**

A tela de robôs estava gerando QR codes normalmente em **desenvolvimento local**, mas **não funcionava em produção**. A requisição POST nem sequer era enviada.

### **Causa Raiz: Loop Infinito na URL do Webhook**

**Configuração Incorreta em Produção:**
```yaml
# docker-compose.yml (ANTES - INCORRETO)
NEXT_PUBLIC_WEBHOOK_URL=https://pshot.praisechat.com.br/api/webhook
```

**Configuração Correta em Local:**
```bash
# .env.local (CORRETO)
NEXT_PUBLIC_WEBHOOK_URL=https://praisewhk.praisesistemas.uk/webhook/criarqrpshot
```

### **Fluxo do Problema:**

```
❌ PRODUÇÃO (ANTES):
Frontend → /api/webhook → https://pshot.praisechat.com.br/api/webhook → LOOP INFINITO

✅ LOCAL (FUNCIONANDO):
Frontend → /api/webhook → https://praisewhk.praisesistemas.uk/webhook/criarqrpshot → Webhook Externo
```

## 🛠️ **Solução Implementada**

### **1. Correção no docker-compose.yml**
```yaml
# ANTES (INCORRETO)
- NEXT_PUBLIC_WEBHOOK_URL=https://pshot.praisechat.com.br/api/webhook

# DEPOIS (CORRETO)
- NEXT_PUBLIC_WEBHOOK_URL=https://praisewhk.praisesistemas.uk/webhook/criarqrpshot
```

### **2. Correção no Dockerfile**
```dockerfile
# ANTES (INCORRETO)
ENV NEXT_PUBLIC_WEBHOOK_URL=https://pshot.praisechat.com.br/api/webhook

# DEPOIS (CORRETO)
ENV NEXT_PUBLIC_WEBHOOK_URL=https://praisewhk.praisesistemas.uk/webhook/criarqrpshot
```

## 📋 **Como a Correção Funciona**

### **Fluxo Correto Após a Correção:**
1. **Frontend** clica em "Gerar QR Code"
2. **Frontend** chama `/api/webhook` (API local)
3. **API Local** (`app/api/webhook/route.ts`) lê `NEXT_PUBLIC_WEBHOOK_URL`
4. **API Local** redireciona para `https://praisewhk.praisesistemas.uk/webhook/criarqrpshot`
5. **Webhook Externo** processa a requisição e gera o QR Code
6. **QR Code** é salvo no banco de dados
7. **Frontend** busca o QR Code do banco e exibe no modal

### **Arquivos Envolvidos:**
- `app/robots/page.tsx` - Interface da tela de robôs
- `app/api/webhook/route.ts` - API que redireciona para o webhook externo
- `docker-compose.yml` - Configuração de produção
- `Dockerfile` - Build da imagem Docker

## 🧪 **Como Testar a Correção**

### **1. Teste Manual no Browser:**
```javascript
// Cole no console do browser em produção
fetch('/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: "teste",
    token: "teste",
    qrcode: true,
    integration: "WHATSAPP-BAILEYS"
  })
}).then(r => r.json()).then(console.log)
```

### **2. Teste com Script de Debug:**
```bash
# Execute o script de teste criado
node test-qrcode-fix.js
```

### **3. Teste na Interface:**
1. Acesse a tela de robôs em produção
2. Clique em "Gerar QR Code" em qualquer robô
3. Verifique se a requisição é enviada (Network tab)
4. Verifique se o QR Code aparece no modal

## 🚀 **Deploy da Correção**

### **1. Rebuild da Imagem Docker:**
```bash
# Build da nova imagem
docker build -t praisetecnologia/praise-shot:latest .

# Push para o registry
docker push praisetecnologia/praise-shot:latest
```

### **2. Atualizar o Serviço em Produção:**
```bash
# Via Docker Swarm
docker service update --image praisetecnologia/praise-shot:latest praiseshot_pshot-app

# Ou via Portainer
# 1. Acesse o Portainer
# 2. Vá para Stacks → praiseshot
# 3. Clique em "Update the stack"
# 4. Confirme a atualização
```

### **3. Verificar o Deploy:**
```bash
# Verificar logs do serviço
docker service logs -f praiseshot_pshot-app

# Verificar se o serviço está rodando
docker service ls
```

## ✅ **Validação da Correção**

### **Checklist de Validação:**
- [ ] Imagem Docker rebuilded com as correções
- [ ] Serviço atualizado em produção
- [ ] Variável `NEXT_PUBLIC_WEBHOOK_URL` aponta para o webhook externo
- [ ] Tela de robôs carrega sem erros
- [ ] Botão "Gerar QR Code" envia requisição POST
- [ ] QR Code é gerado e exibido no modal
- [ ] Logs não mostram erros de loop infinito

### **Logs Esperados (Sucesso):**
```
🚀 Webhook API chamada
🔗 Webhook URL configurada: SIM
📋 Body da requisição: {...}
📤 Enviando para: https://praisewhk.praisesistemas.uk/webhook/criarqrpshot
📥 Status da resposta do webhook: 200
✅ Resposta do webhook: {...}
```

### **Logs de Erro (Se ainda houver problema):**
```
❌ URL do webhook não configurada
❌ Erro na resposta do webhook: ...
💥 Erro interno na API de webhook: ...
```

## 📊 **Impacto da Correção**

### **Antes (Problema):**
- ❌ QR Codes não eram gerados em produção
- ❌ Requisições POST não eram enviadas
- ❌ Modal ficava em estado de loading infinito
- ❌ Usuários não conseguiam conectar robôs

### **Depois (Corrigido):**
- ✅ QR Codes são gerados normalmente em produção
- ✅ Requisições POST são enviadas corretamente
- ✅ Modal exibe QR Code em poucos segundos
- ✅ Usuários podem conectar robôs normalmente

## 🔐 **Considerações de Segurança**

A correção não introduz novos riscos de segurança:
- URL do webhook externo já era usada em desenvolvimento
- Não há exposição de dados sensíveis
- Autenticação e autorização permanecem inalteradas

## 📝 **Próximos Passos**

1. **Deploy Imediato:** Aplicar a correção em produção
2. **Monitoramento:** Acompanhar logs por 24h após o deploy
3. **Teste de Usuário:** Validar com usuários reais
4. **Documentação:** Atualizar documentação de deploy

---

**Status:** ✅ **CORREÇÃO IMPLEMENTADA E PRONTA PARA DEPLOY**

**Arquivos Modificados:**
- `docker-compose.yml`
- `Dockerfile`

**Arquivos de Teste Criados:**
- `debug-qrcode-request.js`
- `test-qrcode-fix.js`
- `QRCODE-PRODUCTION-FIX.md`