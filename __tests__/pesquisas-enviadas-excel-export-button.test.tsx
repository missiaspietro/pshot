import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PesquisasEnviadasExcelExportButton } from '@/components/ui/pesquisas-enviadas-excel-export-button'
import { excelExportService } from '@/lib/excel-export-service'
import { toast } from 'sonner'

// Mock das dependências
jest.mock('@/lib/excel-export-service')
jest.mock('sonner')

const mockExcelExportService = excelExportService as jest.Mocked<typeof excelExportService>
const mockToast = toast as jest.Mocked<typeof toast>

describe('PesquisasEnviadasExcelExportButton', () => {
  const mockGraphData = [
    { mes: 'janeiro 2024', '1': 8, '2': 12 },
    { mes: 'fevereiro 2024', '1': 6, '2': 15 }
  ]
  const mockLojas = ['1', '2']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render button with correct text and icon', () => {
    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={mockGraphData}
        lojas={mockLojas}
        title="Pesquisas Enviadas - Últimos 6 Meses"
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={mockGraphData}
        lojas={mockLojas}
        title="Test Title"
        disabled={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when isLoading prop is true', () => {
    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={mockGraphData}
        lojas={mockLojas}
        title="Test Title"
        isLoading={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading state when exporting', async () => {
    mockExcelExportService.exportPesquisasEnviadasToExcel.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100))
    })

    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={mockGraphData}
        lojas={mockLojas}
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
    mockExcelExportService.exportPesquisasEnviadasToExcel.mockResolvedValue()

    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={mockGraphData}
        lojas={mockLojas}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockExcelExportService.exportPesquisasEnviadasToExcel).toHaveBeenCalledWith(
        mockGraphData, 
        mockLojas,
        "Test Title"
      )
    })
  })

  it('should show success toast when export succeeds with data', async () => {
    mockExcelExportService.exportPesquisasEnviadasToExcel.mockResolvedValue()

    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={mockGraphData}
        lojas={mockLojas}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Dados de pesquisas enviadas dos últimos 6 meses exportados com sucesso!')
    })
  })

  it('should show success toast when export succeeds with empty data', async () => {
    mockExcelExportService.exportPesquisasEnviadasToExcel.mockResolvedValue()

    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={[]}
        lojas={mockLojas}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Arquivo Excel exportado! (Sem dados no gráfico)')
    })
  })

  it('should show error toast when export fails', async () => {
    const error = new Error('Export failed')
    mockExcelExportService.exportPesquisasEnviadasToExcel.mockRejectedValue(error)

    render(
      <PesquisasEnviadasExcelExportButton 
        graphData={mockGraphData}
        lojas={mockLojas}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erro inesperado durante a exportação')
    })
  })
})