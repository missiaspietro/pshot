import { NextRequest, NextResponse } from 'next/server'

// Função para normalizar texto UTF-8 e remover cedilha problemática
function normalizeUTF8(text: string): string {
  if (!text || typeof text !== 'string') return text
  
  try {
    let normalized = text.normalize('NFC')
    
    // Substituir cedilha por c normal para evitar problemas de encoding
    normalized = normalized.replace(/ç/g, 'c').replace(/Ç/g, 'C')
    
    return normalized
  } catch (e) {
    console.warn('Erro ao normalizar UTF-8 para:', text, e)
    return text
  }
}

// Função para gerar HTML do relatório
function generateReportHTML(data: any[], selectedFields: string[], fieldLabels: { [key: string]: string }) {
  const today = new Date().toLocaleDateString('pt-BR')
  
  // Detectar se há muitas colunas para ajustar o layout
  const columnCount = selectedFields.length
  const isWideTable = columnCount > 6
  const isVeryWideTable = columnCount > 8
  
  // Ajustar tamanho da fonte e padding baseado no número de colunas
  const fontSize = isVeryWideTable ? '10px' : isWideTable ? '11px' : '12px'
  const cellPadding = isVeryWideTable ? '4px' : isWideTable ? '6px' : '8px'
  const headerFontSize = isVeryWideTable ? '11px' : isWideTable ? '12px' : '13px'
  
  const tableHeaders = selectedFields.map(fieldId => 
    `<th style="border: 1px solid #ddd; padding: ${cellPadding}; background-color: #f5f5f5; text-align: left; font-size: ${headerFontSize}; font-weight: bold; white-space: nowrap;">${fieldLabels[fieldId] || fieldId}</th>`
  ).join('')
  
  const tableRows = data.map((row, rowIndex) => {
    const cells = selectedFields.map(fieldId => {
      let value = row[fieldId]
      
      // Formatação específica por campo
      if (fieldId === 'data_de_envio' && value) {
        value = new Date(value).toLocaleDateString('pt-BR')
      }
      
      // Formatação para resposta
      if (fieldId === 'resposta') {
        const respostaMap: { [key: string]: string } = {
          '1': 'Ótimo',
          '2': 'Bom',
          '3': 'Regular',
          '4': 'Péssimo'
        }
        value = respostaMap[String(value)] || String(value)
      }
      
      // Formatação para telefone
      if (fieldId === 'telefone' && value && String(value).length > 10) {
        const phone = String(value).replace(/\D/g, '')
        if (phone.length === 11) {
          value = `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
        }
      }
      
      // PRESERVAR EXATAMENTE O VALOR ORIGINAL - não fazer nenhuma transformação adicional
      let displayValue = value === null || value === undefined ? '-' : String(value)
      
      // Normalizar caracteres UTF-8 para evitar problemas de encoding
      displayValue = normalizeUTF8(displayValue)
      
      // Escapar apenas caracteres HTML perigosos, preservando totalmente acentos e caracteres especiais
      const escapedValue = displayValue
        .replace(/&(?![a-zA-Z0-9#]{1,6};)/g, '&amp;') // Só escapar & que não são entidades
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      
      return `<td style="border: 1px solid #ddd; padding: ${cellPadding}; font-size: ${fontSize}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: ${isVeryWideTable ? '120px' : isWideTable ? '150px' : '200px'};">${escapedValue}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta http-equiv="Content-Language" content="pt-BR">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Pesquisas</title>
      <style>
        @page {
          size: ${isWideTable ? 'A4 landscape' : 'A4 portrait'};
          margin: ${isVeryWideTable ? '10mm' : '15mm'};
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: ${isVeryWideTable ? '10px' : '15px'};
          color: #333;
          font-size: ${fontSize};
        }
        
        .header {
          text-align: center;
          margin-bottom: ${isVeryWideTable ? '15px' : '25px'};
          border-bottom: 2px solid #8b5cf6;
          padding-bottom: ${isVeryWideTable ? '10px' : '15px'};
        }
        
        .header h1 {
          color: #8b5cf6;
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
        <h1>Relatório de Pesquisas de Satisfação</h1>
        <p>Relatório gerado automaticamente</p>
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
        <p>Relatório gerado em ${today} - Sistema de Relatórios</p>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { selectedFields, startDate, endDate, data } = body

    console.log('🔄 Iniciando geração de PDF de pesquisas')
    console.log('📊 Dados recebidos:', {
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

    // Mapear labels dos campos
    const fieldLabels: { [key: string]: string } = {
      'id': 'ID',
      'telefone': 'Telefone',
      'nome': 'Nome',
      'resposta': 'Resposta',
      'loja': 'Loja',
      'rede': 'Rede',
      'sub_rede': 'Sub Rede',
      'passo': 'Passo',
      'pergunta': 'Pergunta',
      'data_de_envio': 'Data de Envio',
      'data_text': 'Data (Texto)'
    }

    console.log('📝 Gerando HTML do relatório...')
    
    // Gerar HTML do relatório
    const htmlContent = generateReportHTML(data, selectedFields, fieldLabels)
    
    console.log('✅ HTML gerado com sucesso, tamanho:', htmlContent.length, 'caracteres')

    // Usar Puppeteer para gerar PDF (se disponível) ou retornar HTML
    try {
      // Tentar usar puppeteer se estiver disponível
      const puppeteer = require('puppeteer')
      
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      })
      
      const page = await browser.newPage()
      
      // Configurar UTF-8 para caracteres acentuados
      await page.setExtraHTTPHeaders({
        'Accept-Charset': 'utf-8'
      })
      
      // Definir encoding UTF-8 explicitamente
      await page.evaluateOnNewDocument(() => {
        (document as any).charset = 'UTF-8'
      })
      
      // Configurar viewport para melhor renderização
      await page.setViewport({ width: 1200, height: 800 })
      
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      })
      
      // Detectar se há muitas colunas para ajustar formato
      const columnCount = selectedFields.length
      const isWideTable = columnCount > 6
      const isVeryWideTable = columnCount > 8
      
      const pdfBuffer = await page.pdf({
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
      })
      
      await browser.close()

      console.log('✅ PDF gerado com Puppeteer com sucesso')

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="relatorio-pesquisas-${new Date().toISOString().split('T')[0]}.pdf"`,
          'Cache-Control': 'no-cache'
        }
      })
      
    } catch (puppeteerError) {
      console.log('⚠️ Puppeteer não disponível, retornando HTML para conversão no cliente:', puppeteerError)
      
      // Se Puppeteer não estiver disponível, retornar HTML que será convertido no cliente
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="relatorio-pesquisas-${new Date().toISOString().split('T')[0]}.html"`
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