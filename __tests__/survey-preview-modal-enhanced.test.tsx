import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SurveyPreviewModal } from '@/components/ui/survey-preview-modal'

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn()
})

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'blob:mock-url')
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn()
})

describe('SurveyPreviewModal - Enhanced Features', () => {
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
    }
  }

  const mockSurveyData = [
    {
      nome: 'João Silva',
      telefone: '11999887766',
      resposta: '1'
    },
    {
      nome: 'Maria Santos',
      telefone: '11888776655',
      resposta: '2'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful data fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockSurveyData
      })
    })
  })

  describe('PDF Generation State Management', () => {
    it('should show loading state during PDF generation', async () => {
      // Mock PDF generation response
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockImplementationOnce(() => new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            headers: { get: () => 'application/pdf' },
            blob: () => Promise.resolve(new Blob(['pdf content']))
          }), 100)
        }))

      render(<SurveyPreviewModal {...mockProps} />)

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Click PDF generation button
      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      // Should show loading state
      expect(screen.getByText(/Gerando PDF.../)).toBeInTheDocument()
      expect(pdfButton).toBeDisabled()

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Gerar PDF')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should show progress during PDF generation', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockImplementationOnce(() => new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            headers: { get: () => 'application/pdf' },
            blob: () => Promise.resolve(new Blob(['pdf content']))
          }), 100)
        }))

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      // Should show progress percentage
      await waitFor(() => {
        expect(screen.getByText(/Gerando... \d+%/)).toBeInTheDocument()
      })
    })

    it('should prevent multiple simultaneous PDF generations', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockImplementation(() => new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            headers: { get: () => 'application/pdf' },
            blob: () => Promise.resolve(new Blob(['pdf content']))
          }), 200)
        }))

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      
      // Click multiple times rapidly
      fireEvent.click(pdfButton)
      fireEvent.click(pdfButton)
      fireEvent.click(pdfButton)

      // Should only make one PDF request (plus the initial data request)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should show error message when PDF generation fails', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockRejectedValueOnce(new Error('PDF generation failed'))

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(screen.getByText(/PDF generation failed/)).toBeInTheDocument()
      })
    })

    it('should show retry button when PDF generation fails', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockRejectedValueOnce(new Error('Network error'))

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
      })
    })

    it('should auto-retry on timeout errors', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockRejectedValueOnce({ name: 'AbortError', message: 'Request timeout' })
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

      // Should show retry message
      await waitFor(() => {
        expect(screen.getByText(/Tentando novamente/)).toBeInTheDocument()
      })

      // Should eventually succeed
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('blob:mock-url', '_blank')
      }, { timeout: 5000 })
    })

    it('should handle HTML fallback when PDF fails', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'text/html' },
          text: () => Promise.resolve('<html><body>Fallback HTML</body></html>')
        })

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('blob:mock-url', '_blank')
      })
    })
  })

  describe('Performance Optimizations', () => {
    it('should cleanup resources when modal closes', async () => {
      const { rerender } = render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Close modal
      rerender(<SurveyPreviewModal {...mockProps} isOpen={false} />)

      // Should cleanup blob URLs
      expect(window.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should debounce PDF generation clicks', async () => {
      jest.useFakeTimers()

      ;(global.fetch as jest.Mock)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })

      render(<SurveyPreviewModal {...mockProps} />)

      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      const pdfButton = screen.getByText('Gerar PDF')
      
      // Click multiple times rapidly
      fireEvent.click(pdfButton)
      fireEvent.click(pdfButton)
      fireEvent.click(pdfButton)

      // Advance timers to trigger debounced function
      act(() => {
        jest.advanceTimersByTime(500)
      })

      // Should only process one click due to debouncing
      expect(global.fetch).toHaveBeenCalledTimes(1) // Only the initial data fetch

      jest.useRealTimers()
    })

    it('should optimize data before sending to API', async () => {
      const largeData = mockSurveyData.map(item => ({
        ...item,
        extraField1: 'unused data',
        extraField2: 'more unused data',
        extraField3: 'even more unused data'
      }))

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: largeData })
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

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/reports/survey/pdf', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('nome')
        }))
      })

      // Verify that only selected fields are sent
      const lastCall = (global.fetch as jest.Mock).mock.calls[1]
      const requestBody = JSON.parse(lastCall[1].body)
      
      expect(requestBody.data[0]).toHaveProperty('nome')
      expect(requestBody.data[0]).toHaveProperty('telefone')
      expect(requestBody.data[0]).toHaveProperty('resposta')
      expect(requestBody.data[0]).not.toHaveProperty('extraField1')
    })
  })

  describe('User Feedback', () => {
    it('should show retry count in loading message', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSurveyData })
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockImplementationOnce(() => new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            headers: { get: () => 'application/pdf' },
            blob: () => Promise.resolve(new Blob(['pdf content']))
          }), 100)
        }))

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      // Wait for error and auto-retry
      await waitFor(() => {
        expect(screen.getByText(/Tentativa 2/)).toBeInTheDocument()
      })
    })

    it('should close modal automatically after successful PDF generation', async () => {
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

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      const pdfButton = screen.getByText('Gerar PDF')
      fireEvent.click(pdfButton)

      // Should call onClose after successful generation
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
  })

  describe('Data Validation', () => {
    it('should validate data before PDF generation', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] }) // Empty data
        })

      render(<SurveyPreviewModal {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument()
      })

      // PDF button should be disabled
      const pdfButton = screen.getByText('Gerar PDF')
      expect(pdfButton).toBeDisabled()
    })

    it('should show appropriate error for missing fields', async () => {
      const propsWithoutFields = {
        ...mockProps,
        selectedFields: []
      }

      render(<SurveyPreviewModal {...propsWithoutFields} />)

      // Should not attempt to fetch data without fields
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})