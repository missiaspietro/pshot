import { supabase } from './supabase'

export interface CashbackPDFFilters {
  selectedFields: string[]
  startDate?: string
  endDate?: string
  userNetwork: string
}

export interface CashbackReportData {
  Nome?: string
  Whatsapp?: string
  Loja?: string
  Rede_de_loja?: string
  Envio_novo?: string
  Status?: string
  [key: string]: any
}

// Mapeamento de campos técnicos para labels amigáveis
const FIELD_LABELS: Record<string, string> = {
  'Nome': 'Nome',
  'Whatsapp': 'WhatsApp',
  'Loja': 'Loja',
  'Rede_de_loja': 'Rede',
  'Envio_novo': 'Data de Envio',
  'Status': 'Status'
}

/**
 * Aplica labels amigáveis aos campos selecionados
 */
export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/AAAA)
 */
export function formatDateToBrazilian(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return '-'
  }
}

/**
 * Trata valores null/undefined retornando '-'
 */
export function formatValue(value: any, fieldName: string): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  
  // Formatação especial para datas
  if (fieldName === 'Envio_novo') {
    return formatDateToBrazilian(value)
  }
  
  return String(value)
}

/**
 * Busca dados de cashback da tabela EnvioCashTemTotal
 */
export async function getCashbackReportData(filters: CashbackPDFFilters): Promise<CashbackReportData[]> {
  try {
    const { selectedFields, startDate, endDate, userNetwork } = filters

    console.log('🔄 Cashback PDF Service - Buscando dados com filtros:', filters)

    // Validação básica
    if (!selectedFields || selectedFields.length === 0) {
      console.log('❌ Campos não selecionados')
      return []
    }

    // Construir query base com otimizações
    let query = supabase
      .from('EnvioCashTemTotal')
      .select(selectedFields.join(', '))
      .eq('Status', 'Enviada') // Filtro obrigatório: apenas mensagens enviadas
      .eq('Rede_de_loja', userNetwork) // Filtro obrigatório: apenas dados da empresa do usuário
      // REMOVIDO: Limite removido para retornar todos os dados disponíveis

    console.log('🔍 Filtros aplicados:')
    console.log('   Status = "Enviada"')
    console.log('   Rede_de_loja =', userNetwork)

    // Aplicar filtros de data opcionais
    if (startDate) {
      query = query.gte('Envio_novo', startDate)
      console.log('📅 Filtro data inicial aplicado:', startDate)
    }
    
    if (endDate) {
      query = query.lte('Envio_novo', endDate)
      console.log('📅 Filtro data final aplicado:', endDate)
    }

    // Ordenar por data (mais recentes primeiro)
    query = query.order('Envio_novo', { ascending: false })

    console.log('🔍 Executando query na tabela EnvioCashTemTotal...')
    console.log('🔍 Campos selecionados:', selectedFields.join(', '))
    
    const { data, error } = await query

    if (error) {
      console.error('❌ Erro na query:', error)
      console.error('❌ Detalhes do erro:', error.message, error.code, error.details)
      return []
    }

    console.log('📈 Dados obtidos:', data?.length || 0, 'registros')
    
    if (!data || data.length === 0) {
      console.log('📭 Nenhum dado de cashback encontrado para a empresa')
      return []
    }

    // Verificar se há muitos dados (pode impactar performance)
    if (data.length > 5000) {
      console.warn('⚠️ Grande quantidade de dados detectada:', data.length, 'registros')
      console.warn('⚠️ Isso pode impactar a performance da geração do PDF')
    }

    // Log de verificação dos dados
    console.log('🔍 Verificação dos dados obtidos:')
    console.log('   Total de registros:', data.length)
    
    if (data.length > 0) {
      const primeiroRegistro = data[0] as any
      if (primeiroRegistro && typeof primeiroRegistro === 'object') {
        console.log('   Primeiro registro:', {
          Nome: primeiroRegistro.Nome || 'N/A',
          Rede_de_loja: primeiroRegistro.Rede_de_loja || 'N/A',
          Status: primeiroRegistro.Status || 'N/A',
          Envio_novo: primeiroRegistro.Envio_novo || 'N/A'
        })
      }
      
      // Verificar se todos os registros são da empresa correta
      const validData = data.filter(item => item && typeof item === 'object') as any[]
      const redesEncontradas = [...new Set(validData.map(item => item.Rede_de_loja).filter(Boolean))]
      console.log('   Redes encontradas nos dados:', redesEncontradas)
      
      if (redesEncontradas.length > 1) {
        console.error('🚨 ERRO: Múltiplas redes encontradas após filtro!', redesEncontradas)
      } else if (redesEncontradas.length === 1 && redesEncontradas[0] === userNetwork) {
        console.log('✅ SUCESSO: Apenas dados da rede correta')
      }
    }

    return data
  } catch (error) {
    console.error('💥 Erro ao buscar dados de cashback:', error)
    return []
  }
}

/**
 * Escapa HTML mantendo acentos e caracteres especiais brasileiros
 */
function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return ''
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  // Escapar apenas caracteres HTML perigosos, mantendo acentos
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Gera HTML formatado para o relatório
 */
export function generateReportHTML(data: CashbackReportData[], selectedFields: string[]): string {
  try {
    console.log('🔄 Gerando HTML do relatório com', data.length, 'registros')
    
    // Detectar se há muitas colunas para ajustar o layout
    const columnCount = selectedFields.length
    const isWideTable = columnCount > 5
    const isVeryWideTable = columnCount > 7
    
    // Ajustar tamanho da fonte e padding baseado no número de colunas
    const fontSize = isVeryWideTable ? '10px' : isWideTable ? '11px' : '12px'
    const cellPadding = isVeryWideTable ? '4px' : isWideTable ? '6px' : '8px'
    const headerFontSize = isVeryWideTable ? '11px' : isWideTable ? '12px' : '13px'
    
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Cabeçalhos da tabela baseados nos campos selecionados
    const headerCells = selectedFields.map(field => 
      `<th style="background-color: #f8f9fa; padding: ${cellPadding}; text-align: left; border: 1px solid #dee2e6; font-weight: bold; font-size: ${headerFontSize}; white-space: nowrap;">${escapeHtml(getFieldLabel(field))}</th>`
    ).join('')

    // Gerar linhas da tabela
    let tableRows = ''
    
    if (data.length === 0) {
      // Mensagem quando não há dados
      tableRows = `
        <tr>
          <td colspan="${selectedFields.length}" style="padding: 20px; text-align: center; color: #6c757d; font-style: italic; border: 1px solid #dee2e6;">
            Nenhum dado de cashback encontrado para a sua empresa
          </td>
        </tr>
      `
    } else {
      // Gerar linhas com dados
      data.forEach((row, index) => {
        const isEven = index % 2 === 0
        const backgroundColor = isEven ? '#ffffff' : '#f8f9fa'
        
        const cells = selectedFields.map(field => {
          const value = formatValue(row[field], field)
          return `<td style="padding: ${cellPadding}; border: 1px solid #dee2e6; background-color: ${backgroundColor}; font-size: ${fontSize}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: ${isVeryWideTable ? '120px' : isWideTable ? '150px' : '200px'};">${escapeHtml(value)}</td>`
        }).join('')
        
        tableRows += `<tr>${cells}</tr>`
      })
    }

    // HTML completo do relatório
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Cashbacks</title>
    <style>
        @page {
            size: ${isWideTable ? 'A4 landscape' : 'A4 portrait'};
            margin: ${isVeryWideTable ? '10mm' : '15mm'};
        }
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: ${isVeryWideTable ? '10px' : '15px'};
            background-color: #ffffff;
            color: #333333;
            font-size: ${fontSize};
        }
        
        .header {
            text-align: center;
            margin-bottom: ${isVeryWideTable ? '15px' : '25px'};
            border-bottom: 2px solid #10b981;
            padding-bottom: ${isVeryWideTable ? '10px' : '15px'};
        }
        
        .header h1 {
            color: #10b981;
            font-size: ${isVeryWideTable ? '18px' : '22px'};
            margin: 0;
            font-weight: bold;
        }
        
        .info {
            margin-bottom: ${isVeryWideTable ? '10px' : '15px'};
            padding: ${isVeryWideTable ? '8px' : '12px'};
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #10b981;
        }
        
        .info p {
            margin: 3px 0;
            font-size: ${isVeryWideTable ? '10px' : '12px'};
        }
        
        .table-container {
            width: 100%;
            overflow-x: auto;
            margin-bottom: ${isVeryWideTable ? '15px' : '25px'};
        }
        
        table {
            width: ${isWideTable ? 'max-content' : '100%'};
            min-width: 100%;
            border-collapse: collapse;
            font-size: ${fontSize};
            margin: 0;
            font-size: 12px;
        }
        th {
            background-color: #10b981 !important;
            color: white !important;
            padding: 12px;
            text-align: left;
            border: 1px solid #0d9668;
            font-weight: bold;
        }
        td {
            padding: 10px;
            border: 1px solid #dee2e6;
        }
        tr:nth-child(even) td {
            background-color: #f8f9fa;
        }
        tr:nth-child(odd) td {
            background-color: #ffffff;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
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
        <h1>Relatório de Cashbacks</h1>
    </div>
    
    <div class="info">
        <p><strong>Total de registros:</strong> ${data.length}</p>
        <p><strong>Data de geração:</strong> ${currentDate}</p>
        <p><strong>Campos selecionados:</strong> ${selectedFields.map(field => getFieldLabel(field)).join(', ')}</p>
    </div>
    
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    ${headerCells}
                </tr>
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
    
    <div class="footer">
        <p>Relatório gerado em ${currentDate}</p>
        <p>Sistema Praise Shot - Relatório de Cashbacks</p>
    </div>
</body>
</html>
    `

    console.log('✅ HTML gerado com sucesso. Tamanho:', html.length, 'caracteres')
    return html.trim()
    
  } catch (error) {
    console.error('💥 Erro ao gerar HTML:', error)
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Erro no Relatório</title>
</head>
<body>
    <h1 style="color: red;">Erro na geração do relatório</h1>
    <p>Ocorreu um erro ao gerar o relatório de cashbacks.</p>
    <p>Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
</body>
</html>
    `
  }
}

/**
 * Gera PDF usando Puppeteer
 */
export async function generateCashbackPDF(filters: CashbackPDFFilters): Promise<Buffer> {
  let browser = null
  
  try {
    console.log('🔄 Iniciando geração de PDF para cashback')
    
    // 1. Buscar dados
    const data = await getCashbackReportData(filters)
    console.log('📊 Dados obtidos:', data.length, 'registros')
    
    // 2. Gerar HTML
    const html = generateReportHTML(data, filters.selectedFields)
    console.log('📄 HTML gerado, tamanho:', html.length, 'caracteres')
    
    // 3. Converter para PDF com Puppeteer
    console.log('🚀 Inicializando Puppeteer...')
    
    const puppeteer = require('puppeteer')
    
    // Configurar Puppeteer com argumentos otimizados
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--memory-pressure-off'
      ],
      timeout: 30000,
      protocolTimeout: 30000
    })
    
    console.log('✅ Puppeteer inicializado com sucesso')
    
    // Criar nova página com configurações otimizadas
    const page = await browser.newPage()
    console.log('📄 Nova página criada')
    
    // Configurar viewport para PDF
    await page.setViewport({ width: 1200, height: 800 })
    
    // Configurar headers UTF-8
    await page.setExtraHTTPHeaders({
      'Accept-Charset': 'utf-8'
    })
    
    // Desabilitar imagens e recursos desnecessários para melhor performance
    await page.setRequestInterception(true)
    page.on('request', (req: any) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'font') {
        req.abort()
      } else {
        req.continue()
      }
    })
    
    // Definir conteúdo HTML
    console.log('📝 Definindo conteúdo HTML na página...')
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    console.log('✅ Conteúdo HTML definido com sucesso')
    
    // Detectar se há muitas colunas para ajustar formato
    const columnCount = filters.selectedFields.length
    const isWideTable = columnCount > 5
    const isVeryWideTable = columnCount > 7
    
    // Gerar PDF com configurações específicas
    console.log('🖨️ Gerando PDF...')
    console.log(`📊 Tabela com ${columnCount} colunas - Formato: ${isWideTable ? 'paisagem' : 'retrato'}`)
    
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
    
    console.log('✅ PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes')
    
    // Fechar browser
    await browser.close()
    browser = null
    console.log('🔒 Browser fechado')
    
    return pdfBuffer
    
  } catch (error) {
    console.error('💥 Erro na geração de PDF:', error)
    
    // Garantir que o browser seja fechado em caso de erro
    if (browser) {
      try {
        await browser.close()
        console.log('🔒 Browser fechado após erro')
      } catch (closeError) {
        console.error('❌ Erro ao fechar browser:', closeError)
      }
    }
    
    throw error
  }
}