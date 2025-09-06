import { FilterConfiguration, EncryptedConfiguration, FilterConfigEncryption } from './filter-config-encryption'

export interface SaveConfigRequest {
  name: string
  selectedFields: string[]
  responseFilter?: string // Filtro de resposta para pesquisas
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

export class FilterConfigServiceByType {
  private static readonly MAX_CONFIGURATIONS = 10
  private static readonly API_BASE = '/api/users/report-filters'

  /**
   * Carrega configurações filtradas por tipo
   */
  static async loadConfigurationsByType(type: 'birthday' | 'cashback' | 'survey' | 'promotions'): Promise<ApiResponse<FilterConfiguration[]>> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        // Filtrar por tipo
        const filteredConfigurations = data.data.filter((config: FilterConfiguration) => {
          // Para compatibilidade com configurações antigas, assumir que configurações sem tipo são 'birthday'
          const configType = config.type || 'birthday'
          return configType === type
        })

        return {
          success: true,
          data: filteredConfigurations
        }
      }

      return data
    } catch (error) {
      console.error('Erro ao carregar configurações por tipo:', error)
      return {
        success: false,
        error: {
          code: 'LOAD_ERROR',
          message: 'Erro ao carregar configurações',
          details: error
        }
      }
    }
  }

  /**
   * Salva uma nova configuração com tipo específico
   */
  static async saveConfiguration(request: SaveConfigRequest, type: 'birthday' | 'cashback' | 'survey' | 'promotions'): Promise<ApiResponse<FilterConfiguration>> {
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

      // Criar configuração com tipo
      const configToSave: FilterConfiguration = {
        id: globalThis.crypto?.randomUUID() || Math.random().toString(36).substring(2, 15),
        name: sanitizedName,
        selectedFields: request.selectedFields,
        responseFilter: request.responseFilter,
        type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Para este caso, vamos enviar a configuração diretamente sem criptografia
      // A criptografia é usada para armazenamento local, não para API calls

      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      return {
        success: false,
        error: {
          code: 'SAVE_ERROR',
          message: 'Erro ao salvar configuração',
          details: error
        }
      }
    }
  }

  /**
   * Exclui uma configuração
   */
  static async deleteConfiguration(configId: string, type: 'birthday' | 'cashback' | 'survey' | 'promotions'): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/${configId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao excluir configuração:', error)
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Erro ao excluir configuração',
          details: error
        }
      }
    }
  }

  /**
   * Verifica se um nome já existe
   */
  static isNameDuplicate(name: string, configurations: FilterConfiguration[]): boolean {
    const sanitizedName = FilterConfigEncryption.sanitizeConfigName(name)
    return configurations.some(config => 
      FilterConfigEncryption.sanitizeConfigName(config.name) === sanitizedName
    )
  }

  /**
   * Verifica se é possível salvar mais configurações
   */
  static canSaveMoreConfigurations(currentCount: number): boolean {
    return currentCount < this.MAX_CONFIGURATIONS
  }
}