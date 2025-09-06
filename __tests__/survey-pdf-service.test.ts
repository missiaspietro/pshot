import { SurveyPDFService, SurveyData, PDFGenerationOptions } from '@/lib/survey-pdf-service'

describe('SurveyPDFService', () => {
  const mockData: SurveyData[] = [
    {
      id: 1,
      nome: 'João Silva',
      telefone: '11999887766',
      resposta: '1',
      loja: 'Loja Centro',
      rede: 'Rede Principal',
      data_de_envio: '2024-01-15'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      telefone: '11888776655',
      resposta: '2',
      loja: 'Loja Norte',
      rede: 'Rede Principal',
      data_de_envio: '2024-01-16'
    }
  ]

  const mockOptions: PDFGenerationOptions = {
    selectedFields: ['nome', 'telefone', 'resposta', 'loja'],
    fieldLabels: {
      nome: 'Nome',
      telefone: 'Telefone',
      resposta: 'Resposta',
      loja: 'Loja'
    },
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    empresa: 'Empresa Teste'
  }

  describe('validateData', () => {
    it('should validate correct data successfully', () => {
      const result = SurveyPDFService.validateData(mockData, mockOptions.selectedFields)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.recordCount).toBe(2)
      expect(result.fieldCount).toBe(4)
    })

    it('should reject empty data array', () => {
      const result = SurveyPDFService.validateData([], mockOptions.selectedFields)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Nenhum registro encontrado para gerar o PDF')
      expect(result.recordCount).toBe(0)
    })

    it('should reject null or undefined data', () => {
      const result = SurveyPDFService.validateData(null as any, mockOptions.selectedFields)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Dados inválidos ou não fornecidos')
    })

    it('should reject empty selected fields', () => {
      const result = SurveyPDFService.validateData(mockData, [])
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Nenhum campo selecionado para o relatório')
    })

    it('should warn about large datasets', () => {
      const largeData = Array(15000).fill(mockData[0])
      const result = SurveyPDFService.validateData(largeData, mockOptions.selectedFields)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(expect.stringContaining('Grande volume de dados'))
    })

    it('should warn about many columns', () => {
      const manyFields = Array(15).fill('field').map((f, i) => `${f}${i}`)
      const result = SurveyPDFService.validateData(mockData, manyFields)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(expect.stringContaining('Muitas colunas selecionadas'))
    })

    it('should warn about missing fields in data', () => {
      const fieldsWithMissing = [...mockOptions.selectedFields, 'nonexistent_field']
      const result = SurveyPDFService.validateData(mockData, fieldsWithMissing)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(expect.stringContaining('Campos não encontrados'))
    })
  })

  describe('calculateOptimalLayout', () => {
    it('should use A4 portrait for few columns', () => {
      const layout = SurveyPDFService.calculateOptimalLayout(3, 100)
      
      expect(layout.pageSize).toBe('A4')
      expect(layout.orientation).toBe('portrait')
      expect(layout.fontSize).toBe(10)
    })

    it('should use A4 landscape for medium columns', () => {
      const layout = SurveyPDFService.calculateOptimalLayout(5, 100)
      
      expect(layout.pageSize).toBe('A4')
      expect(layout.orientation).toBe('landscape')
      expect(layout.fontSize).toBe(9)
    })

    it('should use A3 portrait for many columns', () => {
      const layout = SurveyPDFService.calculateOptimalLayout(7, 100)
      
      expect(layout.pageSize).toBe('A3')
      expect(layout.orientation).toBe('portrait')
      expect(layout.fontSize).toBe(8)
    })

    it('should use A3 landscape for very many columns', () => {
      const layout = SurveyPDFService.calculateOptimalLayout(10, 100)
      
      expect(layout.pageSize).toBe('A3')
      expect(layout.orientation).toBe('landscape')
      expect(layout.fontSize).toBe(7)
    })

    it('should calculate appropriate column width', () => {
      const layout = SurveyPDFService.calculateOptimalLayout(4, 100)
      
      expect(layout.columnWidth).toBeGreaterThan(0)
      expect(layout.columnWidth).toBeLessThan(200) // Reasonable width
    })
  })

  describe('formatCellValue', () => {
    it('should format null/undefined values as dash', () => {
      expect(SurveyPDFService.formatCellValue(null)).toBe('-')
      expect(SurveyPDFService.formatCellValue(undefined)).toBe('-')
      expect(SurveyPDFService.formatCellValue('')).toBe('-')
    })

    it('should format response values correctly', () => {
      expect(SurveyPDFService.formatCellValue('1', 'resposta')).toBe('Ótimo')
      expect(SurveyPDFService.formatCellValue('2', 'resposta')).toBe('Bom')
      expect(SurveyPDFService.formatCellValue('3', 'resposta')).toBe('Regular')
      expect(SurveyPDFService.formatCellValue('4', 'resposta')).toBe('Péssimo')
      expect(SurveyPDFService.formatCellValue('5', 'resposta')).toBe('5')
    })

    it('should format dates correctly', () => {
      const dateValue = '2024-01-15T10:30:00Z'
      const formatted = SurveyPDFService.formatCellValue(dateValue)
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/) // DD/MM/YYYY format
    })

    it('should format simple date strings', () => {
      const dateValue = '2024-01-15'
      const formatted = SurveyPDFService.formatCellValue(dateValue)
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/) // DD/MM/YYYY format
    })

    it('should format phone numbers', () => {
      expect(SurveyPDFService.formatCellValue('11999887766', 'telefone')).toBe('(11) 99988-7766')
      expect(SurveyPDFService.formatCellValue('1199887766', 'telefone')).toBe('(11) 9988-7766')
    })

    it('should truncate long text', () => {
      const longText = 'A'.repeat(60)
      const formatted = SurveyPDFService.formatCellValue(longText)
      
      expect(formatted).toHaveLength(50) // 47 chars + '...'
      expect(formatted).toEndWith('...')
    })

    it('should handle regular strings', () => {
      const text = 'Normal text'
      expect(SurveyPDFService.formatCellValue(text)).toBe(text)
    })
  })

  describe('generateFilename', () => {
    it('should generate filename with all components', () => {
      const filename = SurveyPDFService.generateFilename(
        '2024-01-01',
        '2024-01-31',
        4,
        'Empresa Teste'
      )
      
      expect(filename).toContain('relatorio-pesquisas')
      expect(filename).toContain('01-01-2024_31-01-2024')
      expect(filename).toContain('4campos')
      expect(filename).toContain('empresateste')
      expect(filename).toEndWith('.pdf')
    })

    it('should generate filename without empresa', () => {
      const filename = SurveyPDFService.generateFilename(
        '2024-01-01',
        '2024-01-31',
        3
      )
      
      expect(filename).toContain('relatorio-pesquisas')
      expect(filename).toContain('3campos')
      expect(filename).not.toContain('empresa')
      expect(filename).toEndWith('.pdf')
    })

    it('should generate filename without dates', () => {
      const filename = SurveyPDFService.generateFilename('', '', 2)
      
      expect(filename).toContain('relatorio-pesquisas')
      expect(filename).toContain('2campos')
      expect(filename).toEndWith('.pdf')
    })

    it('should clean empresa name properly', () => {
      const filename = SurveyPDFService.generateFilename(
        '2024-01-01',
        '2024-01-31',
        1,
        'Empresa & Cia. Ltda!'
      )
      
      expect(filename).toContain('empresacialtda')
    })
  })

  describe('generatePDF', () => {
    it('should reject invalid data', async () => {
      const result = await SurveyPDFService.generatePDF([], mockOptions)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Nenhum registro encontrado')
    })

    it('should reject empty selected fields', async () => {
      const invalidOptions = { ...mockOptions, selectedFields: [] }
      const result = await SurveyPDFService.generatePDF(mockData, invalidOptions)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Nenhum campo selecionado')
    })

    it('should generate PDF successfully with valid data', async () => {
      const result = await SurveyPDFService.generatePDF(mockData, mockOptions)
      
      expect(result.success).toBe(true)
      expect(result.buffer).toBeDefined()
      expect(result.filename).toContain('relatorio-pesquisas')
      expect(result.filename).toEndWith('.pdf')
    })

    it('should handle PDF generation errors gracefully', async () => {
      // Mock PDFDocument to throw an error
      const originalPDFDocument = require('pdfkit')
      jest.doMock('pdfkit', () => {
        return jest.fn().mockImplementation(() => {
          throw new Error('PDF generation failed')
        })
      })

      const result = await SurveyPDFService.generatePDF(mockData, mockOptions)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('PDF generation failed')
    })
  })

  describe('Edge Cases', () => {
    it('should handle data with special characters', () => {
      const specialData: SurveyData[] = [{
        nome: 'José da Silva & Cia.',
        telefone: '(11) 99999-9999',
        resposta: '1',
        loja: 'Loja "Especial"'
      }]

      const result = SurveyPDFService.validateData(specialData, ['nome', 'telefone'])
      expect(result.isValid).toBe(true)
    })

    it('should handle mixed data types', () => {
      const mixedData: SurveyData[] = [{
        id: 123,
        nome: 'Test',
        active: true,
        score: 4.5,
        date: new Date('2024-01-01')
      }]

      const formatted = SurveyPDFService.formatCellValue(mixedData[0].active)
      expect(formatted).toBe('true')
    })

    it('should handle very large field counts', () => {
      const manyFields = Array(20).fill('field').map((f, i) => `${f}${i}`)
      const layout = SurveyPDFService.calculateOptimalLayout(manyFields.length, 100)
      
      expect(layout.pageSize).toBe('A3')
      expect(layout.orientation).toBe('landscape')
      expect(layout.fontSize).toBe(7)
    })
  })
})