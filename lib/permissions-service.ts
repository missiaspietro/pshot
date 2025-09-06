import { supabase } from './supabase'

export type TelaShotPermission = 
  | 'telaShot_promocoes'
  | 'telaShot_relatorios' 
  | 'telaShot_aniversarios'
  | 'telaShot_pesquisas'
  | 'telaShot_usuarios'
  | 'telaShot_bots'

export type PermissionMap = {
  [K in TelaShotPermission]: boolean
}

export interface UserPermissions {
  telaShot_promocoes: boolean
  telaShot_relatorios: boolean
  telaShot_aniversarios: boolean
  telaShot_pesquisas: boolean
  telaShot_usuarios: boolean
  telaShot_bots: boolean
}

export const PERMISSION_LABELS: Record<TelaShotPermission, string> = {
  telaShot_promocoes: 'Promoções',
  telaShot_relatorios: 'Relatórios',
  telaShot_aniversarios: 'Aniversários',
  telaShot_pesquisas: 'Pesquisas',
  telaShot_usuarios: 'Usuários',
  telaShot_bots: 'Robôs'
}

export class PermissionsService {
  /**
   * Busca as permissões do usuário pelo email
   */
  static async getUserPermissions(email: string): Promise<UserPermissions | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          telaShot_promocoes,
          telaShot_relatorios,
          telaShot_aniversarios,
          telaShot_pesquisas,
          telaShot_usuarios,
          telaShot_bots
        `)
        .eq('email', email)
        .single()

      if (error) {
        console.error('Erro ao buscar permissões do usuário:', error)
        return null
      }

      if (!data) {
        console.warn('Usuário não encontrado:', email)
        return null
      }

      // Converte 'sim'/'nao' para boolean
      return {
        telaShot_promocoes: data.telaShot_promocoes === 'sim',
        telaShot_relatorios: data.telaShot_relatorios === 'sim',
        telaShot_aniversarios: data.telaShot_aniversarios === 'sim',
        telaShot_pesquisas: data.telaShot_pesquisas === 'sim',
        telaShot_usuarios: data.telaShot_usuarios === 'sim',
        telaShot_bots: data.telaShot_bots === 'sim'
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar permissões:', error)
      return null
    }
  }

  /**
   * Verifica se o usuário tem permissão para uma tela específica
   */
  static async hasPermission(email: string, permission: TelaShotPermission): Promise<boolean> {
    const permissions = await this.getUserPermissions(email)
    return permissions?.[permission] ?? false
  }

  /**
   * Verifica múltiplas permissões de uma vez
   */
  static async hasPermissions(email: string, requiredPermissions: TelaShotPermission[]): Promise<Record<TelaShotPermission, boolean>> {
    const permissions = await this.getUserPermissions(email)
    const result: Record<string, boolean> = {}
    
    requiredPermissions.forEach(permission => {
      result[permission] = permissions?.[permission] ?? false
    })
    
    return result as Record<TelaShotPermission, boolean>
  }
}