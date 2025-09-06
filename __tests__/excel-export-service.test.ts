import { excelExportService, ExcelExportError, ExportErrorType } from '@/lib/excel-export-service'
import * as XLSX from 'xlsx'

// Mock do XLSX
jest.mock('xlsx')
const mockXLSX = XLSX as jest.Mocked<typeof XLSX>

// Mock do DOM
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
})

describe('ExcelExportService', () => {
  const mockData = [
    { mes: 'janeiro 2024', loja1: 10, loja2: 20 },
    { mes: 'fevereiro 2024', loja1: 15, loja2: 25 }
  ]
  const mockLojas = ['1', '2']

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup XLSX mocks
    mockXLSX.utils = {
      json_to_sheet: jest.fn(() => ({ '!cols': [] })),
      book_new: jest.fn(() => ({})),
      book_append_sheet: jest.fn()
    } as any
    
    mockXLSX.write = jest.fn(() => new ArrayBuffer(8))

    // Mock DOM elements
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    }
    
    document.createElement = jest.fn(() => mockLink as any)
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
  })

  describe('exportCashbackToExcel', () => {
    it('should throw error when data is empty', () => {
      expect(() => {
        excelExportService.exportCashbackToExcel([], mockLojas)
      }).toThrow(ExcelExportError)
      
      expect(() => {
        excelExportService.exportCashbackToExcel([], mockLojas)
      }).toThrow('Não há dados de cashback para exportar')
    })

    it('should throw error when lojas is empty', () => {
      expect(() => {
        excelExportService.exportCashbackToExcel(mockData, [])
      }).toThrow(ExcelExportError)
      
      expect(() => {
        excelExportService.exportCashbackToExcel(mockData, [])
      }).toThrow('Não há lojas disponíveis para exportar')
    })

    it('should transform data correctly for Excel', () => {
      excelExportService.exportCashbackToExcel(mockData, mockLojas)

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        { mes: 'janeiro 2024', 'Loja 1': 10, 'Loja 2': 20 },
        { mes: 'fevereiro 2024', 'Loja 1': 15, 'Loja 2': 25 }
      ])
    })

    it('should set correct column widths', () => {
      const mockWorksheet = { '!cols': [] }
      mockXLSX.utils.json_to_sheet.mockReturnValue(mockWorksheet as any)

      excelExportService.exportCashbackToExcel(mockData, mockLojas)

      expect(mockWorksheet['!cols']).toEqual([
        { wch: 20 }, // Coluna Mês
        { wch: 12 }, // Loja 1
        { wch: 12 }  // Loja 2
      ])
    })

    it('should generate correct filename with current date', () => {
      const mockDate = new Date('2024-01-15')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      excelExportService.exportCashbackToExcel(mockData, mockLojas)

      const mockLink = document.createElement('a')
      expect(mockLink.download).toBe('cashback-export-2024-01-15.xlsx')
    })

    it('should create workbook and worksheet correctly', () => {
      const mockWorkbook = {}
      const mockWorksheet = { '!cols': [] }
      
      mockXLSX.utils.book_new.mockReturnValue(mockWorkbook as any)
      mockXLSX.utils.json_to_sheet.mockReturnValue(mockWorksheet as any)

      excelExportService.exportCashbackToExcel(mockData, mockLojas)

      expect(mockXLSX.utils.book_new).toHaveBeenCalled()
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        mockWorkbook,
        mockWorksheet,
        'Cashback'
      )
    })

    it('should write workbook to buffer', () => {
      const mockWorkbook = {}
      mockXLSX.utils.book_new.mockReturnValue(mockWorkbook as any)

      excelExportService.exportCashbackToExcel(mockData, mockLojas)

      expect(mockXLSX.write).toHaveBeenCalledWith(mockWorkbook, {
        bookType: 'xlsx',
        type: 'array'
      })
    })

    it('should create blob and download link', () => {
      const mockBuffer = new ArrayBuffer(8)
      mockXLSX.write.mockReturnValue(mockBuffer)

      // Mock Blob
      global.Blob = jest.fn(() => ({
        size: 8,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })) as any

      excelExportService.exportCashbackToExcel(mockData, mockLojas)

      expect(global.Blob).toHaveBeenCalledWith([mockBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      expect(window.URL.createObjectURL).toHaveBeenCalled()
      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('should trigger download and cleanup', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      }
      document.createElement = jest.fn(() => mockLink as any)

      excelExportService.exportCashbackToExcel(mockData, mockLojas)

      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
      expect(window.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should handle worksheet generation errors', () => {
      mockXLSX.utils.json_to_sheet.mockImplementation(() => {
        throw new Error('Worksheet error')
      })

      expect(() => {
        excelExportService.exportCashbackToExcel(mockData, mockLojas)
      }).toThrow(ExcelExportError)

      expect(() => {
        excelExportService.exportCashbackToExcel(mockData, mockLojas)
      }).toThrow('Erro ao processar dados para Excel')
    })

    it('should handle download errors', () => {
      document.createElement = jest.fn(() => {
        throw new Error('DOM error')
      })

      expect(() => {
        excelExportService.exportCashbackToExcel(mockData, mockLojas)
      }).toThrow(ExcelExportError)
    })
  })

  describe('Error types', () => {
    it('should throw EMPTY_DATA error for empty data', () => {
      try {
        excelExportService.exportCashbackToExcel([], mockLojas)
      } catch (error) {
        expect(error).toBeInstanceOf(ExcelExportError)
        expect((error as ExcelExportError).type).toBe(ExportErrorType.EMPTY_DATA)
      }
    })

    it('should throw NO_STORES error for empty lojas', () => {
      try {
        excelExportService.exportCashbackToExcel(mockData, [])
      } catch (error) {
        expect(error).toBeInstanceOf(ExcelExportError)
        expect((error as ExcelExportError).type).toBe(ExportErrorType.NO_STORES)
      }
    })

    it('should throw GENERATION_ERROR for worksheet errors', () => {
      mockXLSX.utils.json_to_sheet.mockImplementation(() => {
        throw new Error('Worksheet error')
      })

      try {
        excelExportService.exportCashbackToExcel(mockData, mockLojas)
      } catch (error) {
        expect(error).toBeInstanceOf(ExcelExportError)
        expect((error as ExcelExportError).type).toBe(ExportErrorType.GENERATION_ERROR)
      }
    })
  })
})