import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SurveyPreviewModal } from '@/components/ui/survey-preview-modal'

// Mock fetch
global.fetch = jest.fn()

describe('Survey Filter Integration', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedFields: ['nome', 'telefone', 'resposta'],
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    fieldLabels: {
      nome: 'Nome',
      telefone: 'Telefone',
      resposta: 'Resposta'
    },
    responseFilter: '',
    onResponseFilterChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { nome: 'João', telefone: '11999999999', resposta: 1 },
          { nome: 'Maria', telefone: '11888888888', resposta: 2 }
        ],
        total: 2,
        filtered: false
      })
    })
  })

  test('dropdown selection updates modal data', async () => {
    render(<SurveyPreviewModal {...mockProps} />)

    // Wait for initial data load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/reports/survey', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          selectedFields: mockProps.selectedFields,
          startDate: mockProps.startDate,
          endDate: mockProps.endDate,
          responseFilter: ''
        })
      }))
    })

    // Verify data is displayed
    await waitFor(() => {
      expect(screen.getByText('João')).toBeInTheDocument()
      expect(screen.getByText('Maria')).toBeInTheDocument()
    })
  })

  test('filter indicator shows when filter is active', async () => {
    const propsWithFilter = {
      ...mockProps,
      responseFilter: '1'
    }

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { nome: 'João', telefone: '11999999999', resposta: 1 }
        ],
        total: 1,
        filtered: true,
        totalUnfiltered: 2
      })
    })

    render(<SurveyPreviewModal {...propsWithFilter} />)

    await waitFor(() => {
      expect(screen.getByText('Filtro ativo')).toBeInTheDocument()
      expect(screen.getByText('1 de 2 registros (filtrado)')).toBeInTheDocument()
    })
  })

  test('filter indicator hides when no filter is applied', async () => {
    render(<SurveyPreviewModal {...mockProps} />)

    await waitFor(() => {
      expect(screen.queryByText('Filtro ativo')).not.toBeInTheDocument()
      expect(screen.getByText('Registros: 2')).toBeInTheDocument()
    })
  })

  test('shows no data message when filter returns empty results', async () => {
    const propsWithFilter = {
      ...mockProps,
      responseFilter: '4'
    }

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        total: 0,
        filtered: true,
        totalUnfiltered: 2
      })
    })

    render(<SurveyPreviewModal {...propsWithFilter} />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum registro encontrado para este filtro')).toBeInTheDocument()
      expect(screen.getByText('Remover filtro')).toBeInTheDocument()
    })
  })

  test('remove filter button works correctly', async () => {
    const propsWithFilter = {
      ...mockProps,
      responseFilter: '1'
    }

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        total: 0,
        filtered: true
      })
    })

    render(<SurveyPreviewModal {...propsWithFilter} />)

    await waitFor(() => {
      const removeButton = screen.getByText('Remover filtro')
      fireEvent.click(removeButton)
      expect(mockProps.onResponseFilterChange).toHaveBeenCalledWith('')
    })
  })

  test('modal refetches data when filter changes', async () => {
    const { rerender } = render(<SurveyPreviewModal {...mockProps} />)

    // Initial fetch
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    // Change filter
    const propsWithFilter = {
      ...mockProps,
      responseFilter: '1'
    }

    rerender(<SurveyPreviewModal {...propsWithFilter} />)

    // Should fetch again with new filter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenLastCalledWith('/api/reports/survey', expect.objectContaining({
        body: JSON.stringify({
          selectedFields: mockProps.selectedFields,
          startDate: mockProps.startDate,
          endDate: mockProps.endDate,
          responseFilter: '1'
        })
      }))
    })
  })

  test('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<SurveyPreviewModal {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Erro de Conexão')).toBeInTheDocument()
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
    })
  })

  test('retry button works after error', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          total: 0
        })
      })

    render(<SurveyPreviewModal {...mockProps} />)

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
    })

    // Click retry
    const retryButton = screen.getByText('Tentar Novamente')
    fireEvent.click(retryButton)

    // Should retry and succeed
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(screen.queryByText('Erro de Conexão')).not.toBeInTheDocument()
    })
  })
})