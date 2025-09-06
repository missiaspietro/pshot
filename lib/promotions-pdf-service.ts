import puppeteer from 'puppeteer'
import { normalizeText } from './text-utils'

export interface PromotionsPdfOptions {
  selectedFields: string[]
  startDate?: string
  endDate?: string
  title?: string
}

export interface PromotionsData {
  Cliente?: string
  Enviado?: string
  Obs?: string
  Whatsapp?: string
  Rede?: string
  Sub_rede?: string
  Loja?: string
  Id: string
  Data_Envio?: string
}

export class PromotionsPdfService {
  /**
   * Gera PDF do relatório de promoções
   */
  async generatePdf(data: PromotionsData[], options: PromotionsPdfOptions): Promise<Buffer> {
    console.log('🔄 Iniciando geração de PDF de promoções...')
    console.log('📊 Dados recebidos:', data.length, 'registros')
    console.log('📋 Opções:', options)

    try {
      // Gerar HTML do relatório
      const html = this.generateHtmlTemplate(data, options)
      
      console.log('📄 Template HTML gerado')

      // Configurar Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      })

      console.log('🚀 Puppeteer iniciado')

      const page = await browser.newPage()
      
      // Configurar página para PDF
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      console.log('📄 Conteúdo HTML carregado na página')

      // Gerar PDF
      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      })

      console.log('✅ PDF de promoções gerado com sucesso')

      await browser.close()
      return Buffer.from(pdfUint8Array)

    } catch (error) {
      console.error('💥 Erro ao gerar PDF de promoções:', error)
      throw new Error(`Erro na geração do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }  /**
   
* Gera template HTML para o relatório de promoções
   */
  private generateHtmlTemplate(data: PromotionsData[], options: PromotionsPdfOptions): string {
    const { selectedFields, startDate, endDate, title = 'Relatório de Promoções' } = options
    
    // Mapear campos para labels amigáveis
    const fieldLabels: Record<string, string> = {
      'Cliente': 'Cliente',
      'Enviado': 'Status de Envio',
      'Obs': 'Observações',
      'Whatsapp': 'WhatsApp',
      'Rede': 'Rede',
      'Sub_rede': 'Sub Rede',
      'Loja': 'Loja',
      'Data_Envio': 'Data de Envio'
    }

    // Formatar período
    const formatDate = (dateString?: string) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('pt-BR')
      } catch {
        return dateString
      }
    }

    const periodo = startDate && endDate 
      ? `${formatDate(startDate)} até ${formatDate(endDate)}`
      : startDate 
        ? `A partir de ${formatDate(startDate)}`
        : endDate 
          ? `Até ${formatDate(endDate)}`
          : 'Todos os períodos'

    // Gerar cabeçalhos da tabela
    const headers = selectedFields
      .filter(field => field !== 'Id') // Não mostrar ID no relatório
      .map(field => fieldLabels[field] || field)
      .join('</th><th>')

    // Gerar linhas da tabela
    const rows = data.map(row => {
      const cells = selectedFields
        .filter(field => field !== 'Id') // Não mostrar ID no relatório
        .map(field => {
          const value = row[field as keyof PromotionsData]
          return this.formatCellValue(value)
        })
        .join('</td><td>')
      
      return `<tr><td>${cells}</td></tr>`
    }).join('')

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #333;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #d97706;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header .subtitle {
            color: #6b7280;
            margin: 5px 0 0 0;
            font-size: 14px;
        }
        .info-section {
            background-color: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 600;
            color: #92400e;
        }
        .info-value {
            color: #451a03;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th {
            background-color: #f59e0b;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            border: 1px solid #d97706;
        }
        td {
            padding: 10px 8px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
            vertical-align: top;
        }
        tr:nth-child(even) {
            background-color: #fffbeb;
        }
        tr:hover {
            background-color: #fef3c7;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #6b7280;
            font-style: italic;
        }
        @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 ${title}</h1>
        <div class="subtitle">Relatório automático de campanhas promocionais e descontos</div>
    </div>

    <div class="info-section">
        <div class="info-row">
            <span class="info-label">📅 Período:</span>
            <span class="info-value">${periodo}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📊 Total de registros:</span>
            <span class="info-value">${data.length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📋 Campos incluídos:</span>
            <span class="info-value">${selectedFields.filter(f => f !== 'Id').length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📄 Gerado em:</span>
            <span class="info-value">${new Date().toLocaleString('pt-BR')}</span>
        </div>
    </div>

    ${data.length > 0 ? `
    <table>
        <thead>
            <tr><th>${headers}</th></tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
    ` : `
    <div class="no-data">
        <p>📭 Nenhum dado encontrado para os filtros selecionados</p>
    </div>
    `}

    <div class="footer">
        <p>Relatório gerado automaticamente pelo sistema Praise Shot • ${new Date().toLocaleString('pt-BR')}</p>
    </div>
</body>
</html>`
  }

  /**
   * Formata valor da célula para exibição no PDF
   */
  private formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '-'
    }
    
    if (value === '') {
      return '-'
    }
    
    // Formatar datas
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR')
        }
      } catch {
        return normalizeText(String(value))
      }
    }
    
    // Normalizar texto para corrigir acentos
    return normalizeText(String(value))
  }
}

// Instância singleton do serviço
export const promotionsPdfService = new PromotionsPdfService()