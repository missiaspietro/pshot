import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExcelExportButton } from '@/components/ui/excel-export-button'
import { excelExportService } from '@/lib/excel-export-service'
import { toast } from 'sonner'

// Mock das dependências
jest.mock('@/lib/excel-export-service')
jest.mock('sonner')

const mockExcelExportService = excelExportService as jest.Mocked<typeof excelExportService>
const mockToast = toast as jest.Mocked<typeof toast>

describe('ExcelExportButton', () => {
  const mockGraphData = [
    { loja: 'Loja 1', quantidade: 10 },
    { loja: 'Loja 2', quantidade: 20 }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render button with correct text and icon', () => {
    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={1}
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={1}
        disabled={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when isLoading prop is true', () => {
    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={1}
        isLoading={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading state when exporting', async () => {
    mockExcelExportService.exportGraphDataToExcel.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100))
    })

    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={1}
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
    mockExcelExportService.exportGraphDataToExcel.mockResolvedValue()

    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={2}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockExcelExportService.exportGraphDataToExcel).toHaveBeenCalledWith(
        mockGraphData, 
        2
      )
    })
  })

  it('should show success toast when export succeeds', async () => {
    mockExcelExportService.exportGraphDataToExcel.mockResolvedValue()

    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={1}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Dados do último mês exportados com sucesso!')
    })
  })

  it('should show info toast when data is empty', async () => {
    render(
      <ExcelExportButton 
        graphData={[]}
        currentPeriod={1}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.info).toHaveBeenCalledWith('Não há dados de cashback para exportar')
    })
  })

  it('should show error toast when export fails', async () => {
    const error = new Error('Export failed')
    mockExcelExportService.exportGraphDataToExcel.mockRejectedValue(error)

    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={1}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erro inesperado durante a exportação')
    })
  })

  it('should show correct success message for different periods', async () => {
    mockExcelExportService.exportGraphDataToExcel.mockResolvedValue()

    // Teste para 3 meses
    render(
      <ExcelExportButton 
        graphData={mockGraphData}
        currentPeriod={3}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Dados dos últimos 3 meses exportados com sucesso!')
    })
  })
})