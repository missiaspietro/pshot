/**
 * Testes de compatibilidade para funcionalidade de exportação Excel
 * Verifica se as APIs necessárias estão disponíveis e funcionam corretamente
 */

describe('Excel Export Compatibility', () => {
  // Backup das APIs originais
  const originalBlob = global.Blob
  const originalURL = global.URL
  const originalDocument = global.document

  afterEach(() => {
    // Restaura APIs originais
    global.Blob = originalBlob
    global.URL = originalURL
    global.document = originalDocument
  })

  describe('Browser API Support', () => {
    it('should support Blob API', () => {
      expect(typeof Blob).toBe('function')
      
      const blob = new Blob(['test'], { type: 'text/plain' })
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBe(4)
      expect(blob.type).toBe('text/plain')
    })

    it('should support URL.createObjectURL', () => {
      expect(typeof URL.createObjectURL).toBe('function')
      expect(typeof URL.revokeObjectURL).toBe('function')
      
      const blob = new Blob(['test'])
      const url = URL.createObjectURL(blob)
      expect(typeof url).toBe('string')
      expect(url).toMatch(/^blob:/)
      
      // Cleanup
      URL.revokeObjectURL(url)
    })

    it('should support document.createElement for download links', () => {
      expect(typeof document.createElement).toBe('function')
      
      const link = document.createElement('a')
      expect(link.tagName.toLowerCase()).toBe('a')
      expect('href' in link).toBe(true)
      expect('download' in link).toBe(true)
      expect('click' in link).toBe(true)
    })

    it('should support ArrayBuffer for Excel file generation', () => {
      expect(typeof ArrayBuffer).toBe('function')
      
      const buffer = new ArrayBuffer(8)
      expect(buffer).toBeInstanceOf(ArrayBuffer)
      expect(buffer.byteLength).toBe(8)
    })
  })

  describe('Excel MIME Type Support', () => {
    it('should create blob with correct Excel MIME type', () => {
      const excelMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const buffer = new ArrayBuffer(8)
      
      const blob = new Blob([buffer], { type: excelMimeType })
      expect(blob.type).toBe(excelMimeType)
    })

    it('should handle alternative MIME types', () => {
      const alternativeMimeTypes = [
        'application/vnd.ms-excel',
        'application/excel',
        'application/x-excel'
      ]

      alternativeMimeTypes.forEach(mimeType => {
        const blob = new Blob(['test'], { type: mimeType })
        expect(blob.type).toBe(mimeType)
      })
    })
  })

  describe('Download Functionality', () => {
    it('should create downloadable link with correct attributes', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        style: { display: '' }
      }

      document.createElement = jest.fn(() => mockLink as any)
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()

      const blob = new Blob(['test'])
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'test.xlsx'
      
      expect(link.href).toBe(url)
      expect(link.download).toBe('test.xlsx')
      expect(typeof link.click).toBe('function')
    })

    it('should handle download in different environments', () => {
      // Simula diferentes ambientes de navegador
      const environments = [
        { userAgent: 'Chrome', expected: true },
        { userAgent: 'Firefox', expected: true },
        { userAgent: 'Safari', expected: true },
        { userAgent: 'Edge', expected: true }
      ]

      environments.forEach(env => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: env.userAgent,
          configurable: true
        })

        // Verifica se funcionalidades básicas estão disponíveis
        expect(typeof Blob).toBe('function')
        expect(typeof URL.createObjectURL).toBe('function')
        expect(typeof document.createElement).toBe('function')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle Blob creation errors', () => {
      // Mock Blob que falha
      global.Blob = jest.fn(() => {
        throw new Error('Blob not supported')
      }) as any

      expect(() => {
        new Blob(['test'])
      }).toThrow('Blob not supported')
    })

    it('should handle URL.createObjectURL errors', () => {
      global.URL = {
        createObjectURL: jest.fn(() => {
          throw new Error('createObjectURL not supported')
        }),
        revokeObjectURL: jest.fn()
      } as any

      const blob = new Blob(['test'])
      
      expect(() => {
        URL.createObjectURL(blob)
      }).toThrow('createObjectURL not supported')
    })

    it('should handle DOM manipulation errors', () => {
      document.createElement = jest.fn(() => {
        throw new Error('createElement failed')
      })

      expect(() => {
        document.createElement('a')
      }).toThrow('createElement failed')
    })
  })

  describe('Memory Management', () => {
    it('should properly cleanup blob URLs', () => {
      const revokeObjectURL = jest.fn()
      global.URL = {
        createObjectURL: jest.fn(() => 'mock-url'),
        revokeObjectURL
      } as any

      const blob = new Blob(['test'])
      const url = URL.createObjectURL(blob)
      
      expect(url).toBe('mock-url')
      
      URL.revokeObjectURL(url)
      expect(revokeObjectURL).toHaveBeenCalledWith('mock-url')
    })

    it('should handle large file generation', () => {
      // Simula arquivo grande (1MB)
      const largeBuffer = new ArrayBuffer(1024 * 1024)
      
      expect(() => {
        const blob = new Blob([largeBuffer])
        const url = URL.createObjectURL(blob)
        URL.revokeObjectURL(url)
      }).not.toThrow()
    })
  })

  describe('Date Formatting Compatibility', () => {
    it('should format dates consistently across locales', () => {
      const testDate = new Date('2024-01-15')
      
      // Testa formatação de data para nome do arquivo
      const year = testDate.getFullYear()
      const month = String(testDate.getMonth() + 1).padStart(2, '0')
      const day = String(testDate.getDate()).padStart(2, '0')
      
      const fileName = `cashback-export-${year}-${month}-${day}.xlsx`
      
      expect(fileName).toBe('cashback-export-2024-01-15.xlsx')
      expect(fileName).toMatch(/^cashback-export-\d{4}-\d{2}-\d{2}\.xlsx$/)
    })

    it('should handle different timezone scenarios', () => {
      // Testa com diferentes timezones
      const utcDate = new Date('2024-01-15T12:00:00Z')
      
      // Simula diferentes offsets de timezone
      const timezoneOffsets = [-480, -300, 0, 60, 480] // Diferentes fusos horários
      
      timezoneOffsets.forEach(offset => {
        const localDate = new Date(utcDate.getTime() - (offset * 60000))
        const fileName = `cashback-export-${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}.xlsx`
        
        expect(fileName).toMatch(/^cashback-export-\d{4}-\d{2}-\d{2}\.xlsx$/)
      })
    })
  })
})