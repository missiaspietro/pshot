import { CashbackReportService, CASHBACK_ERROR_MESSAGES } from '@/lib/cashback-report-service-new'

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => ({
                // Mock da resposta da query
                then: jest.fn()
              }))
            }))
          }))
        }))
      }))
    }))
  }
}))

describe('CashbackReportService', () => {
  let service: CashbackReportService

  beforeEach(() => {
    service = new CashbackReportService()
    jest.clearAllMocks()
  })

  describe('validateFilters', () => {
    it('should validate valid filters', () => {
      const filters = {
        empresa: 'Test Company',
        selectedFields: ['Nome', 'Whatsapp'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      const result = service.validateFilters(filters)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject filters without empresa', () => {
      const filters = {
        empresa: '',
        selectedFields: ['Nome', 'Whatsapp'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      const result = service.validateFilters(filters)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Empresa é obrigatória')
    })

    it('should reject filters without selectedFields', () => {
      const filters = {
        empresa: 'Test Company',
        selectedFields: [],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      const result = service.validateFilters(filters)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Pelo menos um campo deve ser selecionado')
    })

    it('should reject invalid date formats', () => {
      const filters = {
        empresa: 'Test Company',
        selectedFields: ['Nome'],
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      }

      const result = service.validateFilters(filters)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data inicial deve estar no formato YYYY-MM-DD')
    })

    it('should reject when start date is after end date', () => {
      const filters = {
        empresa: 'Test Company',
        selectedFields: ['Nome'],
        startDate: '2024-01-31',
        endDate: '2024-01-01'
      }

      const result = service.validateFilters(filters)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data inicial não pode ser posterior à data final')
    })
  })

  describe('validateSelectedFields', () => {
    it('should filter valid fields and add id if missing', () => {
      const service = new CashbackReportService()
      const selectedFields = ['Nome', 'Whatsapp', 'InvalidField']
      
      // Access private method for testing
      const validFields = (service as any).validateSelectedFields(selectedFields)

      expect(validFields).toContain('Nome')
      expect(validFields).toContain('Whatsapp')
      expect(validFields).toContain('id')
      expect(validFields).not.toContain('InvalidField')
    })

    it('should always include id field', () => {
      const service = new CashbackReportService()
      const selectedFields = ['Nome']
      
      const validFields = (service as any).validateSelectedFields(selectedFields)

      expect(validFields).toContain('id')
    })
  })

  describe('validateCompanyData', () => {
    it('should filter data to only include records from expected company', () => {
      const service = new CashbackReportService()
      const mockData = [
        { id: '1', Nome: 'User 1', Rede_de_loja: 'Company A' },
        { id: '2', Nome: 'User 2', Rede_de_loja: 'Company B' },
        { id: '3', Nome: 'User 3', Rede_de_loja: 'Company A' }
      ]
      
      const validatedData = (service as any).validateCompanyData(mockData, 'Company A')

      expect(validatedData).toHaveLength(2)
      expect(validatedData[0].id).toBe('1')
      expect(validatedData[1].id).toBe('3')
    })

    it('should return empty array when no data matches company', () => {
      const service = new CashbackReportService()
      const mockData = [
        { id: '1', Nome: 'User 1', Rede_de_loja: 'Company B' },
        { id: '2', Nome: 'User 2', Rede_de_loja: 'Company C' }
      ]
      
      const validatedData = (service as any).validateCompanyData(mockData, 'Company A')

      expect(validatedData).toHaveLength(0)
    })
  })

  describe('getCashbackData', () => {
    it('should throw error when empresa is not provided', async () => {
      const filters = {
        empresa: '',
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      await expect(service.getCashbackData(filters)).rejects.toThrow('Empresa é obrigatória para buscar dados de cashback')
    })

    it('should throw error when no fields are selected', async () => {
      const filters = {
        empresa: 'Test Company',
        selectedFields: [],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      await expect(service.getCashbackData(filters)).rejects.toThrow('Pelo menos um campo deve ser selecionado')
    })
  })

  describe('getCashbackStats', () => {
    it('should return zero stats when no data is found', async () => {
      // Mock Supabase to return empty data
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      const stats = await service.getCashbackStats('Test Company')

      expect(stats.total).toBe(0)
      expect(stats.enviados).toBe(0)
      expect(stats.pendentes).toBe(0)
      expect(stats.ultimoEnvio).toBeUndefined()
    })

    it('should calculate stats correctly with sample data', async () => {
      const mockData = [
        { Status: 'Enviada', Envio_novo: '2024-01-15' },
        { Status: 'Enviada', Envio_novo: '2024-01-10' },
        { Status: 'Pendente', Envio_novo: '2024-01-05' }
      ]

      // Mock Supabase to return sample data
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockData,
            error: null
          })
        })
      })

      const stats = await service.getCashbackStats('Test Company')

      expect(stats.total).toBe(3)
      expect(stats.enviados).toBe(2)
      expect(stats.pendentes).toBe(1)
      expect(stats.ultimoEnvio).toBe('2024-01-15')
    })
  })

  describe('validateUserAccess', () => {
    it('should return false when empresa is not provided', async () => {
      const hasAccess = await service.validateUserAccess('')

      expect(hasAccess).toBe(false)
    })

    it('should return true when user has access to company data', async () => {
      // Mock Supabase to return data indicating access
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [{ id: '1' }],
              error: null
            })
          })
        })
      })

      const hasAccess = await service.validateUserAccess('Test Company')

      expect(hasAccess).toBe(true)
    })

    it('should return false when user has no access to company data', async () => {
      // Mock Supabase to return empty data
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      })

      const hasAccess = await service.validateUserAccess('Test Company')

      expect(hasAccess).toBe(false)
    })

    it('should return false when database error occurs', async () => {
      // Mock Supabase to return error
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })

      const hasAccess = await service.validateUserAccess('Test Company')

      expect(hasAccess).toBe(false)
    })
  })

  describe('Error Messages', () => {
    it('should have all required error messages defined', () => {
      expect(CASHBACK_ERROR_MESSAGES.NO_AUTH).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.NO_COMPANY).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.NO_DATA).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.NETWORK_ERROR).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.TIMEOUT).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.UNKNOWN).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.INVALID_FIELDS).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.INVALID_DATE).toBeDefined()
      expect(CASHBACK_ERROR_MESSAGES.DATABASE_ERROR).toBeDefined()
    })

    it('should have consistent error message format', () => {
      Object.values(CASHBACK_ERROR_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Integration Tests', () => {
  describe('Full workflow simulation', () => {
    it('should handle complete data retrieval workflow', async () => {
      const service = new CashbackReportService()
      
      // Mock successful data retrieval
      const mockData = [
        {
          id: '1',
          Nome: 'João Silva',
          Whatsapp: '11999999999',
          Loja: 'Loja 1',
          Rede_de_loja: 'Test Company',
          Envio_novo: '2024-01-15',
          Status: 'Enviada'
        }
      ]

      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockData,
                  error: null
                })
              })
            })
          })
        })
      })

      const filters = {
        empresa: 'Test Company',
        selectedFields: ['Nome', 'Whatsapp', 'Loja'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      const result = await service.getCashbackData(filters)

      expect(result).toHaveLength(1)
      expect(result[0].Nome).toBe('João Silva')
      expect(result[0].Rede_de_loja).toBe('Test Company')
    })

    it('should handle database errors gracefully', async () => {
      const service = new CashbackReportService()
      
      // Mock database error
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Connection failed', code: 'PGRST301' }
                })
              })
            })
          })
        })
      })

      const filters = {
        empresa: 'Test Company',
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }

      await expect(service.getCashbackData(filters)).rejects.toThrow('Erro ao buscar dados de cashback: Connection failed')
    })
  })
})