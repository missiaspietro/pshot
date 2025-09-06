import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Função para gerar HTML do relatório de promoções
function generatePromotionsReportHTML(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }) {
  const today = new Date().toLocaleDateString('pt-BR')
  
  // Detectar se há muitas colunas para ajustar o layout
  const columnCount = selectedFields.length
  const isWideTable = columnCount > 4  // Mais agressivo: > 4 colunas = paisagem
  const isVeryWideTable = columnCount > 6  // Mais agressivo: > 6 colunas = muito otimizado
  
  // Ajustar tamanho da fonte e padding baseado no número de colunas
  const fontSize = isVeryWideTable ? '8px' : isWideTable ? '9px' : '12px'  // Fontes menores
  const cellPadding = isVeryWideTable ? '2px' : isWideTable ? '3px' : '8px'  // Padding menor
  const headerFontSize = isVeryWideTable ? '9px' : isWideTable ? '10px' : '13px'  // Cabeçalho menor
  
  const tableHeaders = selectedFields.map(fieldId => 
    `<th style="border: 1px solid #ddd; padding: ${cellPadding}; background-color: #f5f5f5; text-align: left; font-size: ${headerFontSize}; font-weight: bold; white-space: nowrap;">${fieldLabels[fieldId] || fieldId}</th>`
  ).join('')
  
  const tableRows = data.map((row, rowIndex) => {
    const cells = selectedFields.map(fieldId => {
      let value = row[fieldId]
      
      // Log para debug dos valores originais
      if (fieldId === 'Cliente' && rowIndex < 3) {
        console.log(`🔍 HTML - Cliente ${rowIndex + 1}: "${value}" (tipo: ${typeof value})`)
      }
      
      // Formatação específica por campo
      if (fieldId === 'Data_Envio' && value) {
        // Formatar datas apenas se estiverem em formato ISO ou YYYY-MM-DD
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          try {
            value = new Date(value).toLocaleDateString('pt-BR')
          } catch {
            // Se falhar, manter valor original
          }
        }
      }
      
      // PRESERVAR EXATAMENTE O VALOR ORIGINAL - não fazer nenhuma transformação adicional
      const displayValue = value === null || value === undefined ? '-' : String(value)
      
      // Escapar apenas caracteres HTML perigosos, mantendo acentos e caracteres especiais
      const escapedValue = displayValue
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      
      return `<td style="border: 1px solid #ddd; padding: ${cellPadding}; font-size: ${fontSize}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: ${isVeryWideTable ? '80px' : isWideTable ? '100px' : '200px'};">${escapedValue}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Promoções</title>
      <style>
        @page {
          size: ${isWideTable ? 'A4 landscape' : 'A4 portrait'};
          margin: ${isVeryWideTable ? '5mm' : isWideTable ? '8mm' : '15mm'};
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: ${isVeryWideTable ? '5px' : isWideTable ? '8px' : '15px'};
          color: #333;
          font-size: ${fontSize};
        }
        
        .header {
          text-align: center;
          margin-bottom: ${isVeryWideTable ? '15px' : '25px'};
          border-bottom: 2px solid #f59e0b;
          padding-bottom: ${isVeryWideTable ? '10px' : '15px'};
        }
        
        .header h1 {
          color: #f59e0b;
          margin: 0;
          font-size: ${isVeryWideTable ? '18px' : '22px'};
        }
        
        .header p {
          margin: 3px 0;
          color: #666;
          font-size: ${isVeryWideTable ? '11px' : '13px'};
        }
        
        .info {
          margin-bottom: ${isVeryWideTable ? '10px' : '15px'};
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .info div {
          font-size: ${isVeryWideTable ? '10px' : '12px'};
          color: #666;
          margin: 2px 0;
        }
        
        .table-container {
          width: 100%;
          overflow-x: auto;
          margin-top: 10px;
        }
        
        table {
          width: ${isWideTable ? 'max-content' : '100%'};
          min-width: 100%;
          border-collapse: collapse;
          font-size: ${fontSize};
        }
        
        th, td {
          border: 1px solid #ddd;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Promoções</h1>
        <p>Relatório automático de campanhas promocionais e descontos</p>
      </div>
      
      <div class="info">
        <div>
          <strong>Total de registros:</strong> ${data.length}
        </div>
        <div>
          <strong>Data de geração:</strong> ${today}
        </div>
      </div>

      ${data.length > 0 ? `
        <div class="table-container">
          <table>
            <thead>
              <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        ${isWideTable ? `
          <div style="margin-top: 10px; font-size: 10px; color: #666; text-align: center;">
            <em>Tabela com ${columnCount} colunas - Formato ${isWideTable ? 'paisagem' : 'retrato'} otimizado</em>
          </div>
        ` : ''}
      ` : `
        <div class="no-data">
          <p>Nenhum registro encontrado para os filtros selecionados.</p>
        </div>
      `}

      <div class="footer">
        <p>Relatório gerado em ${today} - Sistema Praise Shot</p>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { selectedFields, startDate, endDate, data } = body

    console.log('🔄 API PDF de promoções - Dados recebidos:', {
      selectedFieldsCount: selectedFields?.length || 0,
      dataCount: data?.length || 0,
      startDate,
      endDate
    })

    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      return NextResponse.json(
        { error: 'Campos selecionados são obrigatórios' },
        { status: 400 }
      )
    }

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Dados são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('📊 Usando dados do modal:', data.length, 'registros')
    
    // Log dos primeiros registros para verificar integridade dos dados
    if (data.length > 0) {
      console.log('🔍 Verificando integridade dos dados do modal:')
      data.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. Cliente: "${item.Cliente}"`)
        console.log(`      Tipo: ${typeof item.Cliente}, Tamanho: ${item.Cliente?.length || 0}`)
      })
    }

    // Mapear labels dos campos para promoções
    const fieldLabels: { [key: string]: string } = {
      'Cliente': 'Cliente',
      'Whatsapp': 'WhatsApp',
      'Loja': 'Loja',
      'Sub_rede': 'Sub Rede',
      'Data_Envio': 'Data de Envio',
      'Obs': 'Status'
    }

    // Log antes de gerar HTML
    console.log('📝 Gerando HTML do relatório de promoções...')
    if (data && data.length > 0) {
      console.log('🔍 Dados antes da geração HTML:')
      data.slice(0, 2).forEach((item, index) => {
        console.log(`   ${index + 1}. Cliente: "${item.Cliente}" | Loja: "${item.Loja}"`)
      })
    }

    // Gerar HTML do relatório
    const htmlContent = generatePromotionsReportHTML(data || [], selectedFields, fieldLabels)
    
    console.log('✅ HTML gerado com sucesso, tamanho:', htmlContent.length, 'caracteres')

    // Usar Puppeteer para gerar PDF (se disponível) ou retornar HTML
    try {
      // Tentar usar puppeteer se estiver disponível
      const puppeteer = require('puppeteer')
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      
      const page = await browser.newPage()
      
      // Configurar UTF-8 para caracteres acentuados
      await page.setExtraHTTPHeaders({
        'Accept-Charset': 'utf-8'
      })
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      
      // Detectar se há muitas colunas para ajustar formato
      const columnCount = selectedFields.length
      const isWideTable = columnCount > 4  // Mesmo threshold da geração HTML
      const isVeryWideTable = columnCount > 6  // Mesmo threshold da geração HTML
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: isWideTable,
        margin: {
          top: isVeryWideTable ? '5mm' : isWideTable ? '8mm' : '15mm',
          right: isVeryWideTable ? '5mm' : isWideTable ? '8mm' : '15mm',
          bottom: isVeryWideTable ? '5mm' : isWideTable ? '8mm' : '15mm',
          left: isVeryWideTable ? '5mm' : isWideTable ? '8mm' : '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
      })
      
      await browser.close()

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf; charset=utf-8',
          'Content-Disposition': `attachment; filename="relatorio-promocoes-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
      
    } catch (puppeteerError) {
      console.log('Puppeteer não disponível, retornando HTML para conversão no cliente:', puppeteerError)
      
      // Se Puppeteer não estiver disponível, retornar HTML que será convertido no cliente
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="relatorio-promocoes-${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    }

  } catch (error) {
    console.error('Erro interno do servidor:', error)
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    )
  }
}