import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { useAuth } from '@/contexts/auth-context'
import { getRespostasPesquisasByStore, getRespostasPesquisasStats } from '@/lib/respostas-pesquisas-service'

// Mock das dependências
jest.mock('@/contexts/auth-context')
jest.mock('@/lib/respostas-pesquisas-service')
jest.mock('@/lib/birthday-report-service')
jest.mock('@/lib/cashback-service')
jest.mock('@/lib/dashboard-optimizations')
jest.mock('@/lib/pesquisa-enviada-service')

// Mock de outros serviços para evitar interferência
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      }))
    }))
  }
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockGetRespostasPesquisasByStore = getRespostasPesquisasByStore as jest.MockedFunction<typeof getRespostasPesquisasByStore>
const mockGetRespostasPesquisasStats = getRespostasPesquisasStats as jest.MockedFunction<typeof getRespostasPesquisasStats>

// Mock de outros serviços
jest.doMock('@/lib/birthday-report-service', () => ({
  getBirthdayReportByStore: jest.fn().mockResolvedValue([]),
  getDetailedBirthdayReportByStore: jest.fn().mockResolvedValue([])
}))

jest.doMock('@/lib/cashback-service', () => ({
  getCashbackData: jest.fn().mockResolvedValue([])
}))

jest.doMock('@/lib/dashboard-optimizations', () => ({
  getCachedData: jest.fn().mockReturnValue(null),
  setCachedData: jest.fn(),
  clearAllCache: jest.fn()
}))

jest.doMock('@/lib/pesquisa-enviada-service', () => ({
  pesquisaEnviadaService: {
    getDadosParaGrafico: jest.fn().mockResolvedValue({ dados: [], lojas: [] })
  }
}))

describe('Dashboard Survey Card Integration', () => {
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    empresa: 'Test Company'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn()
    })

    // Mock global fetch for other API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-0/0')
        }
      })
    ) as jest.Mock
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render survey card with real data', async () => {
    const mockStats = {
      totalRespostas: 25,
      ultimaResposta: '2024-01-15T10:30:00Z',
      respostasPorLoja: [
        { loja: '1', quantidade: 15 },
        { loja: '2', quantidade: 10 }
      ]
    }

    const mockData = [
      { loja: '1', Ótimo: 8, Bom: 4, Regular: 2, Péssimo: 1 },
      { loja: '2', Ótimo: 5, Bom: 3, Regular: 1, Péssimo: 1 }
    ]

    mockGetRespostasPesquisasStats.mockResolvedValue(mockStats)
    mockGetRespostasPesquisasByStore.mockResolvedValue(mockData)

    render(<DashboardPage />)

    // Aguarda o carregamento dos dados
    await waitFor(() => {
      expect(mockGetRespostasPesquisasStats).toHaveBeenCalledWith('Test Company')
      expect(mockGetRespostasPesquisasByStore).toHaveBeenCalledWith('Test Company')
    })

    // Verifica se o card de pesquisas está sendo renderizado com os dados corretos
    await waitFor(() => {
      const surveyCard = screen.getByText('Relatório de Pesquisas')
      expect(surveyCard).toBeInTheDocument()
    })

    // Verifica se o valor total de respostas está sendo exibido
    await waitFor(() => {
      const totalValue = screen.getByText('25')
      expect(totalValue).toBeInTheDocument()
    })
  })

  it('should handle loading state correctly', async () => {
    // Simula um delay na resposta
    mockGetRespostasPesquisasStats.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        totalRespostas: 0,
        ultimaResposta: null,
        respostasPorLoja: []
      }), 100))
    )

    mockGetRespostasPesquisasByStore.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    )

    render(<DashboardPage />)

    // Verifica se o card está presente durante o carregamento
    const surveyCard = screen.getByText('Relatório de Pesquisas')
    expect(surveyCard).toBeInTheDocument()

    // Aguarda o carregamento completar
    await waitFor(() => {
      expect(mockGetRespostasPesquisasStats).toHaveBeenCalledWith('Test Company')
    }, { timeout: 2000 })
  })

  it('should handle empty data gracefully', async () => {
    const emptyStats = {
      totalRespostas: 0,
      ultimaResposta: null,
      respostasPorLoja: []
    }

    mockGetRespostasPesquisasStats.mockResolvedValue(emptyStats)
    mockGetRespostasPesquisasByStore.mockResolvedValue([])

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockGetRespostasPesquisasStats).toHaveBeenCalledWith('Test Company')
      expect(mockGetRespostasPesquisasByStore).toHaveBeenCalledWith('Test Company')
    })

    // Verifica se o card mostra 0 quando não há dados
    await waitFor(() => {
      const surveyCard = screen.getByText('Relatório de Pesquisas')
      expect(surveyCard).toBeInTheDocument()
      
      const zeroValue = screen.getByText('0')
      expect(zeroValue).toBeInTheDocument()
    })
  })

  it('should handle service errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    mockGetRespostasPesquisasStats.mockRejectedValue(new Error('Service error'))
    mockGetRespostasPesquisasByStore.mockRejectedValue(new Error('Service error'))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockGetRespostasPesquisasStats).toHaveBeenCalledWith('Test Company')
      expect(mockGetRespostasPesquisasByStore).toHaveBeenCalledWith('Test Company')
    })

    // Verifica se o card ainda é renderizado mesmo com erro
    const surveyCard = screen.getByText('Relatório de Pesquisas')
    expect(surveyCard).toBeInTheDocument()

    // Verifica se o valor padrão (0) é exibido em caso de erro
    await waitFor(() => {
      const zeroValue = screen.getByText('0')
      expect(zeroValue).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('should not fetch data when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn()
    })

    render(<DashboardPage />)

    // Aguarda um tempo para garantir que as funções não foram chamadas
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockGetRespostasPesquisasStats).not.toHaveBeenCalled()
    expect(mockGetRespostasPesquisasByStore).not.toHaveBeenCalled()
  })

  it('should not fetch data when user has no empresa', async () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, empresa: null },
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn()
    })

    render(<DashboardPage />)

    // Aguarda um tempo para garantir que as funções não foram chamadas
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockGetRespostasPesquisasStats).not.toHaveBeenCalled()
    expect(mockGetRespostasPesquisasByStore).not.toHaveBeenCalled()
  })

  it('should filter data by user company', async () => {
    const differentCompanyUser = {
      ...mockUser,
      empresa: 'Different Company'
    }

    mockUseAuth.mockReturnValue({
      user: differentCompanyUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn()
    })

    const mockStats = {
      totalRespostas: 5,
      ultimaResposta: '2024-01-10T08:00:00Z',
      respostasPorLoja: [{ loja: '1', quantidade: 5 }]
    }

    mockGetRespostasPesquisasStats.mockResolvedValue(mockStats)
    mockGetRespostasPesquisasByStore.mockResolvedValue([])

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockGetRespostasPesquisasStats).toHaveBeenCalledWith('Different Company')
      expect(mockGetRespostasPesquisasByStore).toHaveBeenCalledWith('Different Company')
    })

    // Verifica se os dados da empresa correta são exibidos
    await waitFor(() => {
      const totalValue = screen.getByText('5')
      expect(totalValue).toBeInTheDocument()
    })
  })

  it('should update data when user changes', async () => {
    const { rerender } = render(<DashboardPage />)

    // Primeiro usuário
    await waitFor(() => {
      expect(mockGetRespostasPesquisasStats).toHaveBeenCalledWith('Test Company')
    })

    // Limpa os mocks
    jest.clearAllMocks()

    // Muda o usuário
    const newUser = { ...mockUser, empresa: 'New Company' }
    mockUseAuth.mockReturnValue({
      user: newUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn()
    })

    rerender(<DashboardPage />)

    // Verifica se os dados são buscados para a nova empresa
    await waitFor(() => {
      expect(mockGetRespostasPesquisasStats).toHaveBeenCalledWith('New Company')
      expect(mockGetRespostasPesquisasByStore).toHaveBeenCalledWith('New Company')
    })
  })

  it('should display survey card with correct styling and structure', async () => {
    const mockStats = {
      totalRespostas: 15,
      ultimaResposta: '2024-01-15T10:30:00Z',
      respostasPorLoja: [{ loja: '1', quantidade: 15 }]
    }

    mockGetRespostasPesquisasStats.mockResolvedValue(mockStats)
    mockGetRespostasPesquisasByStore.mockResolvedValue([])

    render(<DashboardPage />)

    await waitFor(() => {
      const surveyCard = screen.getByText('Relatório de Pesquisas')
      expect(surveyCard).toBeInTheDocument()
    })

    // Verifica se o card tem a estrutura esperada
    const cardElement = screen.getByText('Relatório de Pesquisas').closest('[class*="card"]')
    expect(cardElement).toBeInTheDocument()

    // Verifica se o valor está sendo exibido
    await waitFor(() => {
      const valueElement = screen.getByText('15')
      expect(valueElement).toBeInTheDocument()
    })
  })
})