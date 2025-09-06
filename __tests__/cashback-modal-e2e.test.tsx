import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CashbackPreviewModal } from '@/components/ui/cashback-preview-modal'

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.URL.createObjectURL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
})

// Mock window.open
Object.defineProperty(window, 'open', {
  value: jest.fn()
})

describe('CashbackPreviewModal E2E Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedFields: ['Nome', 'Whatsapp', 'Loja'],
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    fieldLabels: {
      Nome: 'Nome do Cliente',
      Whatsapp: 'WhatsApp',
      Loja: 'Loja'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('Modal Opening and Data Loading', () => {
    it('should open modal and load data successfully', async () => {
      const mockData = [
        {
          id: '1',
          Nome: 'João Silva',
          Whatsapp: '11999999999',
          Loja: 'Loja 1'
        },
        {
          id: '2',
          Nome: 'Maria Santos',
          Whatsapp: '11888888888',
          Loja: 'Loja 2'
        }
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 2
        })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      // Check if modal is open
      expect(screen.getByText('Preview do Relatório de Cashback')).toBeInTheDocument()

      // Check loading state initially
      expect(screen.getByText('Carregando dados...')).toBeInTheDocument()

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      })

      // Check if API was called with correct parameters
      expect(fetch).toHaveBeenCalledWith('/api/reports/cashback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedFields: ['Nome', 'Whatsapp', 'Loja'],
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }),
        signal: expect.any(AbortSignal)
      })

      // Check table headers
      expect(screen.getByText('Nome do Cliente')).toBeInTheDocument()
      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
      expect(screen.getByText('Loja')).toBeInTheDocument()

      // Check data in table
      expect(screen.getByText('11999999999')).toBeInTheDocument()
      expect(screen.getByText('11888888888')).toBeInTheDocument()
      expect(screen.getByText('Loja 1')).toBeInTheDocument()
      expect(screen.getByText('Loja 2')).toBeInTheDocument()
    })

    it('should show no data message when API returns empty results', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          total: 0
        })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Nenhum dado encontrado para os filtros selecionados')).toBeInTheDocument()
      })

      // PDF button should be disabled
      const pdfButton = screen.getByRole('button', { name: /gerar pdf/i })
      expect(pdfButton).toBeDisabled()
    })

    it('should not load data when modal is closed', () => {
      render(<CashbackPreviewModal {...defaultProps} isOpen={false} />)

      expect(fetch).not.toHaveBeenCalled()
    })

    it('should not load data when no fields are selected', () => {
      render(<CashbackPreviewModal {...defaultProps} selectedFields={[]} />)

      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'))

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Erro de Conexão')).toBeInTheDocument()
        expect(screen.getByText('Erro de conexão. Verifique sua internet.')).toBeInTheDocument()
      })

      // Should show retry button
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).not.toBeDisabled()
    })

    it('should handle authentication errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: 'Usuário não autenticado' })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Erro de Autenticação')).toBeInTheDocument()
        expect(screen.getByText('Usuário não autenticado')).toBeInTheDocument()
      })

      // Should not show retry button for auth errors
      expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument()
      expect(screen.getByText('Faça login novamente para continuar')).toBeInTheDocument()
    })

    it('should handle permission errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => JSON.stringify({ error: 'Acesso negado' })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Acesso Negado')).toBeInTheDocument()
        expect(screen.getByText('Acesso negado')).toBeInTheDocument()
      })

      expect(screen.getByText('Você não tem permissão para acessar estes dados')).toBeInTheDocument()
    })

    it('should handle timeout errors', async () => {
      const abortError = new Error('AbortError')
      abortError.name = 'AbortError'
      ;(fetch as jest.Mock).mockRejectedValueOnce(abortError)

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Tempo Limite Excedido')).toBeInTheDocument()
        expect(screen.getByText('Tempo limite excedido. Tente novamente.')).toBeInTheDocument()
      })

      // Should show retry button
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should handle server errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ error: 'Erro interno do servidor' })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Erro do Servidor')).toBeInTheDocument()
        expect(screen.getByText('Erro interno do servidor')).toBeInTheDocument()
      })

      // Should show retry button for server errors
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i })
      expect(retryButton).toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('should retry data loading when retry button is clicked', async () => {
      // First call fails
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Erro de Conexão')).toBeInTheDocument()
      })

      // Second call succeeds
      const mockData = [{ id: '1', Nome: 'Test User', Whatsapp: '11999999999', Loja: 'Loja 1' }]
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 1
        })
      })

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i })
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Should have called fetch twice
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should show retry count after multiple attempts', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Erro de Conexão')).toBeInTheDocument()
      })

      // First retry
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i })
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Tentar Novamente (2ª tentativa)')).toBeInTheDocument()
      })

      // Second retry
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Tentar Novamente (3ª tentativa)')).toBeInTheDocument()
      })

      // Third retry
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Tentar Novamente (4ª tentativa)')).toBeInTheDocument()
        expect(screen.getByText('Se o problema persistir, contate o suporte técnico')).toBeInTheDocument()
      })
    })
  })

  describe('PDF Generation', () => {
    it('should generate PDF successfully', async () => {
      const mockData = [{ id: '1', Nome: 'Test User', Whatsapp: '11999999999', Loja: 'Loja 1' }]

      // Mock data loading
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 1
        })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Mock PDF generation
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/pdf')
        },
        blob: async () => new Blob(['pdf content'], { type: 'application/pdf' })
      })

      // Click PDF button
      const pdfButton = screen.getByRole('button', { name: /gerar pdf/i })
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/reports/cashback/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectedFields: ['Nome', 'Whatsapp', 'Loja'],
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          })
        })
      })

      // Should open PDF in new window
      expect(window.open).toHaveBeenCalledWith('mock-url', '_blank')
    })

    it('should handle PDF generation errors', async () => {
      const mockData = [{ id: '1', Nome: 'Test User', Whatsapp: '11999999999', Loja: 'Loja 1' }]

      // Mock data loading
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 1
        })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Mock PDF generation error
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Erro ao gerar PDF' })
      })

      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation()

      // Click PDF button
      const pdfButton = screen.getByRole('button', { name: /gerar pdf/i })
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Erro ao gerar relatório de cashback: Erro ao gerar PDF')
      })

      alertSpy.mockRestore()
    })

    it('should handle HTML fallback when PDF generation fails', async () => {
      const mockData = [{ id: '1', Nome: 'Test User', Whatsapp: '11999999999', Loja: 'Loja 1' }]

      // Mock data loading
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 1
        })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Mock HTML fallback
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/html')
        },
        text: async () => '<html><body>HTML Report</body></html>'
      })

      // Click PDF button
      const pdfButton = screen.getByRole('button', { name: /gerar pdf/i })
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('mock-url', '_blank')
      })
    })
  })

  describe('Modal Interaction', () => {
    it('should close modal when cancel button is clicked', async () => {
      const onCloseMock = jest.fn()

      render(<CashbackPreviewModal {...defaultProps} onClose={onCloseMock} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)

      expect(onCloseMock).toHaveBeenCalled()
    })

    it('should close modal after successful PDF generation', async () => {
      const mockData = [{ id: '1', Nome: 'Test User', Whatsapp: '11999999999', Loja: 'Loja 1' }]
      const onCloseMock = jest.fn()

      // Mock data loading
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 1
        })
      })

      render(<CashbackPreviewModal {...defaultProps} onClose={onCloseMock} />)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Mock PDF generation
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/pdf')
        },
        blob: async () => new Blob(['pdf content'], { type: 'application/pdf' })
      })

      // Click PDF button
      const pdfButton = screen.getByRole('button', { name: /gerar pdf/i })
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalled()
      })
    })
  })

  describe('Data Formatting', () => {
    it('should format dates correctly', async () => {
      const mockData = [
        {
          id: '1',
          Nome: 'Test User',
          Envio_novo: '2024-01-15T10:30:00Z'
        }
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 1
        })
      })

      render(<CashbackPreviewModal 
        {...defaultProps} 
        selectedFields={['Nome', 'Envio_novo']}
        fieldLabels={{ Nome: 'Nome', Envio_novo: 'Data de Envio' }}
      />)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
        expect(screen.getByText('15/01/2024')).toBeInTheDocument()
      })
    })

    it('should handle null and undefined values', async () => {
      const mockData = [
        {
          id: '1',
          Nome: 'Test User',
          Whatsapp: null,
          Loja: undefined
        }
      ]

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData,
          total: 1
        })
      })

      render(<CashbackPreviewModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
        // Should show '-' for null/undefined values
        expect(screen.getAllByText('-')).toHaveLength(2)
      })
    })
  })
})