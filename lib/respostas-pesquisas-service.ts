import { supabase } from './supabase'
import { getCachedData, setCachedData } from './dashboard-optimizations'

// Cache TTL em milissegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000

interface CachedData<T> {
  data: T
  timestamp: number
}

// Função para verificar se o cache ainda é válido
const isCacheValid = (cachedItem: CachedData<any> | null): boolean => {
  if (!cachedItem) return false
  return Date.now() - cachedItem.timestamp < CACHE_TTL
}

// Função para obter dados do cache com TTL
const getCachedDataWithTTL = <T>(key: string): T | null => {
  const cachedItem = getCachedData(key) as CachedData<T> | null
  if (isCacheValid(cachedItem)) {
    return cachedItem!.data
  }
  return null
}

// Função para salvar dados no cache com timestamp
const setCachedDataWithTTL = <T>(key: string, data: T): void => {
  const cachedItem: CachedData<T> = {
    data,
    timestamp: Date.now()
  }
  setCachedData(key, cachedItem)
}

export interface RespostaPesquisaData {
  loja: string
  Ótimo: number
  Bom: number
  Regular: number
  Péssimo: number
}

export interface RespostasPesquisasStats {
  totalRespostas: number
  ultimaResposta: string | null
  respostasPorLoja: Array<{
    loja: string
    quantidade: number
  }>
}

export async function getRespostasPesquisasByStore(empresa: string): Promise<RespostaPesquisaData[]> {
  const startTime = Date.now()
  
  // Validação de entrada
  if (!empresa || typeof empresa !== 'string' || empresa.trim().length === 0) {
    console.warn('[RespostasPesquisas] Empresa inválida fornecida para getRespostasPesquisasByStore:', { empresa })
    return []
  }

  const empresaLimpa = empresa.trim()
  
  try {
    console.debug('[RespostasPesquisas] Iniciando busca de dados por loja para empresa:', empresaLimpa)
    
    // Verifica cache primeiro
    const cacheKey = `respostas-pesquisas-${empresaLimpa}`
    const cachedData = getCachedDataWithTTL<RespostaPesquisaData[]>(cacheKey)
    if (cachedData) {
      console.debug('[RespostasPesquisas] Dados encontrados no cache:', { empresa: empresaLimpa, items: cachedData.length })
      return cachedData
    }

    // Busca registros da empresa com otimizações
    const { data, error } = await supabase
      .from('respostas_pesquisas')
      .select('loja, resposta')
      .eq('rede', empresaLimpa)
      .not('loja', 'is', null)
      .not('resposta', 'is', null)
      .in('resposta', ['1', '2', '3', '4']) // Filtra apenas respostas válidas
      // REMOVIDO: Limite removido para retornar todos os dados disponíveis

    if (error) {
      console.error('[RespostasPesquisas] Erro ao buscar respostas de pesquisas por loja:', {
        empresa: empresaLimpa,
        error: error.message,
        code: error.code,
        details: error.details
      })
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Agrupa os dados por loja e conta as respostas
    const storeResponses: { [key: string]: { [key: string]: number } } = {}
    
    data.forEach((item) => {
      const loja = item.loja?.toString().trim() || 'Sem Loja'
      const resposta = item.resposta?.toString().trim()
      
      if (!storeResponses[loja]) {
        storeResponses[loja] = {
          'Ótimo': 0,
          'Bom': 0,
          'Regular': 0,
          'Péssimo': 0
        }
      }

      // Mapeia os números para as classificações
      switch (resposta) {
        case '1':
          storeResponses[loja]['Ótimo']++
          break
        case '2':
          storeResponses[loja]['Bom']++
          break
        case '3':
          storeResponses[loja]['Regular']++
          break
        case '4':
          storeResponses[loja]['Péssimo']++
          break
      }
    })

    // Converte para o formato esperado pelo gráfico
    const result: RespostaPesquisaData[] = Object.entries(storeResponses)
      .map(([loja, respostas]) => ({
        loja,
        Ótimo: respostas['Ótimo'],
        Bom: respostas['Bom'],
        Regular: respostas['Regular'],
        Péssimo: respostas['Péssimo']
      }))
      .sort((a, b) => {
        // Ordena numericamente se possível, senão alfabeticamente
        const aNum = parseInt(a.loja)
        const bNum = parseInt(b.loja)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        
        return a.loja.localeCompare(b.loja)
      })

    // Salva no cache com TTL
    setCachedDataWithTTL(cacheKey, result)
    
    const duration = Date.now() - startTime
    console.debug('[RespostasPesquisas] Busca concluída com sucesso:', {
      empresa: empresaLimpa,
      lojas: result.length,
      duration: `${duration}ms`
    })
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[RespostasPesquisas] Erro no serviço de respostas de pesquisas por loja:', {
      empresa: empresaLimpa,
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`
    })
    return []
  }
}

export async function getRespostasPesquisasStats(empresa: string): Promise<RespostasPesquisasStats> {
  try {
    // Validação de entrada
    if (!empresa || typeof empresa !== 'string' || empresa.trim().length === 0) {
      console.warn('Empresa inválida fornecida para getRespostasPesquisasStats')
      return {
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      }
    }

    const empresaLimpa = empresa.trim()
    
    // Verifica cache primeiro
    const cacheKey = `respostas-pesquisas-stats-${empresaLimpa}`
    const cachedData = getCachedDataWithTTL<RespostasPesquisasStats>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Busca registros da empresa com otimizações
    const { data, error } = await supabase
      .from('respostas_pesquisas')
      .select('loja, resposta, criado_em')
      .eq('rede', empresaLimpa)
      .not('loja', 'is', null)
      .not('resposta', 'is', null)
      .in('resposta', ['1', '2', '3', '4']) // Filtra apenas respostas válidas
      .order('criado_em', { ascending: false })
      // REMOVIDO: Limite removido para retornar todos os dados disponíveis

    if (error) {
      console.error('Erro ao buscar estatísticas de respostas de pesquisas:', error)
      return {
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      }
    }

    if (!data || data.length === 0) {
      return {
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      }
    }

    // Calcula estatísticas
    const totalRespostas = data.length
    const ultimaResposta = data.length > 0 ? data[0].criado_em : null

    // Agrupa respostas por loja
    const respostasPorLojaMap: { [key: string]: number } = {}
    
    data.forEach((item) => {
      const loja = item.loja?.toString().trim() || 'Sem Loja'
      respostasPorLojaMap[loja] = (respostasPorLojaMap[loja] || 0) + 1
    })

    // Converte para array e ordena
    const respostasPorLoja = Object.entries(respostasPorLojaMap)
      .map(([loja, quantidade]) => ({ loja, quantidade }))
      .sort((a, b) => {
        // Ordena numericamente se possível, senão alfabeticamente
        const aNum = parseInt(a.loja)
        const bNum = parseInt(b.loja)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        
        return a.loja.localeCompare(b.loja)
      })

    const result: RespostasPesquisasStats = {
      totalRespostas,
      ultimaResposta,
      respostasPorLoja
    }

    // Salva no cache com TTL
    setCachedDataWithTTL(cacheKey, result)
    
    return result
  } catch (error) {
    console.error('Erro no serviço de estatísticas de respostas de pesquisas:', error)
    return {
      totalRespostas: 0,
      ultimaResposta: null,
      respostasPorLoja: []
    }
  }
}

// Função para limpar cache específico da empresa
export const clearRespostasPesquisasCache = (empresa: string): void => {
  if (!empresa || typeof empresa !== 'string') return
  
  const empresaLimpa = empresa.trim()
  const cacheKeyData = `respostas-pesquisas-${empresaLimpa}`
  const cacheKeyStats = `respostas-pesquisas-stats-${empresaLimpa}`
  
  // Importa a função de limpeza de cache
  import('./dashboard-optimizations').then(({ clearCacheByKey }) => {
    clearCacheByKey(cacheKeyData)
    clearCacheByKey(cacheKeyStats)
  })
}

// Função para pré-carregar dados (pode ser chamada em background)
export const preloadRespostasPesquisasData = async (empresa: string): Promise<void> => {
  try {
    if (!empresa || typeof empresa !== 'string' || empresa.trim().length === 0) return
    
    // Carrega dados em paralelo sem aguardar
    Promise.all([
      getRespostasPesquisasByStore(empresa),
      getRespostasPesquisasStats(empresa)
    ]).catch(error => {
      console.warn('Erro ao pré-carregar dados de respostas de pesquisas:', error)
    })
  } catch (error) {
    console.warn('Erro no pré-carregamento de respostas de pesquisas:', error)
  }
}