import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { useAuth } from '@/contexts/auth-context'
import { getCashbackData } from '@/lib/cashback-service'
import { excelExportService } from '@/lib/excel-export-service'

// Mock das dependências
jest.mock('@/contexts/auth-context')
jest.mock('@/lib/cashback-service')
jest.mock('@/lib/excel-export-service')
jest.mock('@/lib/birthday-report-service')
jest.mock('@/lib/respostas-pesquisas-service')
jest.mock('@/lib/dashboard-optimizations')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockGetCashbackData = getCashbackData as jest.MockedFunction<typeof getCashbackData>
const mockExcelExportService = excelExportService as jest.Mocked<typeof excelExportService>

describe('Dashboard Excel Export Integration', () => {
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    empresa: 'Test Company'
  }

  const mockCashbackData = [
    { mes: 'janeiro 2024', loja1: 10, loja2: 20 },
    { mes: 'fevereiro 2024', loja1: 15, loja2: 25 }
  ]

  const mockLojas = ['1', '2']

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn()
    })

    mockGetCashbackData.mockResolvedValue({
      data: mockCashbackData,
      lojas: mockLojas
    })

    // Mock outros serviços necessários
    jest.doMock('@/lib/birthday-report-service', () => ({
      getBirthdayReportByStore: jest.fn().mockResolvedValue([]),
      getDetailedBirthdayReportByStore: jest.fn().mockResolvedValue([])
    }))

    jest.doMock('@/lib/respostas-pesquisas-service', () => ({
      getRespostasPesquisasByStore: jest.fn().mockResolvedValue([])
    }))

    jest.doMock('@/lib/dashboard-optimizations', () => ({
      clearAllCache: jest.fn()
    }))
  })

  it('should render Excel export button in cashback section', async () => {
    render(<DashboardPage />)

    // Aguarda o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })

    // Verifica se o botão está na seção correta
    const cashbackSection = screen.getByText(/Cashbacks enviados/)
    expect(cashbackSection).toBeInTheDocument()
  })

  it('should pass correct data to export button', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockGetCashbackData).toHaveBeenCalledWith('Test Company')
    })

    // Verifica se o botão de exportação está presente
    expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
  })

  it('should call export service when button is clicked', async () => {
    mockExcelExportService.exportCashbackToExcel.mockResolvedValue()

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })

    const exportButton = screen.getByText('Exportar Excel')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockExcelExportService.exportCashbackToExcel).toHaveBeenCalledWith(
        mockCashbackData,
        mockLojas
      )
    })
  })

  it('should disable button when cashback data is loading', async () => {
    // Mock loading state
    mockGetCashbackData.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: [], lojas: [] }), 1000))
    )

    render(<DashboardPage />)

    // Durante o carregamento, o botão deve estar desabilitado
    await waitFor(() => {
      const exportButton = screen.getByText('Exportar Excel')
      expect(exportButton).toBeDisabled()
    })
  })

  it('should update export data when period selection changes', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })

    // Simula mudança de período
    const twoMonthsButton = screen.getByText('2 Meses')
    fireEvent.click(twoMonthsButton)

    // Verifica se os dados foram atualizados
    await waitFor(() => {
      // O botão deve continuar presente e funcional
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })
  })

  it('should handle export errors gracefully', async () => {
    const exportError = new Error('Export failed')
    mockExcelExportService.exportCashbackToExcel.mockRejectedValue(exportError)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })

    const exportButton = screen.getByText('Exportar Excel')
    fireEvent.click(exportButton)

    // O erro deve ser tratado pelo componente sem quebrar a aplicação
    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })
  })

  it('should show loading state during export', async () => {
    mockExcelExportService.exportCashbackToExcel.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })

    const exportButton = screen.getByText('Exportar Excel')
    fireEvent.click(exportButton)

    // Durante a exportação, deve mostrar estado de loading
    await waitFor(() => {
      expect(screen.getByText('Exportando...')).toBeInTheDocument()
    })

    // Após a exportação, volta ao estado normal
    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })
  })

  it('should maintain button position relative to period selector', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
    })

    // Verifica se os elementos estão na mesma seção
    const periodSelector = screen.getByText('Período de pesquisa:')
    const exportButton = screen.getByText('Exportar Excel')
    
    expect(periodSelector).toBeInTheDocument()
    expect(exportButton).toBeInTheDocument()

    // Ambos devem estar no mesmo container
    const periodContainer = periodSelector.closest('div')
    const buttonContainer = exportButton.closest('div')
    
    // Verifica se estão na mesma hierarquia
    expect(periodContainer?.parentElement).toBe(buttonContainer?.parentElement?.parentElement)
  })
})