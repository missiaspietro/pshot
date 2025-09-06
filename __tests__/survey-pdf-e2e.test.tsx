import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SurveyPreviewModal } from '@/components/ui/survey-preview-modal'

// Mock the PDF service
jest.mock('@/lib/survey-pdf-service', () => ({
  SurveyPDFService: {
    generatePDF: jest.fn(),
    validateData: jest.fn(),
    calculateOptimalLayout: jest.fn(),
    formatCellValue: jest.fn(),
    generateFilename: jest.fn()
  }
}))

// Mock the error handler
jest.mock('@/lib/pdf-error-handler', () => ({
  PDFErrorHandler: {
    handleError: jest.fn(),
    getUserFriendlyMessage: jest.fn(),
    getSuggestedActions: jest.fn()
  }
}))

// Mock fetch
global.fetch = jest.fn()

// Mock window methods
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn()
})

Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'blob:mock-url')
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn()
})

describe('Survey PDF Generation - End-to-End Tests', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedFields: ['nome', 'telefone', 'resposta', 'loja'],
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    fieldLabels: {
      nome: 'Nome',
      telefone: 'Telefone',
      resposta: 'Resposta',
      loja: 'Loja'
    }
  }

  const mockSurveyData = [
    {
      nome: 'João Silva',
      telefone: '11999887766',
      resposta: '1',
      loja: 'Loja Centro'
    },
    {
      nome: 'Maria Santos',
      telefone: '11888776655',
      resposta: '2',
      loja: 'Loja Norte'
    },
    {
      nome: 'Pedro Costa',
      telefone: '11777665544',
      resposta: '3',
      loja: 'Loja Sul'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete PDF Generation Flow', () => {
    it('should complete full PDF generation workflow successfully', async () => {
      // Mock data fetch
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockSurveyData
        })
      })

      // Mock PDF generation
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { 
          get: (header: string) => {
            if (header === 'content-type') return 'application/pdf'
            return null
          }
        },
        blob: () => Promise.resolve(new Blob(['mock pdf content'], { type: 'application/pdf' }))
      })

      render(<SurveyPreviewModal {...mockProps} />)

      // 1. Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.getByText('Maria Santos')).toBeInTheDocument()
        expect(screen.getByText('Pedro Costa')).toBeInTheDocument()
      })

      // 2. Verify data is displayed correctly
      expect(screen.getByText('Ótimo')).toBeInTheDocument() // resposta: '1'
      expect(screen.getByText('Bom')).toBeInTheDocument()   // resposta: '2'
      expect(screen.getByText('Regular')).toBeInTheDocument() // resposta: '3'

      // 3. Click PDF generation button
      const pdfButton = screen.getByText('Gerar PDF')
      expect(pdfButton).not.toBeDisabled()
      
      fireEvent.click(pdfButton)

      // 4. Verify loading state
      await waitFor(() => {
        expect(screen.getByText(/Gerando PDF.../)).toBeInTheDocument()
      })

      // 5. Verify PDF is generated and opened
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('blob:mock-url', '_blank')
      })

      // 6. Verify cleanup
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled()
      })

      // 7. Verify API calls
      expect(global.fetch).toHaveBeenCalledTimes(2)
      
      // First call: data fetch
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/reports/survey', expect.any(Object))
      
      // Second call: PDF generation
      expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/reports/survey/pdf', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('selectedFields')
      }))
    })

    it('should handle different field combinations correctly', async () => {
      const customProps = {
        ...mockProps,
        selectedFields: ['nome', 'resposta'],
        fieldLabels: {
          nome: 'Nome',
          resposta: 'Resposta'
        }
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/pdf' },
          blob: () => Promise.resolve(new Blob(['pdf content']))
        })

      render(<SurveyPreviewModal {...customProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Should only show selected fields
      expect(screen.getByText('Nome')).toBeInTheDocument()
      expect(screen.getByText('Resposta')).toBeInTheDocument()
      expect(screen.queryByText('Telefone')).not.toBeInTheDocument()
      expect(screen.queryByText('Loja')).not.toBeInTheDocument()

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/reports/survey/pdf', expect.objectContaining({
          body: expect.stringContaining('"selectedFields":["nome","resposta"]')
        }))
      })
    })

    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeData = Array(1000).fill(null).map((_, index) => ({
        nome: `Cliente ${index + 1}`,
        telefone: `119${String(index).padStart(8, '0')}`,
        resposta: String((index % 4) + 1),
        loja: `Loja ${Math.floor(index / 100) + 1}`
      }))

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: largeData })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/pdf' },
          blob: () => Promise.resolve(new Blob(['large pdf content']))
        })

      render(<SurveyPreviewModal {...mockProps} />)

      // Should handle pagination for large datasets
      await waitFor(() => {
        expect(screen.getByText('Cliente 1')).toBeInTheDocument()
      })

      // Should show pagination info
      expect(screen.getByText(/Registros: 1000/)).toBeInTheDocument()
      expect(screen.getByText(/Página: 1 de/)).toBeInTheDocument()

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      // Should optimize data before sending
      await waitFor(() => {
        const lastCall = (global.fetch as jest.Mock).mock.calls[1]
        const requestBody = JSON.parse(lastCall[1].body)
        
        // Should send all data but only selected fields
        expect(requestBody.data).toHaveLength(1000)
        expect(Object.keys(requestBody.data[0])).toEqual(mockProps.selectedFields)
      })
    })
  })

  describe('Error Scenarios End-to-End', () => {
    it('should handle complete error recovery flow', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        // First PDF attempt fails
        .mockRejectedValueOnce(new Error('Network timeout'))
        // Second attempt succeeds
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/pdf' },
          blob: () => Promise.resolve(new Blob(['pdf content']))
        })

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      // Should show error and retry automatically
      await waitFor(() => {
        expect(screen.getByText(/Tentando novamente/)).toBeInTheDocument()
      })

      // Should eventually succeed
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('blob:mock-url', '_blank')
      }, { timeout: 5000 })
    })

    it('should handle fallback to HTML when PDF fails completely', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'text/html' },
          text: () => Promise.resolve('<html><body>Fallback HTML Report</body></html>')
        })

      // Mock alert to verify fallback message
      window.alert = jest.fn()

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('O PDF não pôde ser gerado')
        )
        expect(window.open).toHaveBeenCalledWith('blob:mock-url', '_blank')
      })
    })
  })

  describe('Performance and Resource Management', () => {
    it('should manage resources properly during PDF generation', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/pdf' },
          blob: () => Promise.resolve(new Blob(['pdf content']))
        })

      const { unmount } = render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled()
      })

      // Unmount component to trigger cleanup
      unmount()

      // Should clean up resources
      expect(window.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should handle timeout scenarios gracefully', async () => {
      jest.useFakeTimers()

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockImplementationOnce(() => new Promise(() => {
          // Never resolves to simulate timeout
        }))

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(65000) // More than 60s timeout

      await waitFor(() => {
        expect(screen.getByText(/Tempo limite excedido/)).toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('Data Integrity', () => {
    it('should preserve data integrity throughout the PDF generation process', async () => {
      const specialCharData = [
        {
          nome: 'José da Silva & Cia.',
          telefone: '(11) 99999-9999',
          resposta: '1',
          loja: 'Loja "Especial"'
        },
        {
          nome: 'María González',
          telefone: '+55 11 88888-8888',
          resposta: '4',
          loja: 'Loja São José'
        }
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: specialCharData })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/pdf' },
          blob: () => Promise.resolve(new Blob(['pdf content']))
        })

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('José da Silva & Cia.')).toBeInTheDocument()
        expect(screen.getByText('María González')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        const lastCall = (global.fetch as jest.Mock).mock.calls[1]
        const requestBody = JSON.parse(lastCall[1].body)
        
        // Verify special characters are preserved
        expect(requestBody.data[0].nome).toBe('José da Silva & Cia.')
        expect(requestBody.data[1].nome).toBe('María González')
        expect(requestBody.data[0].loja).toBe('Loja "Especial"')
      })
    })

    it('should handle empty and null values correctly', async () => {
      const dataWithNulls = [
        {
          nome: 'João Silva',
          telefone: null,
          resposta: '',
          loja: undefined
        },
        {
          nome: '',
          telefone: '11999887766',
          resposta: '2',
          loja: 'Loja Norte'
        }
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: dataWithNulls })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/pdf' },
          blob: () => Promise.resolve(new Blob(['pdf content']))
        })

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Should display empty values appropriately
      const cells = screen.getAllByRole('cell')
      expect(cells.some(cell => cell.textContent === '')).toBe(true)

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(window.open).toHaveBeenCalled()
      })
    })
  })
})