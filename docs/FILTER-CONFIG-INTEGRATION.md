# Guia de Integração - Sistema de Configurações de Filtros

## 📋 Visão Geral

O sistema de configurações de filtros está implementado e pronto para integração com sua infraestrutura existente. Este guia mostra como conectar o sistema ao seu banco de dados e autenticação.

## 🔧 Arquivos que Precisam ser Adaptados

### 1. `lib/auth-service.ts`
**O que fazer:** Substituir as funções mock pela sua lógica de autenticação real.

**Opções disponíveis:**
- Cookies/Sessions
- JWT no header Authorization  
- NextAuth.js
- Seu sistema customizado

**Exemplo de adaptação:**
```typescript
// Se você usa cookies específicos
static async getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies()
  const userId = cookieStore.get('seu_cookie_user_id')?.value
  const userEmail = cookieStore.get('seu_cookie_email')?.value
  
  if (!userId || !userEmail) {
    return null
  }
  
  return {
    id: parseInt(userId),
    email: userEmail
  }
}
```

### 2. `lib/database-service.ts`
**O que fazer:** Substituir as funções mock pela sua lógica de banco de dados real.

**Opções disponíveis:**
- Prisma ORM
- Supabase
- API interna
- Conexão direta com PostgreSQL

**Exemplo com Prisma:**
```typescript
static async getUserById(userId: number): Promise<DatabaseUser | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      config_filtros_relatorios: true
    }
  })
  return user
}

static async updateUserFilterConfig(userId: number, configData: string): Promise<boolean> {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: { config_filtros_relatorios: configData }
    })
    return true
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    return false
  }
}
```

## 🔐 Configuração de Ambiente

### 1. Criar arquivo `.env.local`
```bash
# Copie o .env.example e configure:
cp .env.example .env.local
```

### 2. Configurar variáveis obrigatórias
```env
# OBRIGATÓRIO: Chave secreta para criptografia
ENCRYPTION_SECRET=sua-chave-super-secreta-aqui-mude-em-producao

# Configure conforme seu sistema de auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-nextauth

# Configure conforme seu banco
DATABASE_URL=sua-string-de-conexao-aqui
```

## 🗄️ Estrutura do Banco de Dados

### Coluna Existente
A coluna `config_filtros_relatorios` já existe na sua tabela `users`:
```sql
config_filtros_relatorios TEXT NULL
```

### Dados Armazenados
Os dados são armazenados como string criptografada Base64:
```
"eyJhbGciOiJBRVMtMjU2LUdDTSIsInR5cCI6IkpXVCJ9..."
```

### Estrutura Descriptografada
```json
{
  "configurations": [
    {
      "id": "uuid-123",
      "name": "Relatório Mensal", 
      "selectedFields": ["bot_disconnected", "invalid_number", "sent", "company"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🚀 Passos para Ativar

### 1. Configurar Autenticação
Edite `lib/auth-service.ts` e substitua a função `getCurrentUser()` pela sua implementação.

### 2. Configurar Banco de Dados  
Edite `lib/database-service.ts` e substitua as funções `getUserById()` e `updateUserFilterConfig()`.

### 3. Configurar Variáveis de Ambiente
Crie `.env.local` com `ENCRYPTION_SECRET` configurado.

### 4. Testar
Acesse a página de relatórios e teste:
- Salvar uma configuração
- Carregar uma configuração salva
- Excluir uma configuração

## 🔍 Debugging

### Logs Úteis
Os endpoints da API logam erros detalhados no console:
```bash
# Verificar logs do servidor
npm run dev
# Ou verificar logs de produção conforme sua configuração
```

### Problemas Comuns

**Erro 401 - Unauthorized:**
- Verificar se `getCurrentUser()` está retornando o usuário correto
- Verificar se cookies/tokens estão sendo enviados

**Erro 500 - Internal Server Error:**
- Verificar se `ENCRYPTION_SECRET` está configurado
- Verificar se funções de banco de dados estão funcionando
- Verificar logs do console para detalhes

**Erro de Criptografia:**
- Verificar se `ENCRYPTION_SECRET` é consistente
- Verificar se salt do usuário é consistente

## 📊 Monitoramento

### Métricas Importantes
- Taxa de sucesso de salvamento
- Taxa de sucesso de carregamento
- Tempo de resposta dos endpoints
- Erros de criptografia/descriptografia

### Logs de Segurança
- Tentativas de acesso não autorizadas
- Falhas de criptografia
- Tentativas de acesso a configurações de outros usuários

## 🔒 Segurança

### Implementado
- ✅ Criptografia AES-256-GCM
- ✅ Salt único por usuário
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Verificação de propriedade (usuário só acessa suas configurações)

### Recomendações Adicionais
- Implementar rate limiting nos endpoints
- Monitorar tentativas de acesso suspeitas
- Fazer backup regular das configurações
- Rotacionar `ENCRYPTION_SECRET` periodicamente

## 🎯 Próximos Passos

1. **Adaptar os serviços** conforme sua infraestrutura
2. **Configurar variáveis de ambiente**
3. **Testar em desenvolvimento**
4. **Fazer deploy em staging**
5. **Testar em produção**
6. **Monitorar métricas**

O sistema está pronto para uso assim que você adaptar os serviços de autenticação e banco de dados!