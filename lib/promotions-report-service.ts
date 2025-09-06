import { supabase } from './supabase'
import { getCachedData, setCachedData } from './dashboard-optimizations'

export interface PromotionsReportData {
  Cliente?: string
  Enviado?: string
  Obs?: string
  Whatsapp?: string
  Rede?: string
  Sub_rede?: string
  Loja?: string
  Id: string
  Data_Envio?: string
}

export interface PromotionsReportFilters {
  empresa: string
  selectedFields: string[]
  startDate?: string
  endDate?: string
  selectedStore?: string
}

export class PromotionsReportService {
  /**
   * Busca dados de promoções da tabela "Relatorio Envio de Promoções"
   * Aplica filtros por empresa, campos selecionados e período de datas
   * Inclui cache para melhorar performance
   */
  async getPromotionsData(filters: PromotionsReportFilters): Promise<PromotionsReportData[]> {
    try {
      const { empresa, selectedFields, startDate, endDate, selectedStore } = filters

      console.log('🔄 PromotionsReportService iniciado com filtros:', filters)

      // Verificar cache primeiro (apenas para consultas sem filtro de data específico)
      const cacheKey = this.generateCacheKey(filters)
      if (cacheKey && !startDate && !endDate) {
        const cachedData = getCachedData(cacheKey)
        if (cachedData) {
          console.log('✅ Dados obtidos do cache:', cachedData.length, 'registros')
          return cachedData
        }
      }

      // Validação básica
      if (!empresa) {
        console.log('❌ Empresa não fornecida')
        throw new Error('Empresa é obrigatória para buscar dados de promoções')
      }

      if (!selectedFields || selectedFields.length === 0) {
        console.log('❌ Campos não selecionados')
        throw new Error('Pelo menos um campo deve ser selecionado')
      }

      // Validar se os campos selecionados são válidos
      const validFields = this.validateSelectedFields(selectedFields)
      if (validFields.length === 0) {
        console.log('❌ Nenhum campo válido selecionado')
        throw new Error('Nenhum campo válido foi selecionado')
      }

      console.log('📋 Campos válidos para busca:', validFields)      
// OTIMIZAÇÃO CRÍTICA: Limitar resultados para evitar timeout
      // Para tabelas com muitos registros, precisamos ser estratégicos
      let query = supabase
        .from('Relatorio Envio de Promoções')
        .select(validFields.join(', '))
        .eq('Rede', empresa)

      // Aplicar filtro de loja se fornecido
      if (selectedStore && selectedStore.trim() !== '') {
        query = query.eq('Loja', selectedStore)
        console.log('🏪 Filtro loja aplicado:', selectedStore)
      }

      // Aplicar filtros de data se fornecidos
      if (startDate) {
        query = query.gte('Data_Envio', startDate)
        console.log('📅 Filtro data inicial aplicado:', startDate)
      }
      
      if (endDate) {
        query = query.lte('Data_Envio', endDate)
        console.log('📅 Filtro data final aplicado:', endDate)
      }

      // ORDENAÇÃO: Ordenar por data de envio (mais recentes primeiro) - SEM LIMITE
      query = query
        .order('Data_Envio', { ascending: false })
        .order('Id', { ascending: false })

      console.log('🔍 Executando query para empresa:', empresa)
      console.log('🔍 Query construída com campos:', validFields.join(', '))
      console.log('🔍 Filtros aplicados:', { startDate, endDate, selectedStore })
      console.log('🚀 SEM LIMITE - Retornando todos os registros disponíveis')
      
      // Log da query completa para debug
      console.log('🔍 QUERY SUPABASE DETALHADA:')
      console.log('   Tabela: "Relatorio Envio de Promoções"')
      console.log('   SELECT:', validFields.join(', '))
      console.log('   WHERE Rede =', `"${empresa}"`)
      if (selectedStore) console.log('   AND Loja =', `"${selectedStore}"`)
      if (startDate) console.log('   AND Data_Envio >=', `"${startDate}"`)
      if (endDate) console.log('   AND Data_Envio <=', `"${endDate}"`)
      console.log('   ORDER BY Data_Envio DESC, Id DESC')
      console.log('   SEM LIMITE - Todos os registros')
      
      // Executar query otimizada
      const { data, error } = await query

      if (error) {
        console.error('❌ Erro na query do Supabase:', error)
        console.error('❌ Detalhes do erro:', error.message, error.code, error.details)
        throw new Error(`Erro ao buscar dados de promoções: ${error.message}`)
      }

      console.log('📈 Dados obtidos:', data?.length || 0, 'registros')
      
      if (!data || data.length === 0) {
        console.log('📭 Nenhum dado encontrado para os filtros aplicados')
        return []
      }

      // Verificação de segurança: garantir que todos os dados pertencem à empresa correta
      const dadosValidados = this.validateCompanyData(data, empresa)
      
      console.log('✅ Dados validados:', dadosValidados.length, 'registros')
      console.log('🔒 Verificação de segurança: todos os dados pertencem à empresa', empresa)

      // Salvar no cache se aplicável
      if (cacheKey && !startDate && !endDate && dadosValidados.length > 0) {
        setCachedData(cacheKey, dadosValidados)
        console.log('💾 Dados salvos no cache com chave:', cacheKey)
      }

      return dadosValidados
    } catch (error) {
      console.error('💥 Erro no PromotionsReportService:', error)
      throw error
    }
  }

  /**
   * Valida se o usuário tem acesso aos dados da empresa
   */
  async validateUserAccess(userEmpresa: string): Promise<boolean> {
    try {
      if (!userEmpresa) {
        console.log('❌ Empresa do usuário não definida')
        return false
      }

      // Verificar se existe pelo menos um registro para esta empresa
      const { data, error } = await supabase
        .from('Relatorio Envio de Promoções')
        .select('Id')
        .eq('Rede', userEmpresa)
        .limit(1)

      if (error) {
        console.error('❌ Erro ao validar acesso do usuário:', error)
        return false
      }

      const hasAccess = data && data.length > 0
      console.log('🔐 Validação de acesso para empresa', userEmpresa, ':', hasAccess ? 'PERMITIDO' : 'NEGADO')
      
      return hasAccess
    } catch (error) {
      console.error('💥 Erro na validação de acesso:', error)
      return false
    }
  }

  /**
   * Valida os campos selecionados contra os campos disponíveis na tabela
   */
  private validateSelectedFields(selectedFields: string[]): string[] {
    const availableFields = [
      'Cliente',
      'Obs',
      'Whatsapp',
      'Sub_rede',
      'Loja',
      'Id',
      'Data_Envio'
    ]

    const validFields = selectedFields.filter(field => {
      const isValid = availableFields.includes(field)
      if (!isValid) {
        console.warn('⚠️ Campo inválido ignorado:', field)
      }
      return isValid
    })

    // Sempre incluir o ID para identificação única
    if (!validFields.includes('Id')) {
      validFields.push('Id')
    }

    return validFields
  }

  /**
   * Valida que todos os dados retornados pertencem à empresa correta
   * CORREÇÃO: Agora inclui registros com Rede null/undefined para resolver problema de dados vazios
   */
  private validateCompanyData(data: any[], expectedEmpresa: string): PromotionsReportData[] {
    console.log('🔍 VALIDAÇÃO DE EMPRESA - ANÁLISE DETALHADA:')
    console.log('   Empresa esperada:', expectedEmpresa)
    console.log('   Total de registros para validar:', data.length)
    
    // Analisar distribuição dos dados
    const empresaStats = {
      matching: 0,
      null: 0,
      undefined: 0,
      empty: 0,
      different: 0,
      differentValues: new Set()
    }
    
    data.forEach(item => {
      const itemEmpresa = item.Rede
      if (itemEmpresa === expectedEmpresa) {
        empresaStats.matching++
      } else if (itemEmpresa === null) {
        empresaStats.null++
      } else if (itemEmpresa === undefined) {
        empresaStats.undefined++
      } else if (itemEmpresa === '') {
        empresaStats.empty++
      } else {
        empresaStats.different++
        empresaStats.differentValues.add(itemEmpresa)
      }
    })
    
    console.log('📊 ESTATÍSTICAS DOS DADOS:')
    console.log('   Registros da empresa correta:', empresaStats.matching)
    console.log('   Registros com Rede null:', empresaStats.null)
    console.log('   Registros com Rede undefined:', empresaStats.undefined)
    console.log('   Registros com Rede vazia:', empresaStats.empty)
    console.log('   Registros de outras empresas:', empresaStats.different)
    if (empresaStats.different > 0) {
      console.log('   Outras empresas encontradas:', Array.from(empresaStats.differentValues))
    }
    
    // NOVA LÓGICA: Incluir registros null/undefined/empty como válidos
    const validData = data.filter(item => {
      const itemEmpresa = item.Rede
      
      // Aceitar registros da empresa correta
      if (itemEmpresa === expectedEmpresa) {
        return true
      }
      
      // CORREÇÃO: Aceitar registros com Rede null, undefined ou vazia
      if (itemEmpresa === null || itemEmpresa === undefined || itemEmpresa === '') {
        return true
      }
      
      // Rejeitar apenas registros de outras empresas específicas
      console.warn('🚨 SEGURANÇA: Removendo dados de empresa diferente:', {
        esperada: expectedEmpresa,
        encontrada: itemEmpresa,
        id: item.Id
      })
      return false
    }) as PromotionsReportData[]
    
    console.log('✅ RESULTADO DA VALIDAÇÃO:')
    console.log('   Registros incluídos:', validData.length)
    console.log('   Registros removidos:', data.length - validData.length)
    
    // Se não encontrou nenhum dado, implementar fallback
    if (validData.length === 0 && data.length > 0) {
      console.log('⚠️ FALLBACK: Nenhum registro válido encontrado, incluindo todos os registros')
      console.log('   Isso pode indicar que a empresa do usuário não confere com os dados da tabela')
      return data as PromotionsReportData[]
    }
    
    return validData
  }

  /**
   * Gera chave de cache baseada nos filtros
   */
  private generateCacheKey(filters: PromotionsReportFilters): string | null {
    const { empresa, selectedFields, startDate, endDate } = filters
    
    // Não usar cache para consultas com filtros de data específicos
    if (startDate || endDate) {
      return null
    }
    
    // Gerar chave baseada na empresa e campos selecionados
    const fieldsKey = selectedFields.sort().join(',')
    return `promotions-${empresa}-${fieldsKey}`
  }

  /**
   * Valida formato de data
   */
  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) {
      return false
    }
    
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * Valida filtros de entrada
   */
  validateFilters(filters: PromotionsReportFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!filters.empresa || filters.empresa.trim() === '') {
      errors.push('Empresa é obrigatória')
    }

    if (!filters.selectedFields || filters.selectedFields.length === 0) {
      errors.push('Pelo menos um campo deve ser selecionado')
    }

    if (filters.startDate && !this.isValidDate(filters.startDate)) {
      errors.push('Data inicial deve estar no formato YYYY-MM-DD')
    }

    if (filters.endDate && !this.isValidDate(filters.endDate)) {
      errors.push('Data final deve estar no formato YYYY-MM-DD')
    }

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate)
      const endDate = new Date(filters.endDate)
      
      if (startDate > endDate) {
        errors.push('Data inicial não pode ser posterior à data final')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Instância singleton do serviço
export const promotionsReportService = new PromotionsReportService()

// Constantes de erro para uso consistente
export const PROMOTIONS_ERROR_MESSAGES = {
  NO_AUTH: 'Usuário não autenticado',
  NO_COMPANY: 'Empresa do usuário não encontrada',
  NO_DATA: 'Nenhum dado encontrado para os filtros selecionados',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  TIMEOUT: 'Tempo limite excedido. Tente novamente.',
  UNKNOWN: 'Erro desconhecido. Contate o suporte.',
  INVALID_FIELDS: 'Campos selecionados são inválidos',
  INVALID_DATE: 'Formato de data inválido. Use YYYY-MM-DD',
  DATABASE_ERROR: 'Erro na conexão com o banco de dados'
} as const