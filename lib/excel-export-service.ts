import * as XLSX from 'xlsx'
import { CashbackData } from './cashback-service'

export interface ExcelExportService {
  exportCashbackToExcel(data: CashbackData[], lojas: string[], currentPeriod: number): void
  exportGraphDataToExcel(graphData: any[], currentPeriod: number): void
  exportPromocoesNaoEnviadasToExcel(graphData: any[], title: string): void
  exportPromocoesSemanaisToExcel(graphData: any[], lojas: string[], title: string): void
  exportPromocoesAnuaisToExcel(graphData: any[], lojas: string[], title: string): void
  exportPesquisasEnviadasToExcel(graphData: any[], lojas: string[], title: string): void
  exportCashbackDetalhadoToExcel(graphData: any[], lojas: string[], title: string): void
  exportAniversariosGeraisToExcel(graphData: any[], title: string): void
  exportAniversariosDetalhadoToExcel(graphData: any[], lojas: string[], title: string): void
  exportRespostasPesquisasToExcel(graphData: any[], title: string): void
  exportCustomBirthdayReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void
  exportCustomCashbackReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void
  exportCustomSurveyReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void
  exportCustomPromotionsReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void
}

export interface ExcelRowData {
  mes: string
  [loja: string]: string | number
}

export enum ExportErrorType {
  EMPTY_DATA = 'EMPTY_DATA',
  NO_STORES = 'NO_STORES',
  GENERATION_ERROR = 'GENERATION_ERROR',
  DOWNLOAD_ERROR = 'DOWNLOAD_ERROR'
}

export class ExcelExportError extends Error {
  constructor(
    message: string,
    public type: ExportErrorType,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ExcelExportError'
  }
}

class ExcelExportServiceImpl implements ExcelExportService {
  /**
   * Transforma dados do gráfico de cashback para formato Excel
   */
  private transformGraphDataForExcel(graphData: any[], currentPeriod: number): ExcelRowData[] {
    const periodText = currentPeriod === 1 ? 'último mês' : `últimos ${currentPeriod} meses`
    
    return graphData.map(item => ({
      mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
      'Loja': item.loja,
      'Quantidade de Cashbacks': item.quantidade,
      'Período': `Dados do ${periodText}`
    }))
  }

  /**
   * Transforma dados de promoções não enviadas para formato Excel
   */
  private transformPromocoesNaoEnviadasForExcel(graphData: any[]): ExcelRowData[] {
    return graphData.map(item => ({
      mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
      'Loja': item.loja,
      'Bot Desconectado': item.botDesconectado || 0,
      'Número Inválido': item.numeroInvalido || 0,
      'Total de Falhas': (item.botDesconectado || 0) + (item.numeroInvalido || 0)
    }))
  }

  /**
   * Transforma dados de promoções semanais para formato Excel
   */
  private transformPromocoesSemanaisForExcel(graphData: any[], lojas: string[]): ExcelRowData[] {
    if (!graphData || graphData.length === 0) {
      return [{
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Data': 'Sem dados',
        'Informação': 'Não há dados disponíveis no gráfico para o período selecionado'
      }]
    }

    return graphData.map(item => {
      const row: ExcelRowData = { 
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Data': item.dataEnvio 
      }
      
      // Adiciona dados de cada loja
      lojas.forEach(loja => {
        row[`Loja ${loja}`] = item[loja] || 0
      })
      
      return row
    })
  }

  /**
   * Transforma dados de promoções anuais para formato Excel
   */
  private transformPromocoesAnuaisForExcel(graphData: any[], lojas: string[]): ExcelRowData[] {
    if (!graphData || graphData.length === 0) {
      return [{
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': 'Sem dados',
        'Informação': 'Não há dados disponíveis no gráfico para o período selecionado'
      }]
    }

    return graphData.map(item => {
      const row: ExcelRowData = { 
        mes: item.mes || new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': item.mes 
      }
      
      // Adiciona dados de cada loja
      lojas.forEach(loja => {
        row[`Loja ${loja}`] = item[loja] || 0
      })
      
      return row
    })
  }

  /**
   * Transforma dados de pesquisas enviadas para formato Excel
   */
  private transformPesquisasEnviadasForExcel(graphData: any[], lojas: string[]): ExcelRowData[] {
    if (!graphData || graphData.length === 0) {
      return [{
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': 'Sem dados',
        'Informação': 'Não há dados disponíveis no gráfico para o período selecionado'
      }]
    }

    return graphData.map(item => {
      const row: ExcelRowData = { 
        mes: item.mes || new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': item.mes 
      }
      
      // Adiciona dados de cada loja
      lojas.forEach(loja => {
        row[`Loja ${loja}`] = item[loja] || 0
      })
      
      return row
    })
  }

  /**
   * Transforma dados de cashback detalhado para formato Excel
   */
  private transformCashbackDetalhadoForExcel(graphData: any[], lojas: string[]): ExcelRowData[] {
    if (!graphData || graphData.length === 0) {
      return [{
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': 'Sem dados',
        'Informação': 'Não há dados disponíveis no gráfico para o período selecionado'
      }]
    }

    return graphData.map(item => {
      const row: ExcelRowData = { 
        mes: item.mes || new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': item.mes 
      }
      
      // Adiciona dados de cada loja (usando a chave loja{numero})
      lojas.forEach(loja => {
        const lojaKey = `loja${loja}`
        row[`Loja ${loja}`] = item[lojaKey] || 0
      })
      
      return row
    })
  }

  /**
   * Transforma dados de aniversários gerais para formato Excel
   */
  private transformAniversariosGeraisForExcel(graphData: any[]): ExcelRowData[] {
    if (!graphData || graphData.length === 0) {
      return [{
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Loja': 'Sem dados',
        'Informação': 'Não há dados disponíveis no gráfico para o período selecionado'
      }]
    }

    return graphData.map(item => ({
      mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
      'Loja': item.name,
      'Quantidade de Aniversários': item.valor
    }))
  }

  /**
   * Transforma dados de aniversários detalhados para formato Excel
   */
  private transformAniversariosDetalhadoForExcel(graphData: any[], lojas: string[]): ExcelRowData[] {
    if (!graphData || graphData.length === 0) {
      return [{
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': 'Sem dados',
        'Informação': 'Não há dados disponíveis no gráfico para o período selecionado'
      }]
    }

    return graphData.map(item => {
      const row: ExcelRowData = { 
        mes: item.mes || new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Mês': item.mes 
      }
      
      // Adiciona dados de cada loja
      lojas.forEach(loja => {
        row[`Loja ${loja}`] = item[loja] || 0
      })
      
      return row
    })
  }

  /**
   * Transforma dados de respostas pesquisas para formato Excel
   */
  private transformRespostasPesquisasForExcel(graphData: any[]): ExcelRowData[] {
    if (!graphData || graphData.length === 0) {
      return [{
        mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
        'Loja': 'Sem dados',
        'Informação': 'Não há dados disponíveis no gráfico para o período selecionado'
      }]
    }

    return graphData.map(item => ({
      mes: new Date().toISOString().slice(0, 7), // YYYY-MM format
      'Loja': item.loja,
      'Ótimo': item.Ótimo || 0,
      'Bom': item.Bom || 0,
      'Regular': item.Regular || 0,
      'Péssimo': item.Péssimo || 0,
      'Total': (item.Ótimo || 0) + (item.Bom || 0) + (item.Regular || 0) + (item.Péssimo || 0)
    }))
  }

  /**
   * Transforma dados do cashback para formato Excel (método original mantido para compatibilidade)
   */
  private transformDataForExcel(data: CashbackData[], lojas: string[]): ExcelRowData[] {
    return data.map(item => {
      const row: ExcelRowData = { mes: item.mes }
      
      // Adiciona dados de cada loja
      lojas.forEach(loja => {
        const lojaKey = `loja${loja}`
        row[`Loja ${loja}`] = item[lojaKey] || 0
      })
      
      return row
    })
  }

  /**
   * Gera nome do arquivo com data atual e período
   */
  private generateFileName(currentPeriod: number): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    const periodText = currentPeriod === 1 ? '1-mes' : `${currentPeriod}-meses`
    return `cashback-${periodText}-${year}-${month}-${day}.xlsx`
  }

  /**
   * Cria e baixa arquivo Excel
   */
  private downloadExcelFile(worksheet: XLSX.WorkSheet, fileName: string, currentPeriod: number): void {
    // Cria workbook
    const workbook = XLSX.utils.book_new()
    
    // Nome da aba com informação do período
    const sheetName = `Dados do ${currentPeriod === 1 ? 'último mês' : `últimos ${currentPeriod} meses`}`
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    
    // Gera buffer do arquivo
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    })
    
    // Cria blob e faz download
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Exporta dados de cashback para Excel
   */
  exportCashbackToExcel(data: CashbackData[], lojas: string[], currentPeriod: number): void {
    try {
      // Valida se há dados para exportar
      if (!data || data.length === 0) {
        throw new ExcelExportError(
          'Não há dados de cashback para exportar',
          ExportErrorType.EMPTY_DATA
        )
      }

      if (!lojas || lojas.length === 0) {
        throw new ExcelExportError(
          'Não há lojas disponíveis para exportar',
          ExportErrorType.NO_STORES
        )
      }

      // Transforma dados para formato Excel
      const excelData = this.transformDataForExcel(data, lojas)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = [
        { wch: 20 }, // Coluna Mês
        ...lojas.map(() => ({ wch: 12 })) // Colunas das lojas
      ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo e faz download
      const fileName = this.generateFileName(currentPeriod)
      try {
        this.downloadExcelFile(worksheet, fileName, currentPeriod)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao fazer download do arquivo',
          ExportErrorType.DOWNLOAD_ERROR,
          error as Error
        )
      }
      
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados do gráfico de cashback para Excel
   */
  exportGraphDataToExcel(graphData: any[], currentPeriod: number): void {
    try {
      // Valida se há dados para exportar
      if (!graphData || graphData.length === 0) {
        throw new ExcelExportError(
          'Não há dados de cashback para exportar',
          ExportErrorType.EMPTY_DATA
        )
      }

      // Transforma dados do gráfico para formato Excel
      const excelData = this.transformGraphDataForExcel(graphData, currentPeriod)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = [
        { wch: 15 }, // Coluna Loja
        { wch: 25 }, // Coluna Quantidade
        { wch: 30 }  // Coluna Período
      ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo e faz download
      const fileName = this.generateFileName(currentPeriod)
      try {
        this.downloadExcelFile(worksheet, fileName, currentPeriod)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao fazer download do arquivo',
          ExportErrorType.DOWNLOAD_ERROR,
          error as Error
        )
      }
      
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de promoções não enviadas para Excel
   */
  exportPromocoesNaoEnviadasToExcel(graphData: any[], title: string): void {
    try {
      // Valida se há dados para exportar
      if (!graphData || graphData.length === 0) {
        throw new ExcelExportError(
          'Não há dados de promoções não enviadas para exportar',
          ExportErrorType.EMPTY_DATA
        )
      }

      // Transforma dados para formato Excel
      const excelData = this.transformPromocoesNaoEnviadasForExcel(graphData)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = [
        { wch: 15 }, // Coluna Loja
        { wch: 18 }, // Coluna Bot Desconectado
        { wch: 18 }, // Coluna Número Inválido
        { wch: 15 }  // Coluna Total de Falhas
      ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `promocoes-nao-enviadas-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Promoções não Enviadas')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar promoções não enviadas para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de promoções semanais para Excel
   */
  exportPromocoesSemanaisToExcel(graphData: any[], lojas: string[], title: string): void {
    try {
      // Transforma dados para formato Excel (mesmo se vazio)
      const excelData = this.transformPromocoesSemanaisForExcel(graphData, lojas)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = graphData.length === 0 
        ? [{ wch: 15 }, { wch: 50 }] // Para dados vazios
        : [
            { wch: 15 }, // Coluna Data
            ...lojas.map(() => ({ wch: 12 })) // Colunas das lojas
          ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `promocoes-semanais-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Promoções Última Semana')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar promoções semanais para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de promoções anuais para Excel
   */
  exportPromocoesAnuaisToExcel(graphData: any[], lojas: string[], title: string): void {
    try {
      // Transforma dados para formato Excel (mesmo se vazio)
      const excelData = this.transformPromocoesAnuaisForExcel(graphData, lojas)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = graphData.length === 0 
        ? [{ wch: 15 }, { wch: 50 }] // Para dados vazios
        : [
            { wch: 20 }, // Coluna Mês
            ...lojas.map(() => ({ wch: 12 })) // Colunas das lojas
          ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `promocoes-6-meses-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Promoções Últimos 6 Meses')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar promoções anuais para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de pesquisas enviadas para Excel
   */
  exportPesquisasEnviadasToExcel(graphData: any[], lojas: string[], title: string): void {
    try {
      // Transforma dados para formato Excel (mesmo se vazio)
      const excelData = this.transformPesquisasEnviadasForExcel(graphData, lojas)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = graphData.length === 0 
        ? [{ wch: 15 }, { wch: 50 }] // Para dados vazios
        : [
            { wch: 20 }, // Coluna Mês
            ...lojas.map(() => ({ wch: 12 })) // Colunas das lojas
          ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `pesquisas-enviadas-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pesquisas Enviadas')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar pesquisas enviadas para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de cashback detalhado para Excel
   */
  exportCashbackDetalhadoToExcel(graphData: any[], lojas: string[], title: string): void {
    try {
      // Transforma dados para formato Excel (mesmo se vazio)
      const excelData = this.transformCashbackDetalhadoForExcel(graphData, lojas)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = graphData.length === 0 
        ? [{ wch: 15 }, { wch: 50 }] // Para dados vazios
        : [
            { wch: 20 }, // Coluna Mês
            ...lojas.map(() => ({ wch: 12 })) // Colunas das lojas
          ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `cashback-detalhado-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cashback Detalhado')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar cashback detalhado para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de aniversários gerais para Excel
   */
  exportAniversariosGeraisToExcel(graphData: any[], title: string): void {
    try {
      // Transforma dados para formato Excel (mesmo se vazio)
      const excelData = this.transformAniversariosGeraisForExcel(graphData)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = graphData.length === 0 
        ? [{ wch: 15 }, { wch: 50 }] // Para dados vazios
        : [
            { wch: 20 }, // Coluna Loja
            { wch: 25 }  // Coluna Quantidade
          ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `aniversarios-gerais-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Aniversários Gerais')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar aniversários gerais para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de aniversários detalhados para Excel
   */
  exportAniversariosDetalhadoToExcel(graphData: any[], lojas: string[], title: string): void {
    try {
      // Transforma dados para formato Excel (mesmo se vazio)
      const excelData = this.transformAniversariosDetalhadoForExcel(graphData, lojas)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = graphData.length === 0 
        ? [{ wch: 15 }, { wch: 50 }] // Para dados vazios
        : [
            { wch: 20 }, // Coluna Mês
            ...lojas.map(() => ({ wch: 12 })) // Colunas das lojas
          ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `aniversarios-detalhado-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Aniversários Detalhado')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar aniversários detalhados para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de respostas pesquisas para Excel
   */
  exportRespostasPesquisasToExcel(graphData: any[], title: string): void {
    try {
      // Transforma dados para formato Excel (mesmo se vazio)
      const excelData = this.transformRespostasPesquisasForExcel(graphData)
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = graphData.length === 0 
        ? [{ wch: 15 }, { wch: 50 }] // Para dados vazios
        : [
            { wch: 15 }, // Coluna Loja
            { wch: 12 }, // Coluna Ótimo
            { wch: 12 }, // Coluna Bom
            { wch: 12 }, // Coluna Regular
            { wch: 12 }, // Coluna Péssimo
            { wch: 12 }  // Coluna Total
          ]
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `respostas-pesquisas-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Respostas Pesquisas')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar respostas pesquisas para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de relatório customizado de aniversários para Excel
   */
  exportCustomBirthdayReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void {
    try {
      // Valida se há dados para exportar
      if (!data || data.length === 0) {
        throw new ExcelExportError(
          'Não há dados para exportar',
          ExportErrorType.EMPTY_DATA
        )
      }

      // Mapeamento de campos da interface para colunas do banco (mesmo da API)
      const mapFieldToColumn = (field: string): string => {
        const fieldMapping: Record<string, string> = {
          'status': 'obs',              // Mapear status para obs (observações)
          'criado_em': 'criado_em',     // Data de criação
          'cliente': 'cliente',         // Nome do cliente
          'whatsApp': 'whatsApp',       // Número do WhatsApp
          'rede': 'rede',              // Rede da empresa
          'loja': 'loja',              // Loja
          'Sub_Rede': 'Sub_Rede'       // Sub-rede
        }
        return fieldMapping[field] || field
      }

      // Debug: Log dos dados recebidos
      console.log('🔍 DEBUG Excel Export - Dados recebidos:', data?.length || 0, 'registros')
      if (data && data.length > 0) {
        console.log('🔍 Primeiro registro:', data[0])
        console.log('🔍 Chaves disponíveis:', Object.keys(data[0]))
      }
      console.log('🔍 Campos selecionados:', selectedFields)

      // Transforma dados para formato Excel
      const excelData = data.map((row, rowIndex) => {
        const excelRow: { [key: string]: any } = {}
        selectedFields.forEach(field => {
          const label = fieldLabels[field] || field
          const columnName = mapFieldToColumn(field) // Mapear para nome da coluna do banco
          let value = row[columnName] // Usar nome da coluna mapeada
          
          // Debug específico para o campo status
          if (field === 'status') {
            console.log(`🔍 DEBUG Status - Registro ${rowIndex + 1}:`)
            console.log(`   Campo: "${field}"`)
            console.log(`   Coluna mapeada: "${columnName}"`)
            console.log(`   Valor encontrado: "${value}"`)
            console.log(`   Tipo do valor: ${typeof value}`)
            console.log(`   Chaves do registro:`, Object.keys(row))
            console.log(`   Valor específico de obs:`, row['obs'])
          }
          
          // Formatar data se for campo de data
          if (field === 'criado_em' && value) {
            value = new Date(value).toLocaleDateString('pt-BR')
          }
          
          excelRow[label] = value || '-'
        })
        return excelRow
      })
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = selectedFields.map(() => ({ wch: 20 }))
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `relatorio-aniversarios-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Aniversários')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar relatório customizado para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de relatório customizado de cashback para Excel
   */
  exportCustomCashbackReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void {
    try {
      // Valida se há dados para exportar
      if (!data || data.length === 0) {
        throw new ExcelExportError(
          'Não há dados para exportar',
          ExportErrorType.EMPTY_DATA
        )
      }

      // Transforma dados para formato Excel
      const excelData = data.map(row => {
        const excelRow: { [key: string]: any } = {}
        selectedFields.forEach(field => {
          const label = fieldLabels[field] || field
          let value = row[field]
          
          // Formatar data se for campo de data
          if (field === 'Envio_novo' && value) {
            value = new Date(value).toLocaleDateString('pt-BR')
          }
          
          excelRow[label] = value || '-'
        })
        return excelRow
      })
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas
      const colWidths = selectedFields.map(() => ({ wch: 20 }))
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `relatorio-cashback-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Cashback')
      
      // Gera buffer do arquivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      })
      
      // Cria blob e faz download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      
      // Adiciona ao DOM temporariamente e clica
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao exportar relatório customizado de cashback para Excel:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de relatório customizado de pesquisas para Excel
   */
  exportCustomSurveyReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void {
    try {
      // Valida se há dados para exportar
      if (!data || data.length === 0) {
        throw new ExcelExportError(
          'Não há dados para exportar',
          ExportErrorType.EMPTY_DATA
        )
      }

      // Debug: Log dos dados recebidos
      console.log('🔍 DEBUG Excel Export Pesquisas - Dados recebidos:', data?.length || 0, 'registros')
      if (data && data.length > 0) {
        console.log('🔍 Primeiro registro:', data[0])
        console.log('🔍 Chaves disponíveis:', Object.keys(data[0]))
      }
      console.log('🔍 Campos selecionados:', selectedFields)

      // Função para converter valores de resposta
      const formatResponseValue = (value: any): string => {
        if (value === null || value === undefined || value === '') {
          return '-'
        }
        
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

      // Transforma dados para formato Excel
      const excelData = data.map((row, rowIndex) => {
        const excelRow: { [key: string]: any } = {}
        selectedFields.forEach(field => {
          const label = fieldLabels[field] || field
          let value = row[field] // Usar nome do campo diretamente
          
          // Formatação específica por campo
          if (field === 'resposta') {
            value = formatResponseValue(value)
          } else if (field === 'criado_em' && value) {
            // Formatar data se for campo de data
            try {
              value = new Date(value).toLocaleDateString('pt-BR')
            } catch {
              // Se não conseguir formatar como data, manter valor original
              value = String(value)
            }
          } else if (field === 'data_de_envio' && value) {
            // Formatar data de envio
            try {
              value = new Date(value).toLocaleDateString('pt-BR')
            } catch {
              value = String(value)
            }
          }
          
          excelRow[label] = value || '-'
        })
        return excelRow
      })
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas baseado nos campos selecionados
      const colWidths = selectedFields.map(field => {
        switch (field) {
          case 'nome':
            return { wch: 25 }
          case 'telefone':
            return { wch: 15 }
          case 'loja':
            return { wch: 15 }
          case 'rede':
            return { wch: 20 }
          case 'resposta':
            return { wch: 12 }
          case 'sub_rede':
            return { wch: 20 }
          case 'passo':
            return { wch: 10 }
          case 'pergunta':
            return { wch: 30 }
          case 'data_de_envio':
            return { wch: 15 }
          default:
            return { wch: 15 }
        }
      })
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `relatorio-pesquisas-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Pesquisas')
      
      // Gera buffer do arquivo
      let excelBuffer: ArrayBuffer
      try {
        excelBuffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'array',
          compression: true
        })
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao gerar arquivo Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Cria blob e faz download
      try {
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        console.log(`✅ Arquivo Excel de pesquisas exportado com sucesso: ${fileName}`)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao fazer download do arquivo',
          ExportErrorType.DOWNLOAD_ERROR,
          error as Error
        )
      }
      
    } catch (error) {
      console.error('❌ Erro na exportação Excel de pesquisas:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação de pesquisas',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }

  /**
   * Exporta dados de relatório customizado de promoções para Excel
   */
  exportCustomPromotionsReportToExcel(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }): void {
    try {
      // Valida se há dados para exportar
      if (!data || data.length === 0) {
        throw new ExcelExportError(
          'Não há dados para exportar',
          ExportErrorType.EMPTY_DATA
        )
      }

      // Debug: Log dos dados recebidos
      console.log('🔍 DEBUG Excel Export Promoções - Dados recebidos:', data?.length || 0, 'registros')
      if (data && data.length > 0) {
        console.log('🔍 Primeiro registro:', data[0])
        console.log('🔍 Chaves disponíveis:', Object.keys(data[0]))
      }
      console.log('🔍 Campos selecionados:', selectedFields)

      // Transforma dados para formato Excel
      const excelData = data.map((row, rowIndex) => {
        const excelRow: { [key: string]: any } = {}
        selectedFields.forEach(field => {
          const label = fieldLabels[field] || field
          let value = row[field] // Usar nome do campo diretamente
          
          // Formatação específica por campo
          if (field === 'Data_Envio' && value) {
            // Formatar data de envio
            try {
              // Se é uma data em formato ISO ou YYYY-MM-DD, formatar
              if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                value = new Date(value).toLocaleDateString('pt-BR')
              }
            } catch {
              // Se não conseguir formatar como data, manter valor original
              value = String(value)
            }
          }
          
          // PRESERVAR DADOS EXATAMENTE COMO ESTÃO NO BANCO
          // Não aplicar normalização de texto
          excelRow[label] = value === null || value === undefined ? '-' : String(value)
        })
        return excelRow
      })
      
      // Cria worksheet
      let worksheet: XLSX.WorkSheet
      try {
        worksheet = XLSX.utils.json_to_sheet(excelData)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao processar dados para Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Ajusta largura das colunas baseado nos campos selecionados
      const colWidths = selectedFields.map(field => {
        switch (field) {
          case 'Cliente':
            return { wch: 25 }
          case 'Whatsapp':
            return { wch: 15 }
          case 'Loja':
            return { wch: 15 }
          case 'Sub_rede':
            return { wch: 20 }
          case 'Data_Envio':
            return { wch: 15 }
          case 'Obs':
            return { wch: 20 }
          default:
            return { wch: 15 }
        }
      })
      worksheet['!cols'] = colWidths
      
      // Gera nome do arquivo
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const fileName = `relatorio-promocoes-${year}-${month}-${day}.xlsx`
      
      // Cria workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Promoções')
      
      // Gera buffer do arquivo
      let excelBuffer: ArrayBuffer
      try {
        excelBuffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'array',
          compression: true
        })
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao gerar arquivo Excel',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
      
      // Cria blob e faz download
      try {
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        console.log(`✅ Arquivo Excel de promoções exportado com sucesso: ${fileName}`)
      } catch (error) {
        throw new ExcelExportError(
          'Erro ao fazer download do arquivo',
          ExportErrorType.DOWNLOAD_ERROR,
          error as Error
        )
      }
      
    } catch (error) {
      console.error('❌ Erro na exportação Excel de promoções:', error)
      
      // Re-throw ExcelExportError, wrap outros erros
      if (error instanceof ExcelExportError) {
        throw error
      } else {
        throw new ExcelExportError(
          'Erro inesperado durante a exportação de promoções',
          ExportErrorType.GENERATION_ERROR,
          error as Error
        )
      }
    }
  }
}

// Instância singleton do serviço
export const excelExportService = new ExcelExportServiceImpl()