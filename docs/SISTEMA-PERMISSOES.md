# Sistema de Permissões - PraiseShot

Este documento descreve como funciona o sistema de permissões implementado no projeto PraiseShot.

## Visão Geral

O sistema de permissões controla o acesso às diferentes funcionalidades do sistema baseado nas colunas `telaShot_*` da tabela `users`. Cada usuário é identificado pelo seu email e tem permissões específicas para acessar diferentes telas.

## Estrutura da Tabela Users

As permissões são armazenadas na tabela `users` nas seguintes colunas:

```sql
-- Colunas de permissão na tabela users
telaShot_promocoes    text default 'nao'  -- Tela de promoções
telaShot_relatorios   text default 'nao'  -- Tela de relatórios  
telaShot_aniversarios text default 'nao'  -- Tela de aniversários
telaShot_pesquisas    text default 'nao'  -- Tela de pesquisas
telaShot_usuarios     text default 'nao'  -- Tela de usuários
telaShot_bots         text default 'nao'  -- Tela de robôs
```

- **Valores**: `'sim'` = permissão concedida, `'nao'` = permissão negada
- **Identificação**: Usuários são identificados pelo campo `email`

## Componentes do Sistema

### 1. PermissionsService (`lib/permissions-service.ts`)

Serviço principal para gerenciar permissões:

```typescript
// Buscar permissões de um usuário
const permissions = await PermissionsService.getUserPermissions('user@email.com')

// Verificar permissão específica
const hasAccess = await PermissionsService.hasPermission('user@email.com', 'telaShot_bots')
```

### 2. Hook usePermissions (`hooks/use-permissions.ts`)

Hook React para usar permissões em componentes:

```typescript
const { permissions, hasPermission, isLoading } = usePermissions()

// Verificar se tem permissão
if (hasPermission('telaShot_promocoes')) {
  // Usuário tem acesso à tela de promoções
}
```

### 3. ProtectedRouteWithPermission (`components/protected-route-with-permission.tsx`)

Componente para proteger páginas inteiras:

```typescript
<ProtectedRouteWithPermission requiredPermission="telaShot_bots">
  <RobotsPageContent />
</ProtectedRouteWithPermission>
```

### 4. PermissionAwareLink (`components/permission-aware-link.tsx`)

Link que verifica permissões antes de navegar:

```typescript
<PermissionAwareLink
  href="/robots"
  requiredPermission="telaShot_bots"
  className="nav-link"
>
  Gerenciar Robôs
</PermissionAwareLink>
```

### 5. PermissionDenied (`components/permission-denied.tsx`)

Componente para exibir avisos de acesso negado.

## Páginas Protegidas

Todas as páginas principais foram atualizadas para usar o sistema de permissões:

- **Promoções** (`/promotions`) → `telaShot_promocoes`
- **Relatórios** (`/reports`) → `telaShot_relatorios`
- **Aniversários** (`/birthdays`) → `telaShot_aniversarios`
- **Pesquisas** (`/dashboard/surveys`) → `telaShot_pesquisas`
- **Usuários** (`/users`) → `telaShot_usuarios`
- **Robôs** (`/robots`) → `telaShot_bots`

## Como Usar

### Proteger uma Página

```typescript
// app/minha-pagina/page.tsx
import { ProtectedRouteWithPermission } from '@/components/protected-route-with-permission'

function MinhaPageContent() {
  return <div>Conteúdo da página</div>
}

export default function MinhaPage() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_promocoes">
      <MinhaPageContent />
    </ProtectedRouteWithPermission>
  )
}
```

### Verificar Permissões em Componentes

```typescript
import { usePermissions } from '@/hooks/use-permissions'

export function MeuComponente() {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      {hasPermission('telaShot_usuarios') && (
        <button>Gerenciar Usuários</button>
      )}
      
      {hasPermission('telaShot_relatorios') && (
        <section>Relatórios</section>
      )}
    </div>
  )
}
```

### Links com Verificação

```typescript
import { PermissionAwareLink } from '@/components/permission-aware-link'

<PermissionAwareLink
  href="/users"
  requiredPermission="telaShot_usuarios"
  className="menu-item"
>
  Usuários
</PermissionAwareLink>
```

## Fluxo de Funcionamento

1. **Login**: Usuário faz login com email/senha
2. **Carregamento Otimizado**: API de login já retorna as permissões junto com os dados do usuário
3. **Cache Inteligente**: Permissões ficam armazenadas no contexto de autenticação
4. **Navegação Rápida**: Verificações usam o cache local (sem consultas ao banco)
5. **Fallback**: Se permissões não estiverem em cache, consulta o banco como backup

### Otimizações de Performance

- ✅ **Uma única consulta**: Permissões carregadas no login
- ✅ **Cache local**: Verificações instantâneas sem rede
- ✅ **Fallback inteligente**: Consulta banco apenas se necessário
- ✅ **Refresh manual**: Método `refreshPermissions()` disponível

## Avisos de Permissão

Quando um usuário não tem permissão:

- **Páginas**: Mostra componente `PermissionDenied` com mensagem amigável
- **Links**: Mostra toast de erro e impede navegação
- **Sidebar**: Itens sem permissão ficam ocultos

## Mensagens de Erro

- "Você não possui permissão para acessar a tela de [nome da funcionalidade]"
- "Entre em contato com o administrador do sistema para solicitar acesso"
- Sem uso de `window.alert` - apenas toasts e componentes visuais

## Administração

Para conceder/revogar permissões:

1. Acesse a tabela `users` no banco de dados
2. Localize o usuário pelo `email`
3. Altere as colunas `telaShot_*` para `'sim'` ou `'nao'`
4. As mudanças são aplicadas no próximo login

### Aplicar Mudanças Imediatamente

Se precisar aplicar mudanças sem fazer logout/login:

```typescript
const { refreshPermissions } = usePermissions()
await refreshPermissions() // Recarrega do banco
```

## Performance e Otimizações

### Estratégia de Cache

1. **Login**: Permissões carregadas uma única vez na API
2. **Contexto**: Armazenadas no contexto de autenticação
3. **Hook**: `usePermissions` usa cache local primeiro
4. **Fallback**: Consulta banco apenas se cache não disponível

### Estrutura da Resposta da API

```json
{
  "id": 123,
  "name": "João Silva",
  "email": "joao@empresa.com",
  "telaShotPermissions": {
    "telaShot_promocoes": true,
    "telaShot_relatorios": false,
    "telaShot_aniversarios": true,
    "telaShot_pesquisas": true,
    "telaShot_usuarios": false,
    "telaShot_bots": true
  }
}
```

### Debug em Desenvolvimento

Use o componente `DebugPermissions` para verificar se as permissões estão sendo carregadas corretamente:

```typescript
import { DebugPermissions } from '@/components/debug-permissions'

// Adicione em qualquer página durante desenvolvimento
<DebugPermissions />
```

## Tipos TypeScript

```typescript
type TelaShotPermission = 
  | 'telaShot_promocoes'
  | 'telaShot_relatorios' 
  | 'telaShot_aniversarios'
  | 'telaShot_pesquisas'
  | 'telaShot_usuarios'
  | 'telaShot_bots'

interface UserPermissions {
  telaShot_promocoes: boolean
  telaShot_relatorios: boolean
  telaShot_aniversarios: boolean
  telaShot_pesquisas: boolean
  telaShot_usuarios: boolean
  telaShot_bots: boolean
}
```

## Segurança

- ✅ Verificação no frontend (UX)
- ✅ Identificação por email (único)
- ✅ Permissões granulares por funcionalidade
- ✅ Avisos amigáveis sem exposição de dados
- ⚠️ **Importante**: Implementar verificação no backend para APIs

## Troubleshooting

### Usuário não consegue acessar tela

1. Verificar se email está correto na tabela `users`
2. Verificar se coluna `telaShot_*` está como `'sim'`
3. Verificar se usuário fez logout/login após mudança
4. Verificar console do navegador para erros

### Permissões não carregam

1. Verificar conexão com Supabase
2. Verificar se tabela `users` existe e tem as colunas corretas
3. Verificar se usuário está logado corretamente
4. Verificar logs no console

### Performance

- Permissões são carregadas uma vez por sessão
- Use `refreshPermissions()` se precisar recarregar
- Evite verificações desnecessárias em loops

## Exemplos Completos

Veja o arquivo `examples/permission-usage-examples.tsx` para exemplos detalhados de uso.