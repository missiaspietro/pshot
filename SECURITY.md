# Guia de Segurança

Este documento descreve as práticas de segurança implementadas no sistema para proteger dados sensíveis.

## 🔒 Dados Sensíveis Protegidos

### Chaves de API e Tokens
- **Supabase API Keys**: Armazenadas em variáveis de ambiente
- **Service Role Keys**: Protegidas e mascaradas em logs
- **Webhook URLs**: Configuradas via variáveis de ambiente

### Configurações Seguras

#### Variáveis de Ambiente (.env.local)
```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Webhook URLs
NEXT_PUBLIC_WEBHOOK_URL=https://your-webhook-url.com

# Configurações de criptografia
ENCRYPTION_SECRET=your-super-secret-encryption-key

# Configurações de autenticação
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## 🛡️ Funcionalidades de Segurança

### 1. Mascaramento de Dados Sensíveis
O sistema inclui utilitários para mascarar dados sensíveis em logs:

```typescript
import { maskApiKey, maskUrl, secureLog } from './lib/security-utils'

// Mascarar chaves de API
const maskedKey = maskApiKey('eyJhbGciOiJIUzI1NiJ...') // eyJh***...1NiJ

// Log seguro (mascara automaticamente dados sensíveis)
secureLog('Fazendo requisição', { apikey: 'secret-key' })
```

### 2. Configuração Centralizada
Todas as configurações sensíveis são centralizadas em `lib/security-utils.ts`:

```typescript
import { getSecureConfig, getSupabaseHeaders } from './lib/security-utils'

const config = getSecureConfig()
const headers = getSupabaseHeaders()
```

### 3. Headers Seguros
Headers para requisições Supabase são gerados de forma segura:

```typescript
const headers = getSupabaseHeaders()
// Retorna headers com chaves mascaradas em logs
```

## 🚨 Alertas de Segurança

### Senhas Padrão
⚠️ **IMPORTANTE**: Altere as senhas padrão em `scripts/02-seed-data.sql` antes de usar em produção!

### Chaves de Desenvolvimento
⚠️ **AVISO**: Nunca commite chaves reais no código. Use sempre variáveis de ambiente.

### Logs de Produção
⚠️ **CUIDADO**: Em produção, certifique-se de que `NODE_ENV=production` para desabilitar logs detalhados.

## 📋 Checklist de Segurança

### Antes de Deploy em Produção:
- [ ] Alterar todas as senhas padrão
- [ ] Configurar variáveis de ambiente no servidor
- [ ] Verificar se `.env.local` está no `.gitignore`
- [ ] Testar mascaramento de logs
- [ ] Configurar `NODE_ENV=production`
- [ ] Revisar permissões do banco de dados
- [ ] Configurar HTTPS
- [ ] Implementar rate limiting

### Monitoramento:
- [ ] Configurar alertas para tentativas de acesso não autorizado
- [ ] Monitorar logs de erro
- [ ] Revisar acessos regulares ao banco
- [ ] Backup regular dos dados

## 🔧 Utilitários de Segurança

### Funções Disponíveis:
- `maskApiKey(key)`: Mascara chaves de API
- `maskUrl(url)`: Mascara URLs sensíveis
- `maskPassword(password)`: Mascara senhas
- `maskEmail(email)`: Mascara emails
- `secureLog(message, data)`: Log seguro com mascaramento automático
- `getSecureConfig()`: Configurações centralizadas
- `getSupabaseHeaders()`: Headers seguros para Supabase

## 📞 Contato

Em caso de vulnerabilidades de segurança, entre em contato imediatamente com a equipe de desenvolvimento.

---

**Lembre-se**: A segurança é responsabilidade de todos. Sempre revise o código antes de fazer deploy e mantenha as dependências atualizadas.