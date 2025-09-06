import { NextRequest } from 'next/server'
import { POST } from '@/app/api/reports/cashback/route'

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          limit: jest.fn(() => ({
            then: jest.fn()
          })),
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => ({
                then: jest.fn()
              }))
            }))
          }))
        }))
      }))
    }))
  }))
}))

// Mock do serviço de cashback
jest.mock('@/lib/cashback-report-service-new', () => ({
  cashbackReportService: {
    validateFilters: jest.fn(),
    validateUserAccess: jest.fn(),
    getCashbackData: jest.fn()
  },
  CASHBACK_ERROR_MESSAGES: {
    NO_AUTH: 'Usuário não autenticado',
    NO_COMPANY: 'Empresa do usuário não encontrada',
    NO_DATA: 'Nenhum dado encontrado para os filtros selecionados',
    INVALID_FIELDS: 'Campos selecionados são inválidos',
    UNKNOWN: 'Erro desconhecido. Contate o suporte.'
  }
}))

describe('/api/reports/cashback Integration Tests', () => {
  let mockSupabase: any
  let mockCashbackService: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Get mock instances
    mockSupabase = require('@supabase/supabase-js').createClient()
    mockCashbackService = require('@/lib/cashback-report-service-new').cashbackReportService
  })

  const createMockRequest = (body: any, cookies?: string) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      headers: {
        get: jest.fn().mockImplementation((header: string) => {
          if (header === 'cookie') {
            return cookies || ''
          }
          return null
        })
      }
    } as unknown as NextRequest
  }

  describe('Authentication and Authorization', () => {
    it('should return 401 when no session cookie is present', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Usuário não autenticado')
    })

    it('should return 401 when user is not found in database', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      // Mock user not found
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'User not found' }
              })
            })
          })
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Usuário não autenticado')
    })

    it('should return 400 when user has no company defined', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      // Mock user without company
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 1,
                  email: 'test@example.com',
                  nome: 'Test User',
                  empresa: null,
                  rede: null
                },
                error: null
              })
            })
          })
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Empresa do usuário não encontrada')
    })

    it('should return 403 when user has no access to company data', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      // Mock user with company
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 1,
                  email: 'test@example.com',
                  nome: 'Test User',
                  empresa: 'Test Company',
                  rede: null
                },
                error: null
              })
            })
          })
        })
      })

      // Mock validation methods
      mockCashbackService.validateFilters.mockReturnValue({ isValid: true, errors: [] })
      mockCashbackService.validateUserAccess.mockResolvedValue(false)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Usuário não autorizado para acessar dados desta empresa')
    })
  })

  describe('Input Validation', () => {
    it('should return 400 when selectedFields is empty', async () => {
      const request = createMockRequest({
        selectedFields: [],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Campos selecionados são inválidos')
    })

    it('should return 400 when selectedFields is not an array', async () => {
      const request = createMockRequest({
        selectedFields: 'Nome',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Campos selecionados são inválidos')
    })

    it('should return 400 when filters are invalid', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      // Mock user with company
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 1,
                  email: 'test@example.com',
                  nome: 'Test User',
                  empresa: 'Test Company',
                  rede: null
                },
                error: null
              })
            })
          })
        })
      })

      // Mock invalid filters
      mockCashbackService.validateFilters.mockReturnValue({
        isValid: false,
        errors: ['Data inicial deve estar no formato YYYY-MM-DD']
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Data inicial deve estar no formato YYYY-MM-DD')
    })
  })

  describe('Successful Data Retrieval', () => {
    it('should return cashback data successfully', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome', 'Whatsapp'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        nome: 'Test User',
        empresa: 'Test Company',
        rede: null
      }

      const mockCashbackData = [
        {
          id: '1',
          Nome: 'João Silva',
          Whatsapp: '11999999999',
          Rede_de_loja: 'Test Company'
        }
      ]

      // Mock user lookup
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockUserData,
                    error: null
                  })
                })
              })
            })
          }
        } else if (table === 'EnvioCashTemTotal') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ Rede_de_loja: 'Test Company' }],
                  error: null
                })
              })
            })
          }
        }
        return {}
      })

      // Mock service methods
      mockCashbackService.validateFilters.mockReturnValue({ isValid: true, errors: [] })
      mockCashbackService.validateUserAccess.mockResolvedValue(true)
      mockCashbackService.getCashbackData.mockResolvedValue(mockCashbackData)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].Nome).toBe('João Silva')
      expect(data.total).toBe(1)
      expect(data.userEmpresa).toBe('Test Company')
      expect(data.userInfo.email).toBe('test@example.com')
    })

    it('should return empty data when no records found', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        nome: 'Test User',
        empresa: 'Test Company',
        rede: null
      }

      // Mock user lookup
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockUserData,
                    error: null
                  })
                })
              })
            })
          }
        } else if (table === 'EnvioCashTemTotal') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ Rede_de_loja: 'Test Company' }],
                  error: null
                })
              })
            })
          }
        }
        return {}
      })

      // Mock service methods
      mockCashbackService.validateFilters.mockReturnValue({ isValid: true, errors: [] })
      mockCashbackService.validateUserAccess.mockResolvedValue(true)
      mockCashbackService.getCashbackData.mockResolvedValue([])

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
      expect(data.total).toBe(0)
      expect(data.message).toBe('Nenhum dado encontrado para os filtros selecionados')
    })

    it('should prioritize rede over empresa field', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        nome: 'Test User',
        empresa: 'Old Company',
        rede: 'New Company' // Should prioritize this
      }

      // Mock user lookup
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockUserData,
                    error: null
                  })
                })
              })
            })
          }
        } else if (table === 'EnvioCashTemTotal') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ Rede_de_loja: 'New Company' }],
                  error: null
                })
              })
            })
          }
        }
        return {}
      })

      // Mock service methods
      mockCashbackService.validateFilters.mockReturnValue({ isValid: true, errors: [] })
      mockCashbackService.validateUserAccess.mockResolvedValue(true)
      mockCashbackService.getCashbackData.mockResolvedValue([])

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.userEmpresa).toBe('New Company')
      expect(mockCashbackService.getCashbackData).toHaveBeenCalledWith(
        expect.objectContaining({
          empresa: 'New Company'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when service throws error', async () => {
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        nome: 'Test User',
        empresa: 'Test Company',
        rede: null
      }

      // Mock user lookup
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockUserData,
                    error: null
                  })
                })
              })
            })
          }
        } else if (table === 'EnvioCashTemTotal') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ Rede_de_loja: 'Test Company' }],
                  error: null
                })
              })
            })
          }
        }
        return {}
      })

      // Mock service methods
      mockCashbackService.validateFilters.mockReturnValue({ isValid: true, errors: [] })
      mockCashbackService.validateUserAccess.mockResolvedValue(true)
      mockCashbackService.getCashbackData.mockRejectedValue(new Error('Database connection failed'))

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle malformed JSON in request', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: {
          get: jest.fn().mockReturnValue('')
        }
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid JSON')
    })
  })

  describe('Company Investigation', () => {
    it('should log available companies when user company not found', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      const request = createMockRequest({
        selectedFields: ['Nome'],
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }, 'ps_session=test@example.com_123456')

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        nome: 'Test User',
        empresa: 'Missing Company',
        rede: null
      }

      // Mock user lookup and company check
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockUserData,
                    error: null
                  })
                })
              })
            })
          }
        } else if (table === 'EnvioCashTemTotal') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [], // Company not found
                  error: null
                })
              }),
              not: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [
                    { Rede_de_loja: 'Company A' },
                    { Rede_de_loja: 'Company B' }
                  ],
                  error: null
                })
              })
            })
          }
        }
        return {}
      })

      // Mock service methods
      mockCashbackService.validateFilters.mockReturnValue({ isValid: true, errors: [] })
      mockCashbackService.validateUserAccess.mockResolvedValue(true)
      mockCashbackService.getCashbackData.mockResolvedValue([])

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('⚠️ Empresa do usuário não encontrada na tabela de cashback:', 'Missing Company')
      expect(consoleSpy).toHaveBeenCalledWith('📊 Empresas disponíveis na tabela:', ['Company A', 'Company B'])
      
      consoleSpy.mockRestore()
    })
  })
})