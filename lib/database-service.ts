import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DatabaseUser {
  id: number
  email: string
  config_filtros_relatorios: string | null
  // Adicione outros campos conforme necessário
}

export class DatabaseService {
  /**
   * Busca um usuário pelo ID
   */
  static async getUserById(userId: number): Promise<DatabaseUser | null> {
    try {
      console.log('DatabaseService.getUserById - Buscando usuário:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, config_filtros_relatorios')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Erro ao buscar usuário:', error)
        return null
      }
      
      console.log('DatabaseService.getUserById - Usuário encontrado:', data)
      return data
      
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      return null
    }
  }

  /**
   * Atualiza a configuração de filtros do usuário
   */
  static async updateUserFilterConfig(userId: number, configData: string): Promise<boolean> {
    try {
      console.log('DatabaseService.updateUserFilterConfig - Atualizando usuário:', userId)
      
      const { error } = await supabase
        .from('users')
        .update({ config_filtros_relatorios: configData })
        .eq('id', userId)
      
      if (error) {
        console.error('Erro ao atualizar configuração do usuário:', error)
        return false
      }
      
      console.log('DatabaseService.updateUserFilterConfig - Configuração atualizada com sucesso')
      return true
      
    } catch (error) {
      console.error('Erro ao atualizar configuração do usuário:', error)
      return false
    }
  }

  /**
   * Cria um usuário de teste
   */
  static async createTestUser(userId: number, email: string): Promise<boolean> {
    try {
      console.log('DatabaseService.createTestUser - Criando usuário de teste:', userId, email)
      
      // Primeiro, verificar se a tabela users existe
      const { data: tableExists, error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (tableError && tableError.code === 'PGRST116') {
        console.log('DatabaseService.createTestUser - Tabela users não existe, tentando criar...')
        // A tabela não existe, mas não podemos criar via Supabase client
        // Vamos tentar inserir mesmo assim e ver o que acontece
      }
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          nome: 'Usuário Teste',
          rede: 'rede_teste',
          config_filtros_relatorios: null
        })
      
      if (error) {
        console.error('Erro ao criar usuário de teste:', error)
        
        // Se o erro for de tabela não existente, tentar usar upsert
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('DatabaseService.createTestUser - Tentando upsert...')
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: userId,
              email: email,
              nome: 'Usuário Teste',
              rede: 'rede_teste',
              config_filtros_relatorios: null
            })
          
          if (upsertError) {
            console.error('Erro no upsert:', upsertError)
            return false
          }
        } else {
          return false
        }
      }
      
      console.log('DatabaseService.createTestUser - Usuário de teste criado com sucesso')
      return true
      
    } catch (error) {
      console.error('Erro ao criar usuário de teste:', error)
      return false
    }
  }

  /**
   * Verifica se a tabela users existe e tem as colunas necessárias
   */
  static async checkUserTableStructure(): Promise<boolean> {
    try {
      console.log('DatabaseService.checkUserTableStructure - Verificando estrutura da tabela users...')
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, config_filtros_relatorios, rede')
        .limit(1)

      if (error) {
        console.error('DatabaseService.checkUserTableStructure - Erro:', error)
        return false
      }

      console.log('DatabaseService.checkUserTableStructure - Tabela users existe e está acessível')
      return true
      
    } catch (error) {
      console.error('DatabaseService.checkUserTableStructure - Erro:', error)
      return false
    }
  }

  /**
   * Gera ou recupera o salt específico do usuário
   * IMPORTANTE: O salt deve ser único por usuário e persistente
   */
  static async getUserSalt(userId: number): Promise<string> {
    try {
      // Usar o ID do usuário como base para o salt (mais simples)
      const salt = `user_salt_${userId}_${process.env.ENCRYPTION_SECRET || 'default_secret'}`
      console.log('DatabaseService.getUserSalt - Salt gerado para usuário:', userId)
      return salt
      
    } catch (error) {
      console.error('Erro ao obter salt do usuário:', error)
      return `fallback_salt_${userId}`
    }
  }

  /**
   * Verifica se uma tabela existe
   */
  static async tableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        return false
      }

      return !error
    } catch (error) {
      console.error(`Erro ao verificar tabela ${tableName}:`, error)
      return false
    }
  }
}

// Export default instance for compatibility
export const databaseService = DatabaseService