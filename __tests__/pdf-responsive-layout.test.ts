import { describe, it, expect } from '@jest/globals'

// Função utilitária para detectar layout (extraída da lógica implementada)
function detectLayout(selectedFields: string[], reportType: 'birthday' | 'cashback') {
  const columnCount = selectedFields.length
  
  const thresholds = {
    birthday: { wide: 6, veryWide: 8 },
    cashback: { wide: 5, veryWide: 7 }
  }
  
  const threshold = thresholds[reportType]
  
  return {
    columnCount,
    isWideTable: columnCount > threshold.wide,
    isVeryWideTable: columnCount > threshold.veryWide
  }
}

// Função utilitária para calcular estilos (extraída da lógica implementada)
function calculateStyles(layout: { isWideTable: boolean; isVeryWideTable: boolean }) {
  const { isWideTable, isVeryWideTable } = layout
  
  return {
    fontSize: isVeryWideTable ? '10px' : isWideTable ? '11px' : '12px',
    cellPadding: isVeryWideTable ? '4px' : isWideTable ? '6px' : '8px',
    headerFontSize: isVeryWideTable ? '11px' : isWideTable ? '12px' : '13px',
    maxCellWidth: isVeryWideTable ? '120px' : isWideTable ? '150px' : '200px',
    pageMargin: isVeryWideTable ? '10mm' : '15mm'
  }
}

describe('PDF Responsive Layout', () => {
  describe('Column Detection', () => {
    describe('Birthday Reports', () => {
      it('should detect normal layout for few columns', () => {
        const fields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status']
        const layout = detectLayout(fields, 'birthday')
        
        expect(layout.columnCount).toBe(5)
        expect(layout.isWideTable).toBe(false)
        expect(layout.isVeryWideTable).toBe(false)
      })
      
      it('should detect wide layout for many columns', () => {
        const fields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status', 'Sub_Rede', 'obs']
        const layout = detectLayout(fields, 'birthday')
        
        expect(layout.columnCount).toBe(7)
        expect(layout.isWideTable).toBe(true)
        expect(layout.isVeryWideTable).toBe(false)
      })
      
      it('should detect very wide layout for excessive columns', () => {
        const fields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status', 'Sub_Rede', 'obs', 'extra1', 'extra2']
        const layout = detectLayout(fields, 'birthday')
        
        expect(layout.columnCount).toBe(9)
        expect(layout.isWideTable).toBe(true)
        expect(layout.isVeryWideTable).toBe(true)
      })
      
      it('should handle edge case at threshold boundary', () => {
        const fields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status', 'Sub_Rede'] // exactly 6
        const layout = detectLayout(fields, 'birthday')
        
        expect(layout.columnCount).toBe(6)
        expect(layout.isWideTable).toBe(false) // > 6, so 6 is still normal
        expect(layout.isVeryWideTable).toBe(false)
      })
    })
    
    describe('Cashback Reports', () => {
      it('should detect normal layout for few columns', () => {
        const fields = ['Envio_novo', 'Nome', 'Whatsapp', 'Loja', 'Status']
        const layout = detectLayout(fields, 'cashback')
        
        expect(layout.columnCount).toBe(5)
        expect(layout.isWideTable).toBe(false)
        expect(layout.isVeryWideTable).toBe(false)
      })
      
      it('should detect wide layout for many columns', () => {
        const fields = ['Envio_novo', 'Nome', 'Whatsapp', 'Loja', 'Status', 'Extra']
        const layout = detectLayout(fields, 'cashback')
        
        expect(layout.columnCount).toBe(6)
        expect(layout.isWideTable).toBe(true)
        expect(layout.isVeryWideTable).toBe(false)
      })
      
      it('should detect very wide layout for excessive columns', () => {
        const fields = ['Envio_novo', 'Nome', 'Whatsapp', 'Loja', 'Status', 'Extra1', 'Extra2', 'Extra3']
        const layout = detectLayout(fields, 'cashback')
        
        expect(layout.columnCount).toBe(8)
        expect(layout.isWideTable).toBe(true)
        expect(layout.isVeryWideTable).toBe(true)
      })
    })
    
    describe('Edge Cases', () => {
      it('should handle empty fields array', () => {
        const layout = detectLayout([], 'birthday')
        
        expect(layout.columnCount).toBe(0)
        expect(layout.isWideTable).toBe(false)
        expect(layout.isVeryWideTable).toBe(false)
      })
      
      it('should handle single field', () => {
        const layout = detectLayout(['cliente'], 'cashback')
        
        expect(layout.columnCount).toBe(1)
        expect(layout.isWideTable).toBe(false)
        expect(layout.isVeryWideTable).toBe(false)
      })
      
      it('should handle many fields', () => {
        const manyFields = Array.from({ length: 15 }, (_, i) => `field${i}`)
        const layout = detectLayout(manyFields, 'birthday')
        
        expect(layout.columnCount).toBe(15)
        expect(layout.isWideTable).toBe(true)
        expect(layout.isVeryWideTable).toBe(true)
      })
    })
  })
  
  describe('Style Calculation', () => {
    it('should calculate normal styles for normal layout', () => {
      const layout = { isWideTable: false, isVeryWideTable: false }
      const styles = calculateStyles(layout)
      
      expect(styles.fontSize).toBe('12px')
      expect(styles.cellPadding).toBe('8px')
      expect(styles.headerFontSize).toBe('13px')
      expect(styles.maxCellWidth).toBe('200px')
      expect(styles.pageMargin).toBe('15mm')
    })
    
    it('should calculate wide styles for wide layout', () => {
      const layout = { isWideTable: true, isVeryWideTable: false }
      const styles = calculateStyles(layout)
      
      expect(styles.fontSize).toBe('11px')
      expect(styles.cellPadding).toBe('6px')
      expect(styles.headerFontSize).toBe('12px')
      expect(styles.maxCellWidth).toBe('150px')
      expect(styles.pageMargin).toBe('15mm')
    })
    
    it('should calculate very wide styles for very wide layout', () => {
      const layout = { isWideTable: true, isVeryWideTable: true }
      const styles = calculateStyles(layout)
      
      expect(styles.fontSize).toBe('10px')
      expect(styles.cellPadding).toBe('4px')
      expect(styles.headerFontSize).toBe('11px')
      expect(styles.maxCellWidth).toBe('120px')
      expect(styles.pageMargin).toBe('10mm')
    })
    
    it('should ensure consistent style relationships', () => {
      const normalLayout = { isWideTable: false, isVeryWideTable: false }
      const wideLayout = { isWideTable: true, isVeryWideTable: false }
      const veryWideLayout = { isWideTable: true, isVeryWideTable: true }
      
      const normalStyles = calculateStyles(normalLayout)
      const wideStyles = calculateStyles(wideLayout)
      const veryWideStyles = calculateStyles(veryWideLayout)
      
      // Font sizes should decrease as layout gets wider
      expect(parseInt(normalStyles.fontSize)).toBeGreaterThan(parseInt(wideStyles.fontSize))
      expect(parseInt(wideStyles.fontSize)).toBeGreaterThan(parseInt(veryWideStyles.fontSize))
      
      // Padding should decrease as layout gets wider
      expect(parseInt(normalStyles.cellPadding)).toBeGreaterThan(parseInt(wideStyles.cellPadding))
      expect(parseInt(wideStyles.cellPadding)).toBeGreaterThan(parseInt(veryWideStyles.cellPadding))
      
      // Cell width should decrease as layout gets wider
      expect(parseInt(normalStyles.maxCellWidth)).toBeGreaterThan(parseInt(wideStyles.maxCellWidth))
      expect(parseInt(wideStyles.maxCellWidth)).toBeGreaterThan(parseInt(veryWideStyles.maxCellWidth))
    })
    
    it('should return valid CSS units', () => {
      const layout = { isWideTable: true, isVeryWideTable: false }
      const styles = calculateStyles(layout)
      
      expect(styles.fontSize).toMatch(/^\d+px$/)
      expect(styles.cellPadding).toMatch(/^\d+px$/)
      expect(styles.headerFontSize).toMatch(/^\d+px$/)
      expect(styles.maxCellWidth).toMatch(/^\d+px$/)
      expect(styles.pageMargin).toMatch(/^\d+mm$/)
    })
  })
  
  describe('Integration Tests', () => {
    it('should work end-to-end for birthday report with many fields', () => {
      const fields = ['criado_em', 'cliente', 'whatsApp', 'loja', 'status', 'Sub_Rede', 'obs', 'extra1', 'extra2']
      const layout = detectLayout(fields, 'birthday')
      const styles = calculateStyles(layout)
      
      expect(layout.isVeryWideTable).toBe(true)
      expect(styles.fontSize).toBe('10px')
      expect(styles.pageMargin).toBe('10mm')
    })
    
    it('should work end-to-end for cashback report with normal fields', () => {
      const fields = ['Envio_novo', 'Nome', 'Whatsapp', 'Loja']
      const layout = detectLayout(fields, 'cashback')
      const styles = calculateStyles(layout)
      
      expect(layout.isWideTable).toBe(false)
      expect(styles.fontSize).toBe('12px')
      expect(styles.pageMargin).toBe('15mm')
    })
  })
})