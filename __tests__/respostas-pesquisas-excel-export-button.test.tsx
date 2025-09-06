import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RespostasPesquisasExcelExportButton } from '@/components/ui/respostas-pesquisas-excel-export-button'
import { excelExportService } from '@/lib/excel-export-service'
import { toast } from 'sonner'

// Mock das dependências
jest.mock('@/lib/excel-export-service')
jest.mock('sonner')

const mockExcelExportService = excelExportService as jest.Mocked<typeof excelExportService>
const mockToast = toast as jest.Mocked<typeof toast>

describe('RespostasPesquisasExcelExportButton', () => {
  const mockGraphData = [
    { loja: 'Loja 1', Ótimo: 10, Bom: 8, Regular: 3, Péssimo: 1 },
    { loja: 'Loja 2', Ótimo: 15, Bom: 12, Regular: 5, Péssimo: 2 }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render button with correct text and icon', () => {
    render(
      <RespostasPesquisasExcelExportButton 
        graphData={mockGraphData}
        title="Respostas Pesquisas"
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <RespostasPesquisasExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
        disabled={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when isLoading prop is true', () => {
    render(
      <RespostasPesquisasExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
        isLoading={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading state when exporting', async () => {
    mockExcelExportService.exportRespostasPesquisasToExcel.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100))
    })

    render(
      <RespostasPesquisasExcelExportButton 
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
    mockExcelExportService.exportRespostasPesquisasToExcel.mockResolvedValue()

    render(
      <RespostasPesquisasExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockExcelExportService.exportRespostasPesquisasToExcel).toHaveBeenCalledWith(
        mockGraphData, 
        "Test Title"
      )
    })
  })

  it('should show success toast when export succeeds with data', async () => {
    mockExcelExportService.exportRespostasPesquisasToExcel.mockResolvedValue()

    render(
      <RespostasPesquisasExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Dados de respostas de pesquisas exportados com sucesso!')
    })
  })

  it('should show success toast when export succeeds with empty data', async () => {
    mockExcelExportService.exportRespostasPesquisasToExcel.mockResolvedValue()

    render(
      <RespostasPesquisasExcelExportButton 
        graphData={[]}
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
    mockExcelExportService.exportRespostasPesquisasToExcel.mockRejectedValue(error)

    render(
      <RespostasPesquisasExcelExportButton 
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