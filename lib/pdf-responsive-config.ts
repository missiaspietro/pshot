/**
 * Sistema de configuração extensível para layout responsivo de PDFs
 */

export interface ReportTypeConfig {
  name: string
  color: string
  thresholds: {
    wide: number
    veryWide: number
  }
  defaultFields: string[]
  styles?: {
    normal?: Partial<ResponsiveStyles>
    wide?: Partial<ResponsiveStyles>
    veryWide?: Partial<ResponsiveStyles>
  }
}

export interface ResponsiveStyles {
  fontSize: string
  cellPadding: string
  headerFontSize: string
  maxCellWidth: string
  pageMargin: string
}

export interface LayoutDetection {
  columnCount: number
  isWideTable: boolean
  isVeryWideTable: boolean
  reportType: string
}

// Configurações padrão para cada tipo de relatório
export const REPORT_CONFIGS: Record<string, ReportTypeConfig> = {
  birthday: {
    name: 'Aniversários',
    color: '#e91e63',
    thresholds: { 
      wide: 6, 
      veryWide: 8 
    },
    defaultFields: ['criado_em', 'cliente', 'whatsApp', 'loja', 'status'],
    styles: {
      normal: { fontSize: '12px', cellPadding: '8px', headerFontSize: '13px' },
      wide: { fontSize: '11px', cellPadding: '6px', headerFontSize: '12px' },
      veryWide: { fontSize: '10px', cellPadding: '4px', headerFontSize: '11px' }
    }
  },
  
  cashback: {
    name: 'Cashback',
    color: '#10b981',
    thresholds: { 
      wide: 5, 
      veryWide: 7 
    },
    defaultFields: ['Envio_novo', 'Nome', 'Whatsapp', 'Loja', 'Status'],
    styles: {
      normal: { fontSize: '12px', cellPadding: '8px', headerFontSize: '13px' },
      wide: { fontSize: '11px', cellPadding: '6px', headerFontSize: '12px' },
      veryWide: { fontSize: '10px', cellPadding: '4px', headerFontSize: '11px' }
    }
  },
  
  survey: {
    name: 'Pesquisas',
    color: '#8b5cf6',
    thresholds: { 
      wide: 6, 
      veryWide: 8 
    },
    defaultFields: ['nome', 'telefone', 'loja', 'resposta'],
    styles: {
      normal: { fontSize: '12px', cellPadding: '8px', headerFontSize: '13px' },
      wide: { fontSize: '11px', cellPadding: '6px', headerFontSize: '12px' },
      veryWide: { fontSize: '10px', cellPadding: '4px', headerFontSize: '11px' }
    }
  }
}

// Estilos padrão (fallback)
const DEFAULT_STYLES: Record<string, ResponsiveStyles> = {
  normal: {
    fontSize: '12px',
    cellPadding: '8px',
    headerFontSize: '13px',
    maxCellWidth: '200px',
    pageMargin: '15mm'
  },
  wide: {
    fontSize: '11px',
    cellPadding: '6px',
    headerFontSize: '12px',
    maxCellWidth: '150px',
    pageMargin: '15mm'
  },
  veryWide: {
    fontSize: '10px',
    cellPadding: '4px',
    headerFontSize: '11px',
    maxCellWidth: '120px',
    pageMargin: '10mm'
  }
}

/**
 * Detecta o tipo de layout baseado no número de colunas e tipo de relatório
 */
export function detectLayout(selectedFields: string[], reportType: string): LayoutDetection {
  const columnCount = selectedFields.length
  const config = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.birthday // Fallback
  
  return {
    columnCount,
    isWideTable: columnCount > config.thresholds.wide,
    isVeryWideTable: columnCount > config.thresholds.veryWide,
    reportType
  }
}

/**
 * Calcula estilos responsivos baseado na detecção de layout
 */
export function calculateResponsiveStyles(layout: LayoutDetection): ResponsiveStyles {
  const config = REPORT_CONFIGS[layout.reportType] || REPORT_CONFIGS.birthday
  
  let styleKey: string
  if (layout.isVeryWideTable) {
    styleKey = 'veryWide'
  } else if (layout.isWideTable) {
    styleKey = 'wide'
  } else {
    styleKey = 'normal'
  }
  
  // Mesclar estilos customizados com padrões
  const defaultStyle = DEFAULT_STYLES[styleKey]
  const customStyle = config.styles?.[styleKey as keyof typeof config.styles] || {}
  
  return {
    ...defaultStyle,
    ...customStyle
  }
}

/**
 * Obtém configuração de um tipo de relatório
 */
export function getReportConfig(reportType: string): ReportTypeConfig {
  return REPORT_CONFIGS[reportType] || REPORT_CONFIGS.birthday
}

/**
 * Registra um novo tipo de relatório
 */
export function registerReportType(reportType: string, config: ReportTypeConfig): void {
  REPORT_CONFIGS[reportType] = config
}

/**
 * Atualiza thresholds de um tipo de relatório existente
 */
export function updateThresholds(reportType: string, thresholds: { wide: number; veryWide: number }): void {
  if (REPORT_CONFIGS[reportType]) {
    REPORT_CONFIGS[reportType].thresholds = thresholds
  }
}

/**
 * Atualiza estilos de um tipo de relatório existente
 */
export function updateStyles(reportType: string, styles: Partial<ReportTypeConfig['styles']>): void {
  if (REPORT_CONFIGS[reportType]) {
    REPORT_CONFIGS[reportType].styles = {
      ...REPORT_CONFIGS[reportType].styles,
      ...styles
    }
  }
}

/**
 * Gera configuração do Puppeteer baseada no layout
 */
export function generatePuppeteerConfig(layout: LayoutDetection, styles: ResponsiveStyles) {
  return {
    format: 'A4' as const,
    landscape: layout.isWideTable,
    margin: {
      top: styles.pageMargin,
      right: styles.pageMargin,
      bottom: styles.pageMargin,
      left: styles.pageMargin
    },
    printBackground: true,
    preferCSSPageSize: true
  }
}

/**
 * Gera CSS responsivo baseado no layout e estilos
 */
export function generateResponsiveCSS(layout: LayoutDetection, styles: ResponsiveStyles): string {
  const config = getReportConfig(layout.reportType)
  
  return `
    @page {
      size: A4 ${layout.isWideTable ? 'landscape' : 'portrait'};
      margin: ${styles.pageMargin};
    }
    
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: ${layout.isVeryWideTable ? '10px' : '15px'};
      color: #333;
      font-size: ${styles.fontSize};
    }
    
    .header {
      text-align: center;
      margin-bottom: ${layout.isVeryWideTable ? '15px' : '25px'};
      border-bottom: 2px solid ${config.color};
      padding-bottom: ${layout.isVeryWideTable ? '10px' : '15px'};
    }
    
    .header h1 {
      color: ${config.color};
      margin: 0;
      font-size: ${layout.isVeryWideTable ? '18px' : '22px'};
    }
    
    .table-container {
      width: 100%;
      overflow-x: auto;
      margin-top: 10px;
    }
    
    table {
      width: ${layout.isWideTable ? 'max-content' : '100%'};
      min-width: 100%;
      border-collapse: collapse;
      font-size: ${styles.fontSize};
    }
    
    th, td {
      border: 1px solid #ddd;
      text-align: left;
      vertical-align: top;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: bold;
      padding: ${styles.cellPadding};
      font-size: ${styles.headerFontSize};
      white-space: nowrap;
    }
    
    td {
      padding: ${styles.cellPadding};
      font-size: ${styles.fontSize};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: ${styles.maxCellWidth};
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  `
}

/**
 * Gera feedback visual sobre otimizações aplicadas
 */
export function generateOptimizationFeedback(layout: LayoutDetection): string {
  if (!layout.isWideTable) {
    return ''
  }
  
  return `
    <div style="margin-top: 10px; font-size: 10px; color: #666; text-align: center;">
      <em>Tabela com ${layout.columnCount} colunas - Formato ${layout.isWideTable ? 'paisagem' : 'retrato'} otimizado</em>
    </div>
  `
}

/**
 * Valida configuração de tipo de relatório
 */
export function validateReportConfig(config: ReportTypeConfig): boolean {
  return !!(
    config.name &&
    config.color &&
    config.thresholds &&
    typeof config.thresholds.wide === 'number' &&
    typeof config.thresholds.veryWide === 'number' &&
    config.thresholds.wide < config.thresholds.veryWide &&
    Array.isArray(config.defaultFields)
  )
}

/**
 * Lista todos os tipos de relatório registrados
 */
export function getRegisteredReportTypes(): string[] {
  return Object.keys(REPORT_CONFIGS)
}

/**
 * Obtém estatísticas de uso dos layouts
 */
export function getLayoutStats(reportType: string, fieldCounts: number[]): {
  normal: number
  wide: number
  veryWide: number
} {
  const config = getReportConfig(reportType)
  
  return fieldCounts.reduce(
    (stats, count) => {
      if (count > config.thresholds.veryWide) {
        stats.veryWide++
      } else if (count > config.thresholds.wide) {
        stats.wide++
      } else {
        stats.normal++
      }
      return stats
    },
    { normal: 0, wide: 0, veryWide: 0 }
  )
}