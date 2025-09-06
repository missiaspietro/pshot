/**
 * EXEMPLOS DE USO DO SISTEMA DE PERMISSÕES
 * 
 * Este arquivo contém exemplos de como usar o sistema de permissões
 * implementado no projeto.
 */

import { ProtectedRouteWithPermission } from '@/components/protected-route-with-permission'
import { PermissionAwareLink } from '@/components/permission-aware-link'
import { usePermissions } from '@/hooks/use-permissions'
import { PermissionsService } from '@/lib/permissions-service'

// ========================================
// EXEMPLO 1: Protegendo uma página inteira
// ========================================

export function ExemploPageProtegida() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_promocoes">
      <div>
        <h1>Página de Promoções</h1>
        <p>Esta página só é acessível para usuários com permissão de promoções.</p>
      </div>
    </ProtectedRouteWithPermission>
  )
}

// ========================================
// EXEMPLO 2: Link com verificação de permissão
// ========================================

export function ExemploLinkComPermissao() {
  return (
    <div>
      <h2>Menu de Navegação</h2>
      <nav>
        <PermissionAwareLink
          href="/robots"
          requiredPermission="telaShot_bots"
          className="nav-link"
        >
          Gerenciar Robôs
        </PermissionAwareLink>
        
        <PermissionAwareLink
          href="/users"
          requiredPermission="telaShot_usuarios"
          className="nav-link"
        >
          Gerenciar Usuários
        </PermissionAwareLink>
      </nav>
    </div>
  )
}

// ========================================
// EXEMPLO 3: Verificação condicional com hook
// ========================================

export function ExemploVerificacaoCondicional() {
  const { hasPermission, permissions, isLoading } = usePermissions()

  if (isLoading) {
    return <div>Carregando permissões...</div>
  }

  return (
    <div>
      <h2>Dashboard</h2>
      
      {/* Mostra botão apenas se tiver permissão */}
      {hasPermission('telaShot_promocoes') && (
        <button>Criar Nova Promoção</button>
      )}
      
      {/* Mostra seção apenas se tiver permissão */}
      {hasPermission('telaShot_relatorios') && (
        <section>
          <h3>Relatórios</h3>
          <p>Aqui estão seus relatórios...</p>
        </section>
      )}
      
      {/* Mostra lista de permissões do usuário */}
      <div>
        <h3>Suas Permissões:</h3>
        <ul>
          {permissions && Object.entries(permissions).map(([key, value]) => (
            <li key={key}>
              {key}: {value ? '✅ Permitido' : '❌ Negado'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ========================================
// EXEMPLO 4: Verificação programática
// ========================================

export function ExemploVerificacaoProgramatica() {
  const handleButtonClick = async () => {
    // Verifica permissão antes de executar ação
    const userEmail = 'usuario@exemplo.com' // Pegar do contexto de auth
    const hasPermission = await PermissionsService.hasPermission(userEmail, 'telaShot_bots')
    
    if (hasPermission) {
      console.log('Usuário tem permissão para gerenciar robôs')
      // Executar ação
    } else {
      console.log('Usuário não tem permissão')
      alert('Você não tem permissão para esta ação')
    }
  }

  return (
    <button onClick={handleButtonClick}>
      Ação que Requer Permissão
    </button>
  )
}

// ========================================
// EXEMPLO 5: Componente com múltiplas permissões
// ========================================

export function ExemploMultiplasPermissoes() {
  const { hasPermission } = usePermissions()
  
  const canManageUsers = hasPermission('telaShot_usuarios')
  const canViewReports = hasPermission('telaShot_relatorios')
  const canManageBots = hasPermission('telaShot_bots')
  
  return (
    <div>
      <h2>Painel Administrativo</h2>
      
      <div className="admin-sections">
        {canManageUsers && (
          <div className="admin-card">
            <h3>Gerenciar Usuários</h3>
            <p>Criar, editar e excluir usuários</p>
          </div>
        )}
        
        {canViewReports && (
          <div className="admin-card">
            <h3>Relatórios</h3>
            <p>Visualizar relatórios do sistema</p>
          </div>
        )}
        
        {canManageBots && (
          <div className="admin-card">
            <h3>Robôs</h3>
            <p>Gerenciar conexões de WhatsApp</p>
          </div>
        )}
        
        {!canManageUsers && !canViewReports && !canManageBots && (
          <div className="no-permissions">
            <p>Você não possui permissões administrativas.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ========================================
// EXEMPLO 6: Página com fallback customizado
// ========================================

export function ExemploComFallbackCustomizado() {
  const FallbackCustomizado = () => (
    <div className="custom-permission-denied">
      <h2>Oops! Acesso Restrito</h2>
      <p>Esta funcionalidade está disponível apenas para administradores.</p>
      <button onClick={() => window.history.back()}>
        Voltar
      </button>
    </div>
  )

  return (
    <ProtectedRouteWithPermission 
      requiredPermission="telaShot_usuarios"
      fallbackComponent={<FallbackCustomizado />}
    >
      <div>
        <h1>Área Administrativa</h1>
        <p>Conteúdo restrito para administradores</p>
      </div>
    </ProtectedRouteWithPermission>
  )
}

/**
 * RESUMO DAS PERMISSÕES DISPONÍVEIS:
 * 
 * - telaShot_promocoes: Tela de promoções
 * - telaShot_relatorios: Tela de relatórios  
 * - telaShot_aniversarios: Tela de aniversários
 * - telaShot_pesquisas: Tela de pesquisas
 * - telaShot_usuarios: Tela de usuários
 * - telaShot_bots: Tela de robôs
 * 
 * COMO FUNCIONA:
 * 
 * 1. As permissões são armazenadas na tabela 'users' como 'sim'/'nao'
 * 2. O PermissionsService busca as permissões pelo email do usuário
 * 3. O hook usePermissions fornece acesso fácil às permissões
 * 4. Os componentes ProtectedRouteWithPermission e PermissionAwareLink
 *    fazem a verificação automaticamente
 * 5. Se o usuário não tiver permissão, é mostrado um aviso amigável
 */