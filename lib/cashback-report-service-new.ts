import { supabase } from './supabase'
import { getCachedData, setCachedData } from './dashboard-optimizations'

export interface CashbackReportData {
  Nome?: string
  Whatsapp?: string
  Loja?: string
  Rede_de_loja?: string
  Envio_novo?: string
  Status?: string
  id: string
}

export interface CashbackReportFilters {
  empresa: string
  selectedFields: string[]
  startDate?: string
  endDate?: string
  selectedStore?: string
}

export class CashbackReportService {
  /**
   * Busca dados de cashback da tabela EnvioCashTemTotal
   * Aplica filtros por empresa, campos selecionados e período de datas
   * Inclui cache para melhorar performance
   */
  async getCashbackData(filters: CashbackReportFilters): Promise<CashbackReportData[]> {
    try {
      const { empresa, selectedFields, startDate, endDate, selectedStore } = filters

      console.log('🔄 CashbackReportService iniciado com filtros:', filters)
      console.log('🔍 ANÁLISE DE DATAS:')
      console.log('   startDate fornecido:', startDate, '(tipo:', typeof startDate, ')')
      console.log('   endDate fornecido:', endDate, '(tipo:', typeof endDate, ')')
      console.log('   startDate é válido?', startDate && startDate.trim() !== '')
      console.log('   endDate é válido?', endDate && endDate.trim() !== '')

      // CORREÇÃO: Verificar cache primeiro (apenas para consultas sem filtro de data específico)
      // Desabilitar cache completamente quando há qualquer filtro de data
      const hasDateFilter = (startDate && startDate.trim() !== '') || (endDate && endDate.trim() !== '')
      const cacheKey = this.generateCacheKey(filters)
      
      if (cacheKey && !hasDateFilter) {
        const cachedData = getCachedData(cacheKey)
        if (cachedData) {
          console.log('✅ Dados obtidos do cache:', cachedData.length, 'registros')
          return cachedData
        }
      } else if (hasDateFilter) {
        console.log('🚫 Cache desabilitado devido a filtros de data')
      }

      // Validação básica
      if (!empresa) {
        console.log('❌ Empresa não fornecida')
        throw new Error('Empresa é obrigatória para buscar dados de cashback')
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

      // CORREÇÃO CRÍTICA: Sempre incluir Rede_de_loja para validação de segurança
      if (!validFields.includes('Rede_de_loja')) {
        validFields.push('Rede_de_loja')
      }

      console.log('📋 Campos válidos para busca (incluindo Rede_de_loja):', validFields)

      // QUERY: Buscar todos os dados da empresa sem limitações
      let query = supabase
        .from('EnvioCashTemTotal')
        .select(validFields.join(', '))
        .eq('Rede_de_loja', empresa)

      // Aplicar filtro de loja se fornecido
      if (selectedStore && selectedStore.trim() !== '') {
        query = query.eq('Loja', selectedStore)
        console.log('🏪 Filtro loja aplicado:', selectedStore)
      }

      // CORREÇÃO: Aplicar filtros de data se fornecidos (com validação mais rigorosa)
      if (startDate && startDate.trim() !== '') {
        query = query.gte('Envio_novo', startDate.trim())
        console.log('📅 Filtro data inicial aplicado:', startDate.trim())
        console.log('📅 Query após filtro inicial:', query)
      } else {
        console.log('⚠️ Data inicial não fornecida ou vazia')
      }
      
      if (endDate && endDate.trim() !== '') {
        query = query.lte('Envio_novo', endDate.trim())
        console.log('📅 Filtro data final aplicado:', endDate.trim())
        console.log('📅 Query após filtro final:', query)
      } else {
        console.log('⚠️ Data final não fornecida ou vazia')
      }

      // ORDENAÇÃO: Ordenar por data de envio (mais recentes primeiro) - SEM LIMITE
      query = query
        .order('Envio_novo', { ascending: false })
        .order('id', { ascending: false })

      console.log('🔍 Executando query para empresa:', empresa)
      console.log('🔍 Query construída com campos:', validFields.join(', '))
      console.log('🔍 Filtros aplicados:', { startDate, endDate, selectedStore })
      console.log('🚀 SEM LIMITE - Retornando todos os registros disponíveis')
      
      // Executar query otimizada (sem timeout customizado, usar o padrão do Supabase)
      const { data, error } = await query

      if (error) {
        console.error('❌ Erro na query do Supabase:', error)
        console.error('❌ Detalhes do erro:', error.message, error.code, error.details)
        throw new Error(`Erro ao buscar dados de cashback: ${error.message}`)
      }

      console.log('📈 Dados obtidos:', data?.length || 0, 'registros')
      
      // VERIFICAÇÃO: Analisar se os filtros de data foram aplicados corretamente
      if (data && data.length > 0) {
        const datesInData = data
          .filter((item: any) => item.Envio_novo)
          .map((item: any) => item.Envio_novo)
          .sort()
        
        if (datesInData.length > 0) {
          console.log('🔍 VERIFICAÇÃO DE FILTROS DE DATA:')
          console.log('   Primeira data nos dados:', datesInData[0])
          console.log('   Última data nos dados:', datesInData[datesInData.length - 1])
          console.log('   Filtro startDate aplicado:', startDate || 'Não aplicado')
          console.log('   Filtro endDate aplicado:', endDate || 'Não aplicado')
          
          // Verificar se há datas fora do período solicitado
          if (startDate && startDate.trim() !== '') {
            const outsideStart = datesInData.filter(date => date < startDate.trim())
            if (outsideStart.length > 0) {
              console.error('❌ PROBLEMA: Encontradas', outsideStart.length, 'datas antes do startDate')
              console.error('   Exemplos:', outsideStart.slice(0, 3))
            }
          }
          
          if (endDate && endDate.trim() !== '') {
            const outsideEnd = datesInData.filter(date => date > endDate.trim() + 'T23:59:59')
            if (outsideEnd.length > 0) {
              console.error('❌ PROBLEMA: Encontradas', outsideEnd.length, 'datas depois do endDate')
              console.error('   Exemplos:', outsideEnd.slice(0, 3))
            }
          }
        }
      }
      
      if (!data || data.length === 0) {
        console.log('📭 Nenhum dado encontrado para os filtros aplicados')
        return []
      }

      // Verificação de segurança: garantir que todos os dados pertencem à empresa correta
      const dadosValidados = this.validateCompanyData(data, empresa)
      
      // Verificação adicional para investigar nomes perdidos
      if (dadosValidados.length > 0) {
        const nomesVazios = dadosValidados.filter(item => !item.Nome || item.Nome === '' || item.Nome === null)
        if (nomesVazios.length > 0) {
          console.warn('⚠️ INVESTIGAÇÃO: Encontrados', nomesVazios.length, 'registros sem nome:')
          nomesVazios.slice(0, 5).forEach((item, index) => {
            console.warn(`   ${index + 1}. ID: ${item.id}, Nome: "${item.Nome}", Whatsapp: "${item.Whatsapp}", Status: "${item.Status}"`)
          })
        }
        
        const nomesComDados = dadosValidados.filter(item => item.Nome && item.Nome !== '' && item.Nome !== null)
        console.log('✅ Registros com nomes válidos:', nomesComDados.length, 'de', dadosValidados.length)
        
        // Investigar distribuição por status
        const statusDistribution = dadosValidados.reduce((acc, item) => {
          const status = item.Status || 'SEM_STATUS'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('📊 Distribuição por status:', statusDistribution)
        
        // Verificar se registros sem nome têm status específico
        const statusSemNome = nomesVazios.reduce((acc, item) => {
          const status = item.Status || 'SEM_STATUS'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        if (Object.keys(statusSemNome).length > 0) {
          console.warn('⚠️ Status dos registros sem nome:', statusSemNome)
        }
      }
      
      console.log('✅ Dados validados:', dadosValidados.length, 'registros')
      console.log('🔒 Verificação de segurança: todos os dados pertencem à empresa', empresa)

      // CORREÇÃO: Salvar no cache apenas se não há filtros de data
      const shouldCache = cacheKey && !hasDateFilter && dadosValidados.length > 0
      if (shouldCache) {
        setCachedData(cacheKey, dadosValidados)
        console.log('💾 Dados salvos no cache com chave:', cacheKey)
      } else if (hasDateFilter) {
        console.log('🚫 Cache não utilizado devido a filtros de data')
      }

      return dadosValidados
    } catch (error) {
      console.error('💥 Erro no CashbackReportService:', error)
      throw error
    }
  }

  /**
   * Valida se o usuário tem acesso aos dados da empresa
   */
  async validateUserAccess(userEmpresa: string): Promise<boolean> {
    try {
      if (!userEmpresa) {
        console.log('❌ VALIDAÇÃO FALHOU: Empresa do usuário não definida')
        return false
      }

      console.log('🔍 Verificando acesso para empresa:', userEmpresa)

      // Verificar se existe pelo menos um registro para esta empresa
      const { data, error } = await supabase
        .from('EnvioCashTemTotal')
        .select('id, Rede_de_loja')
        .eq('Rede_de_loja', userEmpresa)
        .limit(1)

      if (error) {
        console.error('❌ ERRO SUPABASE na validação de acesso:', {
          empresa: userEmpresa,
          error: error.message,
          code: error.code,
          details: error.details
        })
        return false
      }

      const hasAccess = data && data.length > 0
      
      if (hasAccess) {
        console.log('✅ ACESSO PERMITIDO para empresa:', userEmpresa)
        console.log('📊 Registro encontrado:', data[0])
      } else {
        console.log('❌ ACESSO NEGADO para empresa:', userEmpresa)
        console.log('📊 Nenhum registro encontrado na tabela EnvioCashTemTotal')
        
        // Investigar empresas disponíveis para debug
        console.log('🔍 Investigando empresas disponíveis na tabela...')
        const { data: allCompanies, error: companiesError } = await supabase
          .from('EnvioCashTemTotal')
          .select('Rede_de_loja')
          .not('Rede_de_loja', 'is', null)
          .limit(10)
        
        if (!companiesError && allCompanies) {
          const uniqueCompanies = [...new Set(allCompanies.map(c => c.Rede_de_loja))]
          console.log('📋 Empresas disponíveis na tabela:', uniqueCompanies)
          console.log('🔍 Empresa solicitada está na lista?', uniqueCompanies.includes(userEmpresa))
        }
      }
      
      return hasAccess
    } catch (error) {
      console.error('💥 ERRO CRÍTICO na validação de acesso:', {
        empresa: userEmpresa,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : 'N/A'
      })
      return false
    }
  }

  /**
   * Valida os campos selecionados contra os campos disponíveis na tabela
   */
  private validateSelectedFields(selectedFields: string[]): string[] {
    const availableFields = [
      'Nome',
      'Whatsapp', 
      'Loja',
      'Rede_de_loja',
      'Envio_novo',
      'Status',
      'id'
    ]

    const validFields = selectedFields.filter(field => {
      const isValid = availableFields.includes(field)
      if (!isValid) {
        console.warn('⚠️ Campo inválido ignorado:', field)
      }
      return isValid
    })

    // Sempre incluir o ID para identificação única
    if (!validFields.includes('id')) {
      validFields.push('id')
    }

    return validFields
  }

  /**
   * Valida que todos os dados retornados pertencem à empresa correta
   */
  private validateCompanyData(data: any[], expectedEmpresa: string): CashbackReportData[] {
    return data.filter(item => {
      const itemEmpresa = item.Rede_de_loja
      const isValid = itemEmpresa === expectedEmpresa
      
      if (!isValid) {
        console.warn('🚨 SEGURANÇA: Removendo dados de empresa não autorizada:', {
          esperada: expectedEmpresa,
          encontrada: itemEmpresa,
          id: item.id
        })
      }
      
      return isValid
    }) as CashbackReportData[]
  }

  /**
   * Busca estatísticas básicas dos dados de cashback para uma empresa
   */
  async getCashbackStats(empresa: string): Promise<{
    total: number
    enviados: number
    pendentes: number
    ultimoEnvio?: string
  }> {
    try {
      console.log('📊 Buscando estatísticas de cashback para empresa:', empresa)

      const { data, error } = await supabase
        .from('EnvioCashTemTotal')
        .select('Status, Envio_novo')
        .eq('Rede_de_loja', empresa)

      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error)
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return {
          total: 0,
          enviados: 0,
          pendentes: 0
        }
      }

      const stats = {
        total: data.length,
        enviados: data.filter(item => item.Status === 'Enviada').length,
        pendentes: data.filter(item => item.Status !== 'Enviada').length,
        ultimoEnvio: data
          .filter(item => item.Envio_novo)
          .sort((a, b) => new Date(b.Envio_novo).getTime() - new Date(a.Envio_novo).getTime())[0]?.Envio_novo
      }

      console.log('📊 Estatísticas calculadas:', stats)
      return stats
    } catch (error) {
      console.error('💥 Erro ao calcular estatísticas:', error)
      throw error
    }
  }

  /**
   * Gera chave de cache baseada nos filtros
   */
  private generateCacheKey(filters: CashbackReportFilters): string | null {
    const { empresa, selectedFields, startDate, endDate } = filters
    
    // Não usar cache para consultas com filtros de data específicos
    if (startDate || endDate) {
      return null
    }
    
    // Gerar chave baseada na empresa e campos selecionados
    const fieldsKey = selectedFields.sort().join(',')
    return `cashback-${empresa}-${fieldsKey}`
  }

  /**
   * Limpa cache relacionado a uma empresa específica
   */
  clearCompanyCache(empresa: string): void {
    try {
      // Esta função seria implementada no dashboard-optimizations
      // para limpar entradas de cache que começam com "cashback-{empresa}-"
      console.log('🧹 Limpando cache para empresa:', empresa)
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error)
    }
  }

  /**
   * REMOVIDO: Método de otimização com limites
   * O relatório deve retornar todos os dados disponíveis sem limitações
   */

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
  validateFilters(filters: CashbackReportFilters): { isValid: boolean; errors: string[] } {
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
export const cashbackReportService = new CashbackReportService()

// Constantes de erro para uso consistente
export const CASHBACK_ERROR_MESSAGES = {
  NO_AUTH: 'Usuário não autenticado',
  NO_COMPANY: 'Empresa do usuário não encontrada',
  NO_DATA: 'Nenhum dado de cashback encontrado para a sua empresa',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  TIMEOUT: 'Tempo limite excedido. Tente novamente.',
  UNKNOWN: 'Erro desconhecido. Contate o suporte.',
  INVALID_FIELDS: 'Campos selecionados são inválidos',
  INVALID_DATE: 'Formato de data inválido. Use YYYY-MM-DD',
  DATABASE_ERROR: 'Erro na conexão com o banco de dados'
} as const