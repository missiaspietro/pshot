"use client"

import { useState, useEffect, useCallback } from 'react'
import { FilterConfiguration } from '@/lib/filter-config-encryption'
import { FilterConfigServiceByType, SaveConfigRequest } from '@/lib/filter-config-service-by-type'

interface UseFilterConfigurationsByTypeReturn {
  configurations: FilterConfiguration[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  saveConfiguration: (request: Omit<SaveConfigRequest, 'type'>) => Promise<boolean>
  loadConfigurations: () => Promise<void>
  deleteConfiguration: (configId: string) => Promise<boolean>
  clearError: () => void
  canSaveMore: boolean
  isNameDuplicate: (name: string) => boolean
  retryLoad: () => Promise<void>
}

export function useFilterConfigurationsByType(
  type: 'birthday' | 'cashback' | 'survey' | 'promotions'
): UseFilterConfigurationsByTypeReturn {
  const [configurations, setConfigurations] = useState<FilterConfiguration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Carrega as configurações do servidor filtradas por tipo
   */
  const loadConfigurations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await FilterConfigServiceByType.loadConfigurationsByType(type)
      
      if (response.success && response.data) {
        // Migrar configurações antigas que não têm o campo 'type'
        const migratedConfigurations = response.data.map((config: any) => {
          if (!config.type) {
            // Assumir que configurações antigas são do tipo 'birthday'
            return { ...config, type: 'birthday' }
          }
          return config
        })

        // Filtrar apenas configurações do tipo solicitado
        const typeFilteredConfigurations = migratedConfigurations.filter((config: any) => config.type === type)

        // Validar e filtrar configurações corrompidas
        const validConfigurations = typeFilteredConfigurations.filter((config: FilterConfiguration) => {
          try {
            // Verificar se a configuração tem os campos obrigatórios e é do tipo correto
            return (
              config.id &&
              config.name &&
              config.selectedFields &&
              Array.isArray(config.selectedFields) &&
              config.selectedFields.length > 0 &&
              config.type === type &&
              config.createdAt
            )
          } catch {
            return false
          }
        })

        setConfigurations(validConfigurations)

        // Avisar se algumas configurações foram filtradas
        if (validConfigurations.length < response.data.length) {
          const corruptedCount = response.data.length - validConfigurations.length
          setError(`${corruptedCount} configuração(ões) corrompida(s) foram ignoradas`)
        }
      } else {
        const errorMessage = response.error?.message || 'Erro ao carregar configurações'
        const errorCode = response.error?.code || 'UNKNOWN_ERROR'
        
        // Mensagens de erro mais específicas
        switch (errorCode) {
          case 'NETWORK_ERROR':
            setError('Erro de conexão. Verifique sua internet e tente novamente.')
            break
          case 'UNAUTHORIZED':
            setError('Sessão expirada. Faça login novamente.')
            break
          case 'LOAD_FAILED':
            setError('Erro no servidor. Tente novamente em alguns minutos.')
            break
          default:
            setError(errorMessage)
        }
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar configurações:', err)
      setError('Erro inesperado. Recarregue a página e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [type])

  /**
   * Salva uma nova configuração
   */
  const saveConfiguration = useCallback(async (request: Omit<SaveConfigRequest, 'type'>): Promise<boolean> => {
    setIsSaving(true)
    setError(null)

    try {
      // Validações locais
      if (FilterConfigServiceByType.isNameDuplicate(request.name, configurations)) {
        setError('Já existe uma configuração com este nome')
        return false
      }

      if (!FilterConfigServiceByType.canSaveMoreConfigurations(configurations.length)) {
        setError('Limite máximo de configurações atingido (10)')
        return false
      }

      const response = await FilterConfigServiceByType.saveConfiguration(request, type)
      
      if (response.success && response.data) {
        // Atualização otimista
        setConfigurations(prev => [...prev, response.data!])
        return true
      } else {
        setError(response.error?.message || 'Erro ao salvar configuração')
        return false
      }
    } catch (err) {
      setError('Erro inesperado ao salvar configuração')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [configurations, type])

  /**
   * Exclui uma configuração
   */
  const deleteConfiguration = useCallback(async (configId: string): Promise<boolean> => {
    setError(null)

    // Atualização otimista
    const originalConfigs = configurations
    setConfigurations(prev => prev.filter(config => config.id !== configId))

    try {
      const response = await FilterConfigServiceByType.deleteConfiguration(configId, type)
      
      if (response.success) {
        return true
      } else {
        // Rollback em caso de erro
        setConfigurations(originalConfigs)
        setError(response.error?.message || 'Erro ao excluir configuração')
        return false
      }
    } catch (err) {
      // Rollback em caso de erro
      setConfigurations(originalConfigs)
      setError('Erro inesperado ao excluir configuração')
      return false
    }
  }, [configurations])

  /**
   * Limpa mensagens de erro
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Tenta recarregar as configurações (útil após erro)
   */
  const retryLoad = useCallback(async () => {
    await loadConfigurations()
  }, [loadConfigurations])

  /**
   * Verifica se pode salvar mais configurações
   */
  const canSaveMore = FilterConfigServiceByType.canSaveMoreConfigurations(configurations.length)

  /**
   * Verifica se um nome é duplicado
   */
  const isNameDuplicate = useCallback((name: string) => {
    return FilterConfigServiceByType.isNameDuplicate(name, configurations)
  }, [configurations])

  // Carregar configurações na inicialização
  useEffect(() => {
    loadConfigurations()
  }, [loadConfigurations])

  return {
    configurations,
    isLoading,
    isSaving,
    error,
    saveConfiguration,
    loadConfigurations,
    deleteConfiguration,
    clearError,
    canSaveMore,
    isNameDuplicate,
    retryLoad
  }
}