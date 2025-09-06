import { getRespostasPesquisasByStore, getRespostasPesquisasStats, RespostaPesquisaData, RespostasPesquisasStats } from '@/lib/respostas-pesquisas-service'

// Mock do Supabase
const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
}

const mockSupabase = {
  from: jest.fn(() => mockSupabaseQuery)
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock do cache
const mockGetCachedData = jest.fn()
const mockSetCachedData = jest.fn()

jest.mock('@/lib/dashboard-optimizations', () => ({
  getCachedData: mockGetCachedData,
  setCachedData: mockSetCachedData
}))

describe('Respostas Pesquisas Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCachedData.mockReturnValue(null)
  })

  describe('getRespostasPesquisasByStore', () => {
    it('should return empty array for invalid empresa parameter', async () => {
      const result1 = await getRespostasPesquisasByStore('')
      const result2 = await getRespostasPesquisasByStore('   ')
      const result3 = await getRespostasPesquisasByStore(null as any)
      const result4 = await getRespostasPesquisasByStore(undefined as any)

      expect(result1).toEqual([])
      expect(result2).toEqual([])
      expect(result3).toEqual([])
      expect(result4).toEqual([])
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return cached data when available', async () => {
      const cachedData: RespostaPesquisaData[] = [
        { loja: '1', Ótimo: 5, Bom: 3, Regular: 2, Péssimo: 1 }
      ]
      mockGetCachedData.mockReturnValue(cachedData)

      const result = await getRespostasPesquisasByStore('TestEmpresa')

      expect(result).toEqual(cachedData)
      expect(mockSupabase.from).not.toHaveBeenCalled()
      expect(mockGetCachedData).toHaveBeenCalledWith('respostas-pesquisas-TestEmpresa')
    })

    it('should fetch data from database when cache is empty', async () => {
      const mockData = [
        { loja: '1', resposta: '1' },
        { loja: '1', resposta: '2' },
        { loja: '2', resposta: '1' },
        { loja: '2', resposta: '3' }
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await getRespostasPesquisasByStore('TestEmpresa')

      expect(mockSupabase.from).toHaveBeenCalledWith('respostas_pesquisas')
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('loja, resposta')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('rede', 'TestEmpresa')
      expect(mockSupabaseQuery.not).toHaveBeenCalledWith('loja', 'is', null)
      expect(mockSupabaseQuery.not).toHaveBeenCalledWith('resposta', 'is', null)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ loja: '1', Ótimo: 1, Bom: 1, Regular: 0, Péssimo: 0 })
      expect(result[1]).toEqual({ loja: '2', Ótimo: 1, Bom: 0, Regular: 1, Péssimo: 0 })
      expect(mockSetCachedData).toHaveBeenCalledWith('respostas-pesquisas-TestEmpresa', result)
    })

    it('should handle database errors gracefully', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getRespostasPesquisasByStore('TestEmpresa')

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar respostas de pesquisas por loja:', { message: 'Database error' })
      
      consoleSpy.mockRestore()
    })

    it('should return empty array when no data is found', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await getRespostasPesquisasByStore('TestEmpresa')

      expect(result).toEqual([])
    })

    it('should map response numbers to correct categories', async () => {
      const mockData = [
        { loja: '1', resposta: '1' }, // Ótimo
        { loja: '1', resposta: '2' }, // Bom
        { loja: '1', resposta: '3' }, // Regular
        { loja: '1', resposta: '4' }, // Péssimo
        { loja: '1', resposta: '5' }, // Invalid - should be ignored
        { loja: '1', resposta: null }, // Should be filtered out by query
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await getRespostasPesquisasByStore('TestEmpresa')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        loja: '1',
        Ótimo: 1,
        Bom: 1,
        Regular: 1,
        Péssimo: 1
      })
    })

    it('should sort stores numerically when possible', async () => {
      const mockData = [
        { loja: '10', resposta: '1' },
        { loja: '2', resposta: '1' },
        { loja: '1', resposta: '1' },
        { loja: 'ABC', resposta: '1' },
        { loja: 'DEF', resposta: '1' }
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await getRespostasPesquisasByStore('TestEmpresa')

      expect(result.map(r => r.loja)).toEqual(['1', '2', '10', 'ABC', 'DEF'])
    })

    it('should handle service exceptions', async () => {
      mockSupabaseQuery.order.mockRejectedValue(new Error('Service error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getRespostasPesquisasByStore('TestEmpresa')

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Erro no serviço de respostas de pesquisas por loja:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('getRespostasPesquisasStats', () => {
    it('should return default stats for invalid empresa parameter', async () => {
      const defaultStats = {
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      }

      const result1 = await getRespostasPesquisasStats('')
      const result2 = await getRespostasPesquisasStats('   ')
      const result3 = await getRespostasPesquisasStats(null as any)
      const result4 = await getRespostasPesquisasStats(undefined as any)

      expect(result1).toEqual(defaultStats)
      expect(result2).toEqual(defaultStats)
      expect(result3).toEqual(defaultStats)
      expect(result4).toEqual(defaultStats)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return cached stats when available', async () => {
      const cachedStats: RespostasPesquisasStats = {
        totalRespostas: 10,
        ultimaResposta: '2024-01-01T00:00:00Z',
        respostasPorLoja: [{ loja: '1', quantidade: 10 }]
      }
      mockGetCachedData.mockReturnValue(cachedStats)

      const result = await getRespostasPesquisasStats('TestEmpresa')

      expect(result).toEqual(cachedStats)
      expect(mockSupabase.from).not.toHaveBeenCalled()
      expect(mockGetCachedData).toHaveBeenCalledWith('respostas-pesquisas-stats-TestEmpresa')
    })

    it('should calculate stats correctly from database data', async () => {
      const mockData = [
        { loja: '1', resposta: '1', criado_em: '2024-01-03T00:00:00Z' },
        { loja: '1', resposta: '2', criado_em: '2024-01-02T00:00:00Z' },
        { loja: '2', resposta: '1', criado_em: '2024-01-01T00:00:00Z' },
        { loja: '2', resposta: '3', criado_em: '2024-01-01T00:00:00Z' }
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await getRespostasPesquisasStats('TestEmpresa')

      expect(mockSupabase.from).toHaveBeenCalledWith('respostas_pesquisas')
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('loja, resposta, criado_em')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('rede', 'TestEmpresa')
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('criado_em', { ascending: false })

      expect(result.totalRespostas).toBe(4)
      expect(result.ultimaResposta).toBe('2024-01-03T00:00:00Z')
      expect(result.respostasPorLoja).toHaveLength(2)
      expect(result.respostasPorLoja[0]).toEqual({ loja: '1', quantidade: 2 })
      expect(result.respostasPorLoja[1]).toEqual({ loja: '2', quantidade: 2 })
      expect(mockSetCachedData).toHaveBeenCalledWith('respostas-pesquisas-stats-TestEmpresa', result)
    })

    it('should handle database errors gracefully', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getRespostasPesquisasStats('TestEmpresa')

      expect(result).toEqual({
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      })
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar estatísticas de respostas de pesquisas:', { message: 'Database error' })
      
      consoleSpy.mockRestore()
    })

    it('should return default stats when no data is found', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await getRespostasPesquisasStats('TestEmpresa')

      expect(result).toEqual({
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      })
    })

    it('should handle service exceptions', async () => {
      mockSupabaseQuery.order.mockRejectedValue(new Error('Service error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getRespostasPesquisasStats('TestEmpresa')

      expect(result).toEqual({
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      })
      expect(consoleSpy).toHaveBeenCalledWith('Erro no serviço de estatísticas de respostas de pesquisas:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should sort stores by loja correctly', async () => {
      const mockData = [
        { loja: '10', resposta: '1', criado_em: '2024-01-01T00:00:00Z' },
        { loja: '2', resposta: '1', criado_em: '2024-01-01T00:00:00Z' },
        { loja: '1', resposta: '1', criado_em: '2024-01-01T00:00:00Z' },
        { loja: 'ABC', resposta: '1', criado_em: '2024-01-01T00:00:00Z' },
        { loja: 'DEF', resposta: '1', criado_em: '2024-01-01T00:00:00Z' }
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await getRespostasPesquisasStats('TestEmpresa')

      expect(result.respostasPorLoja.map(r => r.loja)).toEqual(['1', '2', '10', 'ABC', 'DEF'])
    })
  })
})