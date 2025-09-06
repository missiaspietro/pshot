import PDFDocument from 'pdfkit'

export interface SurveyData {
  [key: string]: any
}

export interface PDFGenerationOptions {
  selectedFields: string[]
  fieldLabels: { [key: string]: string }
  startDate: string
  endDate: string
  empresa?: string
}

export interface LayoutConfig {
  pageSize: 'A4' | 'A3' | 'Letter'
  orientation: 'portrait' | 'landscape'
  fontSize: number
  columnWidth: number
  margins: { top: number, bottom: number, left: number, right: number }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recordCount: number
  fieldCount: number
}

export interface PDFResult {
  success: boolean
  buffer?: Buffer
  filename: string
  error?: string
  fallbackHtml?: string
}

export enum PDFErrorType {
  VALIDATION_ERROR = 'validation_error',
  LAYOUT_ERROR = 'layout_error',
  GENERATION_ERROR = 'generation_error',
  RESOURCE_ERROR = 'resource_error',
  TIMEOUT_ERROR = 'timeout_error'
}

export interface PDFError {
  type: PDFErrorType
  message: string
  details?: any
  canRetry: boolean
  suggestedAction?: string
}

export class SurveyPDFService {
  /**
   * Validates survey data before PDF generation
   */
  static validateData(data: SurveyData[], selectedFields: string[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if data exists
    if (!data || !Array.isArray(data)) {
      errors.push('Dados inválidos ou não fornecidos')
      return {
        isValid: false,
        errors,
        warnings,
        recordCount: 0,
        fieldCount: 0
      }
    }

    // Check if there's data to process
    if (data.length === 0) {
      errors.push('Nenhum registro encontrado para gerar o PDF')
      return {
        isValid: false,
        errors,
        warnings,
        recordCount: 0,
        fieldCount: selectedFields.length
      }
    }

    // Check if fields are selected
    if (!selectedFields || selectedFields.length === 0) {
      errors.push('Nenhum campo selecionado para o relatório')
      return {
        isValid: false,
        errors,
        warnings,
        recordCount: data.length,
        fieldCount: 0
      }
    }

    // Check for excessive data that might cause performance issues
    if (data.length > 10000) {
      warnings.push(`Grande volume de dados (${data.length} registros). A geração pode demorar mais.`)
    }

    // Check for excessive columns that might cause layout issues
    if (selectedFields.length > 10) {
      warnings.push(`Muitas colunas selecionadas (${selectedFields.length}). O layout pode ficar compacto.`)
    }

    // Validate that selected fields exist in data
    if (data.length > 0) {
      const firstRecord = data[0]
      const missingFields = selectedFields.filter(field => !(field in firstRecord))
      
      if (missingFields.length > 0) {
        warnings.push(`Campos não encontrados nos dados: ${missingFields.join(', ')}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recordCount: data.length,
      fieldCount: selectedFields.length
    }
  }

  /**
   * Calculates optimal layout configuration based on data characteristics
   */
  static calculateOptimalLayout(columnCount: number, recordCount: number): LayoutConfig {
    let pageSize: 'A4' | 'A3' | 'Letter' = 'A4'
    let orientation: 'portrait' | 'landscape' = 'portrait'
    let fontSize = 10
    let margins = { top: 50, bottom: 50, left: 50, right: 50 }

    // Determine page size and orientation based on column count
    if (columnCount <= 4) {
      pageSize = 'A4'
      orientation = 'portrait'
      fontSize = 10
    } else if (columnCount <= 6) {
      pageSize = 'A4'
      orientation = 'landscape'
      fontSize = 9
    } else if (columnCount <= 8) {
      pageSize = 'A3'
      orientation = 'portrait'
      fontSize = 8
    } else {
      pageSize = 'A3'
      orientation = 'landscape'
      fontSize = 7
      margins = { top: 40, bottom: 40, left: 40, right: 40 }
    }

    // Calculate column width based on page size and orientation
    const pageWidths = {
      'A4': { portrait: 595, landscape: 842 },
      'A3': { portrait: 842, landscape: 1191 },
      'Letter': { portrait: 612, landscape: 792 }
    }

    const availableWidth = pageWidths[pageSize][orientation] - margins.left - margins.right
    const columnWidth = availableWidth / columnCount

    return {
      pageSize,
      orientation,
      fontSize,
      columnWidth,
      margins
    }
  }

  /**
   * Formats cell values for display in PDF
   */
  static formatCellValue(value: any, fieldName?: string): string {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '-'
    }

    // Handle empty strings
    if (value === '') {
      return '-'
    }

    // Special formatting for response field
    if (fieldName === 'resposta') {
      const responseValue = String(value).trim()
      switch (responseValue) {
        case '1':
          return 'Ótimo'
        case '2':
          return 'Bom'
        case '3':
          return 'Regular'
        case '4':
          return 'Péssimo'
        default:
          return responseValue
      }
    }

    // Format dates
    if (typeof value === 'string' && (value.includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(value))) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR')
        }
      } catch {
        // If date parsing fails, continue with string formatting
      }
    }

    // Format phone numbers
    if (fieldName === 'telefone' && typeof value === 'string') {
      const phone = value.replace(/\D/g, '')
      if (phone.length === 11) {
        return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
      } else if (phone.length === 10) {
        return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`
      }
    }

    // Convert to string and limit length for PDF layout
    const stringValue = String(value)
    if (stringValue.length > 50) {
      return stringValue.substring(0, 47) + '...'
    }

    return stringValue
  }

  /**
   * Generates descriptive filename for the PDF
   */
  static generateFilename(startDate: string, endDate: string, fieldCount: number, empresa?: string): string {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    
    let filename = 'relatorio-pesquisas'
    
    // Add period information if available
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('pt-BR').replace(/\//g, '-')
      const end = new Date(endDate).toLocaleDateString('pt-BR').replace(/\//g, '-')
      filename += `-${start}_${end}`
    }
    
    // Add field count information
    filename += `-${fieldCount}campos`
    
    // Add empresa if available
    if (empresa) {
      const empresaClean = empresa.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      filename += `-${empresaClean}`
    }
    
    // Add generation date
    filename += `-${dateStr}`
    
    return `${filename}.pdf`
  }

  /**
   * Creates PDF document with enhanced formatting
   */
  static async generatePDF(data: SurveyData[], options: PDFGenerationOptions): Promise<PDFResult> {
    try {
      // Validate input data
      const validation = this.validateData(data, options.selectedFields)
      if (!validation.isValid) {
        return {
          success: false,
          filename: '',
          error: validation.errors.join('; ')
        }
      }

      // Calculate optimal layout
      const layout = this.calculateOptimalLayout(options.selectedFields.length, data.length)
      
      // Generate filename
      const filename = this.generateFilename(
        options.startDate, 
        options.endDate, 
        options.selectedFields.length,
        options.empresa
      )

      // Create PDF document
      const doc = new PDFDocument({
        size: layout.pageSize,
        layout: layout.orientation,
        margins: layout.margins
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))

      // Add header
      this.addHeader(doc, options, layout, validation.recordCount)
      
      // Add table
      await this.addTable(doc, data, options, layout)
      
      // Add footer
      this.addFooter(doc, layout)

      // Finalize document
      doc.end()

      // Wait for PDF generation to complete
      const buffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks))
        })
      })

      return {
        success: true,
        buffer,
        filename
      }

    } catch (error) {
      console.error('Erro na geração do PDF:', error)
      
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido na geração do PDF'
      }
    }
  }

  /**
   * Adds header to PDF document
   */
  private static addHeader(doc: PDFKit.PDFDocument, options: PDFGenerationOptions, layout: LayoutConfig, recordCount: number) {
    doc.fontSize(16).text('Relatório de Pesquisas de Satisfação', { align: 'center' })
    doc.moveDown(0.5)

    doc.fontSize(layout.fontSize)
    
    if (options.empresa) {
      doc.text(`Empresa: ${options.empresa}`)
    }
    
    if (options.startDate && options.endDate) {
      const startFormatted = new Date(options.startDate).toLocaleDateString('pt-BR')
      const endFormatted = new Date(options.endDate).toLocaleDateString('pt-BR')
      doc.text(`Período: ${startFormatted} até ${endFormatted}`)
    }
    
    doc.text(`Campos selecionados: ${options.selectedFields.length}`)
    doc.text(`Total de registros: ${recordCount}`)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`)
    
    doc.moveDown(1)
  }

  /**
   * Adds data table to PDF document
   */
  private static async addTable(doc: PDFKit.PDFDocument, data: SurveyData[], options: PDFGenerationOptions, layout: LayoutConfig) {
    const { selectedFields, fieldLabels } = options
    const { columnWidth, fontSize } = layout
    
    const tableTop = doc.y
    const itemHeight = fontSize + 8
    let currentY = tableTop

    // Draw table headers
    doc.fontSize(fontSize).fillColor('black')
    let currentX = layout.margins.left

    selectedFields.forEach((field) => {
      doc.rect(currentX, currentY, columnWidth, itemHeight).stroke()
      doc.text(fieldLabels[field] || field, currentX + 5, currentY + 4, {
        width: columnWidth - 10,
        height: itemHeight - 8,
        ellipsis: true
      })
      currentX += columnWidth
    })

    currentY += itemHeight

    // Draw data rows
    data.forEach((item, index) => {
      // Check if we need a new page
      if (currentY + itemHeight > doc.page.height - layout.margins.bottom) {
        doc.addPage()
        currentY = layout.margins.top
        
        // Redraw headers on new page
        currentX = layout.margins.left
        selectedFields.forEach((field) => {
          doc.rect(currentX, currentY, columnWidth, itemHeight).stroke()
          doc.text(fieldLabels[field] || field, currentX + 5, currentY + 4, {
            width: columnWidth - 10,
            height: itemHeight - 8,
            ellipsis: true
          })
          currentX += columnWidth
        })
        currentY += itemHeight
      }

      // Draw data row
      currentX = layout.margins.left
      selectedFields.forEach((field) => {
        doc.rect(currentX, currentY, columnWidth, itemHeight).stroke()
        const value = this.formatCellValue(item[field], field)
        doc.text(value, currentX + 5, currentY + 4, {
          width: columnWidth - 10,
          height: itemHeight - 8,
          ellipsis: true
        })
        currentX += columnWidth
      })

      currentY += itemHeight
    })
  }

  /**
   * Adds footer to PDF document
   */
  private static addFooter(doc: PDFKit.PDFDocument, layout: LayoutConfig) {
    const pageCount = doc.bufferedPageRange().count
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)
      
      doc.fontSize(8)
      doc.text(
        `Página ${i + 1} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
        layout.margins.left,
        doc.page.height - layout.margins.bottom + 10,
        { align: 'center', width: doc.page.width - layout.margins.left - layout.margins.right }
      )
    }
  }
}