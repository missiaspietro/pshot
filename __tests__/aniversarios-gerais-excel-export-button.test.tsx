import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AniversariosGeraisExcelExportButton } from '@/components/ui/aniversarios-gerais-excel-export-button'
import { excelExportService } from '@/lib/excel-export-service'
import { toast } from 'sonner'

// Mock das dependências
jest.mock('@/lib/excel-export-service')
jest.mock('sonner')

const mockExcelExportService = excelExportService as jest.Mocked<typeof excelExportService>
const mockToast = toast as jest.Mocked<typeof toast>

describe('AniversariosGeraisExcelExportButton', () => {
  const mockGraphData = [
    { name: 'Loja 1', valor: 15 },
    { name: 'Loja 2', valor: 23 }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render button with correct text and icon', () => {
    render(
      <AniversariosGeraisExcelExportButton 
        graphData={mockGraphData}
        title="Relatório de Envio de Aniversários - GERAIS"
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <AniversariosGeraisExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
        disabled={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when isLoading prop is true', () => {
    render(
      <AniversariosGeraisExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
        isLoading={true}
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading state when exporting', async () => {
    mockExcelExportService.exportAniversariosGeraisToExcel.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100))
    })

    render(
      <AniversariosGeraisExcelExportButton 
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
    mockExcelExportService.exportAniversariosGeraisToExcel.mockResolvedValue()

    render(
      <AniversariosGeraisExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockExcelExportService.exportAniversariosGeraisToExcel).toHaveBeenCalledWith(
        mockGraphData, 
        "Test Title"
      )
    })
  })

  it('should show success toast when export succeeds with data', async () => {
    mockExcelExportService.exportAniversariosGeraisToExcel.mockResolvedValue()

    render(
      <AniversariosGeraisExcelExportButton 
        graphData={mockGraphData}
        title="Test Title"
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Dados de aniversários gerais dos últimos 6 meses exportados com sucesso!')
    })
  })

  it('should show success toast when export succeeds with empty data', async () => {
    mockExcelExportService.exportAniversariosGeraisToExcel.mockResolvedValue()

    render(
      <AniversariosGeraisExcelExportButton 
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
    mockExcelExportService.exportAniversariosGeraisToExcel.mockRejectedValue(error)

    render(
      <AniversariosGeraisExcelExportButton 
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