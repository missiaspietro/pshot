import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PromocoesExcelExportButton } from '@/components/ui/promocoes-excel-export-button'
import { excelExportService } from '@/lib/excel-export-service'
import { toast } from 'sonner'

// Mock das dependências
jest.mock('@/lib/excel-export-service')
jest.mock('sonner')

const mockExcelExportService = excelExportService as jest.Mocked<typeof excelExportService>
const mockToast = toast as jest.Mocked<typeof toast>

describe('PromocoesExcelExportButton', () => {
  const mockGraphData = [
    { loja: 'Loja 1', botDesconectado: 5, numeroInvalido: 3 },
    { loja: 'Loja 2', botDesconectado: 2, numeroInvalido: 7 }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render button with correct text and icon', () => {
    render(
      <PromocoesExcelExportButton 
        graphData={mockGraphData}
        title="Promoções não Enviadas - 3 Meses"
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <PromocoesExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
        disabled={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when isLoading prop is true', () => {
    render(
      <PromocoesExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
        isLoading={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading state when exporting', async () => {
    mockExcelExportService.exportPromocoesNaoEnviadasToExcel.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100))
    })

    render(
      <PromocoesExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Exportando...')).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  it('should call export service when clicked', async () => {
    mockExcelExportService.exportPromocoesNaoEnviadasToExcel.mockResolvedValue()

    render(
      <PromocoesExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockExcelExportService.exportPromocoesNaoEnviadasToExcel).toHaveBeenCalledWith(
        mockGraphData, 
        "Test Title"
      )
    })
  })

  it('should show success toast when export succeeds', async () => {
    mockExcelExportService.exportPromocoesNaoEnviadasToExcel.mockResolvedValue()

    render(
      <PromocoesExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Dados de promoções não enviadas exportados com sucesso!')
    })
  })

  it('should show info toast when data is empty', async () => {
    render(
      <PromocoesExcelExportButton 
        graphData={[]}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.info).toHaveBeenCalledWith('Não há dados de promoções não enviadas para exportar')
    })
  })

  it('should show error toast when export fails', async () => {
    const error = new Error('Export failed')
    mockExcelExportService.exportPromocoesNaoEnviadasToExcel.mockRejectedValue(error)

    render(
      <PromocoesExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erro inesperado durante a exportação')
    })
  })
})