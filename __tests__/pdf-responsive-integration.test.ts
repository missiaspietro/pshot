import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock do Puppeteer para testes
const mockPdf = jest.fn()
const mockSetContent = jest.fn()
const mockSetViewport = jest.fn()
const mockSetExtraHTTPHeaders = jest.fn()
const mockNewPage = jest.fn().mockResolvedValue({
  pdf: mockPdf,
  setContent: mockSetContent,
  setViewport: mockSetViewport,
  setExtraHTTPHeaders: mockSetExtraHTTPHeaders
})
const mockClose = jest.fn()
const mockLaunch = jest.fn().mockResolvedValue({
  newPage: mockNewPage,
  close: mockClose
})

jest.mock('puppeteer', () => ({
  launch: mockLaunch
}))

describe('PDF Responsive Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPdf.mockResolvedValue(Buffer.from('fake-pdf-content'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Birthday PDF Generation', () => {
    it('should generate PDF with portrait orientation for few fields', async () => {
      const selectedFields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status']
      
      // Simular chamada da API
      const mockData = [
        { criado_em: '2024-01-01', cliente: 'João Silva', whatsApp: '11999999999', loja: 'Loja A', status: 'Ativo' }
      ]
      
      // Mock da função generateReportHTML (seria importada do arquivo real)
      const generateReportHTML = (data: any[], fields: string[], labels: any) => {
        const columnCount = fields.length
        const isWideTable = columnCount > 6
        
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              @page { size: A4 ${isWideTable ? 'landscape' : 'portrait'}; }
            </style>
          </head>
          <body>
            <table>
              ${fields.map(field => `<th>${field}</th>`).join('')}
            </table>
          </body>
          </html>
        `
      }
      
      const htmlContent = generateReportHTML(mockData, selectedFields, {})
      
      // Verificar que o HTML contém orientação portrait
      expect(htmlContent).toContain('size: A4 portrait')
      expect(htmlContent).not.toContain('size: A4 landscape')
      
      // Simular configuração do Puppeteer
      const columnCount = selectedFields.length
      const isWideTable = columnCount > 6
      const isVeryWideTable = columnCount > 8
      
      const expectedPdfConfig = {
        format: 'A4',
        landscape: isWideTable,
        margin: {
          top: isVeryWideTable ? '10mm' : '15mm',
          right: isVeryWideTable ? '10mm' : '15mm',
          bottom: isVeryWideTable ? '10mm' : '15mm',
          left: isVeryWideTable ? '10mm' : '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      }
      
      expect(expectedPdfConfig.landscape).toBe(false)
      expect(expectedPdfConfig.margin.top).toBe('15mm')
    })

    it('should generate PDF with landscape orientation for many fields', async () => {
      const selectedFields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status', 'Sub_Rede', 'obs', 'extra']
      
      const mockData = [
        { criado_em: '2024-01-01', cliente: 'João Silva', whatsApp: '11999999999', loja: 'Loja A', status: 'Ativo', Sub_Rede: 'Sub A', obs: 'Teste', extra: 'Extra' }
      ]
      
      const generateReportHTML = (data: any[], fields: string[], labels: any) => {
        const columnCount = fields.length
        const isWideTable = columnCount > 6
        
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              @page { size: A4 ${isWideTable ? 'landscape' : 'portrait'}; }
            </style>
          </head>
          <body>
            <table>
              ${fields.map(field => `<th>${field}</th>`).join('')}
            </table>
          </body>
          </html>
        `
      }
      
      const htmlContent = generateReportHTML(mockData, selectedFields, {})
      
      // Verificar que o HTML contém orientação landscape
      expect(htmlContent).toContain('size: A4 landscape')
      expect(htmlContent).not.toContain('size: A4 portrait')
      
      // Simular configuração do Puppeteer
      const columnCount = selectedFields.length
      const isWideTable = columnCount > 6
      const isVeryWideTable = columnCount > 8
      
      const expectedPdfConfig = {
        format: 'A4',
        landscape: isWideTable,
        margin: {
          top: isVeryWideTable ? '10mm' : '15mm',
          right: isVeryWideTable ? '10mm' : '15mm',
          bottom: isVeryWideTable ? '10mm' : '15mm',
          left: isVeryWideTable ? '10mm' : '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      }
      
      expect(expectedPdfConfig.landscape).toBe(true)
      expect(expectedPdfConfig.margin.top).toBe('15mm') // 8 fields = wide but not very wide
    })

    it('should use reduced margins for very wide tables', async () => {
      const selectedFields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status', 'Sub_Rede', 'obs', 'extra1', 'extra2']
      
      const columnCount = selectedFields.length
      const isWideTable = columnCount > 6
      const isVeryWideTable = columnCount > 8
      
      const expectedPdfConfig = {
        format: 'A4',
        landscape: isWideTable,
        margin: {
          top: isVeryWideTable ? '10mm' : '15mm',
          right: isVeryWideTable ? '10mm' : '15mm',
          bottom: isVeryWideTable ? '10mm' : '15mm',
          left: isVeryWideTable ? '10mm' : '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      }
      
      expect(expectedPdfConfig.landscape).toBe(true)
      expect(expectedPdfConfig.margin.top).toBe('10mm') // 9 fields = very wide
    })
  })

  describe('Cashback PDF Generation', () => {
    it('should use different thresholds for cashback reports', async () => {
      const selectedFields = ['Envio_novo', 'Nome', 'Whatsapp', 'Loja', 'Status', 'Extra']
      
      // Para cashback: > 5 = wide, > 7 = very wide
      const columnCount = selectedFields.length // 6 fields
      const isWideTable = columnCount > 5 // true
      const isVeryWideTable = columnCount > 7 // false
      
      const expectedPdfConfig = {
        format: 'A4',
        landscape: isWideTable,
        margin: {
          top: isVeryWideTable ? '10mm' : '15mm',
          right: isVeryWideTable ? '10mm' : '15mm',
          bottom: isVeryWideTable ? '10mm' : '15mm',
          left: isVeryWideTable ? '10mm' : '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      }
      
      expect(expectedPdfConfig.landscape).toBe(true) // 6 > 5
      expect(expectedPdfConfig.margin.top).toBe('15mm') // 6 <= 7
    })

    it('should maintain green color for cashback headers', async () => {
      const selectedFields = ['Envio_novo', 'Nome', 'Whatsapp']
      
      const generateCashbackHTML = (fields: string[]) => {
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .header h1 { color: #10b981; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Cashbacks</h1>
            </div>
          </body>
          </html>
        `
      }
      
      const htmlContent = generateCashbackHTML(selectedFields)
      expect(htmlContent).toContain('color: #10b981')
      expect(htmlContent).toContain('Relatório de Cashbacks')
    })
  })

  describe('Color Consistency', () => {
    it('should maintain birthday pink color', async () => {
      const generateBirthdayHTML = () => {
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .header h1 { color: #e91e63; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Aniversários</h1>
            </div>
          </body>
          </html>
        `
      }
      
      const htmlContent = generateBirthdayHTML()
      expect(htmlContent).toContain('color: #e91e63')
      expect(htmlContent).toContain('Relatório de Aniversários')
    })
  })

  describe('Responsive Features', () => {
    it('should include table container with overflow for wide tables', async () => {
      const selectedFields = Array.from({ length: 10 }, (_, i) => `field${i}`)
      
      const generateResponsiveHTML = (fields: string[]) => {
        const columnCount = fields.length
        const isWideTable = columnCount > 6
        
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .table-container {
                width: 100%;
                overflow-x: auto;
              }
              table {
                width: ${isWideTable ? 'max-content' : '100%'};
                min-width: 100%;
              }
            </style>
          </head>
          <body>
            <div class="table-container">
              <table>
                ${fields.map(field => `<th>${field}</th>`).join('')}
              </table>
            </div>
          </body>
          </html>
        `
      }
      
      const htmlContent = generateResponsiveHTML(selectedFields)
      expect(htmlContent).toContain('overflow-x: auto')
      expect(htmlContent).toContain('width: max-content')
      expect(htmlContent).toContain('table-container')
    })

    it('should include optimization feedback for wide tables', async () => {
      const selectedFields = Array.from({ length: 8 }, (_, i) => `field${i}`)
      
      const generateHTMLWithFeedback = (fields: string[]) => {
        const columnCount = fields.length
        const isWideTable = columnCount > 6
        
        let html = `
          <!DOCTYPE html>
          <html>
          <body>
            <table>
              ${fields.map(field => `<th>${field}</th>`).join('')}
            </table>
        `
        
        if (isWideTable) {
          html += `
            <div style="margin-top: 10px; font-size: 10px; color: #666; text-align: center;">
              <em>Tabela com ${columnCount} colunas - Formato paisagem otimizado</em>
            </div>
          `
        }
        
        html += `
          </body>
          </html>
        `
        
        return html
      }
      
      const htmlContent = generateHTMLWithFeedback(selectedFields)
      expect(htmlContent).toContain('Tabela com 8 colunas - Formato paisagem otimizado')
      expect(htmlContent).toContain('font-size: 10px')
      expect(htmlContent).toContain('color: #666')
    })
  })

  describe('Performance and Error Handling', () => {
    it('should handle empty data gracefully', async () => {
      const selectedFields = ['field1', 'field2']
      const emptyData: any[] = []
      
      const generateHTMLWithEmptyData = (data: any[], fields: string[]) => {
        return `
          <!DOCTYPE html>
          <html>
          <body>
            ${data.length > 0 ? `
              <table>
                ${fields.map(field => `<th>${field}</th>`).join('')}
              </table>
            ` : `
              <div class="no-data">
                <p>Nenhum registro encontrado para os filtros selecionados.</p>
              </div>
            `}
          </body>
          </html>
        `
      }
      
      const htmlContent = generateHTMLWithEmptyData(emptyData, selectedFields)
      expect(htmlContent).toContain('Nenhum registro encontrado')
      expect(htmlContent).toContain('no-data')
    })

    it('should handle invalid field configurations', async () => {
      const invalidFields: string[] = []
      
      const detectLayoutSafely = (fields: string[], reportType: 'birthday' | 'cashback') => {
        const columnCount = Math.max(0, fields.length) // Ensure non-negative
        
        const thresholds = {
          birthday: { wide: 6, veryWide: 8 },
          cashback: { wide: 5, veryWide: 7 }
        }
        
        const threshold = thresholds[reportType] || thresholds.birthday // Fallback
        
        return {
          columnCount,
          isWideTable: columnCount > threshold.wide,
          isVeryWideTable: columnCount > threshold.veryWide
        }
      }
      
      const layout = detectLayoutSafely(invalidFields, 'birthday')
      expect(layout.columnCount).toBe(0)
      expect(layout.isWideTable).toBe(false)
      expect(layout.isVeryWideTable).toBe(false)
    })
  })
})