import { FilterConfiguration, EncryptedConfiguration, FilterConfigEncryption } from './filter-config-encryption'

export interface SaveConfigRequest {
  name: string
  selectedFields: string[]
  responseFilter?: string // Filtro de resposta para pesquisas
  type: 'birthday' | 'cashback' | 'survey' | 'promotions'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export class FilterConfigService {
  private static readonly MAX_CONFIGURATIONS = 10
  private static readonly API_BASE = '/api/users/report-filters'

  /**
   * Salva uma nova configuração
   */
  static async saveConfiguration(request: SaveConfigRequest): Promise<ApiResponse<FilterConfiguration>> {
    try {
      // Validar entrada
      const sanitizedName = FilterConfigEncryption.sanitizeConfigName(request.name)
      if (sanitizedName.length < 3) {
        return {
          success: false,
          error: {
            code: 'INVALID_NAME',
            message: 'Nome deve ter pelo menos 3 caracteres'
          }
        }
      }

      if (!request.selectedFields || request.selectedFields.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_FIELDS',
            message: 'Selecione pelo menos um campo'
          }
        }
      }

      if (!request.type || !['birthday', 'cashback', 'survey', 'promotions'].includes(request.type)) {
        return {
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Tipo de configuração inválido'
          }
        }
      }

      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedName,
          selectedFields: request.selectedFields,
          responseFilter: request.responseFilter,
          type: request.type
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'SAVE_FAILED',
            message: 'Erro ao salvar configuração'
          }
        }
      }

      return result
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erro de conexão. Tente novamente.'
        }
      }
    }
  }

  /**
   * Carrega todas as configurações do usuário
   */
  static async loadConfigurations(): Promise<ApiResponse<FilterConfiguration[]>> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'LOAD_FAILED',
            message: 'Erro ao carregar configurações'
          }
        }
      }

      return result
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erro de conexão. Tente novamente.'
        }
      }
    }
  }

  /**
   * Exclui uma configuração específica
   */
  static async deleteConfiguration(configId: string): Promise<ApiResponse> {
    try {
      if (!configId) {
        return {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID da configuração é obrigatório'
          }
        }
      }

      const response = await fetch(`${this.API_BASE}/${configId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || {
            code: 'DELETE_FAILED',
            message: 'Erro ao excluir configuração'
          }
        }
      }

      return result
    } catch (error) {
      console.error('Erro ao excluir configuração:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erro de conexão. Tente novamente.'
        }
      }
    }
  }

  /**
   * Valida se o usuário pode salvar mais configurações
   */
  static canSaveMoreConfigurations(currentCount: number): boolean {
    return currentCount < this.MAX_CONFIGURATIONS
  }

  /**
   * Verifica se um nome de configuração já existe
   */
  static isNameDuplicate(name: string, existingConfigs: FilterConfiguration[]): boolean {
    const sanitizedName = FilterConfigEncryption.sanitizeConfigName(name).toLowerCase()
    return existingConfigs.some(config => 
      config.name.toLowerCase() === sanitizedName
    )
  }
}