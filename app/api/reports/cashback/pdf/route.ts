import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateCashbackPDF } from '@/lib/cashback-pdf-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🔄 API Cashback PDF - Iniciando processamento')
    console.log('⏰ Timestamp de início:', new Date().toISOString())
    
    // 1. Validação básica de parâmetros
    const body = await request.json()
    const { selectedFields, startDate, endDate } = body

    console.log('📥 Parâmetros de entrada recebidos:')
    console.log('   selectedFields:', selectedFields)
    console.log('   startDate:', startDate)
    console.log('   endDate:', endDate)
    console.log('   Tipo selectedFields:', typeof selectedFields)
    console.log('   É array?', Array.isArray(selectedFields))
    console.log('   Quantidade de campos:', selectedFields?.length || 0)

    // Validação de campos obrigatórios
    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      console.error('❌ Campos selecionados são obrigatórios')
      return NextResponse.json(
        { error: 'Campos selecionados são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de datas (se fornecidas)
    if (startDate && isNaN(Date.parse(startDate))) {
      console.error('❌ Data inicial inválida:', startDate)
      return NextResponse.json(
        { error: 'Data inicial inválida' },
        { status: 400 }
      )
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      console.error('❌ Data final inválida:', endDate)
      return NextResponse.json(
        { error: 'Data final inválida' },
        { status: 400 }
      )
    }

    console.log('✅ Validação de parâmetros concluída')

    // 2. Autenticação e autorização
    console.log('🔐 Iniciando processo de autenticação...')
    
    // Verificar se há cookie de sessão
    const cookies = request.headers.get('cookie') || ''
    const sessionMatch = cookies.match(/ps_session=([^;]+)/)
    
    if (!sessionMatch) {
      console.error('❌ Nenhuma sessão encontrada')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const sessionValue = sessionMatch[1]
    const email = sessionValue.split('_')[0] // Extrair email da sessão
    
    console.log('👤 Email da sessão:', email)

    // Buscar dados completos do usuário na tabela users
    console.log('🔍 Buscando dados do usuário na tabela users...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, nome, empresa, rede, sistema')
      .eq('email', email)
      .eq('sistema', 'Praise Shot')
      .single()

    if (userError || !userData) {
      console.error('❌ Usuário não encontrado:', userError?.message)
      return NextResponse.json(
        { error: 'Usuário não encontrado ou não autorizado' },
        { status: 401 }
      )
    }

    console.log('✅ Usuário encontrado:', {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      empresa: userData.empresa,
      rede: userData.rede
    })

    // Determinar a rede do usuário (priorizar 'rede', depois 'empresa')
    const userNetwork = userData.rede || userData.empresa
    
    if (!userNetwork) {
      console.error('❌ Usuário sem empresa/rede definida')
      return NextResponse.json(
        { error: 'Usuário não possui empresa/rede associada' },
        { status: 400 }
      )
    }

    console.log('🏢 Rede do usuário autenticado:', userNetwork)
    console.log('🎯 Gerando relatório. Empresa do user:', userNetwork)

    // 3. Gerar PDF
    console.log('📄 Iniciando geração de PDF...')
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `relatorio-cashbacks-${currentDate}`

    try {
      // Tentar gerar PDF com Puppeteer
      const pdfBuffer = await generateCashbackPDF({
        selectedFields,
        startDate,
        endDate,
        userNetwork
      })

      const processingTime = Date.now() - startTime
      console.log('✅ PDF gerado com sucesso:', `${filename}.pdf`)
      console.log('⏱️ Tempo total de processamento:', processingTime, 'ms')
      console.log('📊 Tamanho do PDF:', pdfBuffer.length, 'bytes')

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`
        }
      })

    } catch (puppeteerError) {
      // Fallback: retornar HTML se Puppeteer falhar
      console.error('❌ Puppeteer falhou, ativando fallback para HTML:', puppeteerError)
      console.log('🔄 Gerando fallback HTML...')

      // Importar funções necessárias para o fallback
      const { getCashbackReportData, generateReportHTML } = await import('@/lib/cashback-pdf-service')
      
      // Gerar HTML diretamente
      const data = await getCashbackReportData({
        selectedFields,
        startDate,
        endDate,
        userNetwork
      })
      
      const html = generateReportHTML(data, selectedFields)
      
      const processingTime = Date.now() - startTime
      console.log('✅ HTML de fallback gerado com sucesso:', `${filename}.html`)
      console.log('⏱️ Tempo total de processamento (fallback):', processingTime, 'ms')
      console.log('📊 Tamanho do HTML:', html.length, 'caracteres')

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${filename}.html"`
        }
      })
    }

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('💥 ERRO CRÍTICO na API Cashback PDF:')
    console.error('   Mensagem:', error instanceof Error ? error.message : 'Erro desconhecido')
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A')
    console.error('   Tempo até erro:', processingTime, 'ms')
    console.error('   Timestamp do erro:', new Date().toISOString())
    
    // Determinar tipo de erro e status code apropriado
    let statusCode = 500
    let errorMessage = 'Erro interno do servidor'
    
    if (error instanceof Error) {
      if (error.message.includes('não autenticado')) {
        statusCode = 401
        errorMessage = 'Usuário não autenticado'
      } else if (error.message.includes('não autorizado')) {
        statusCode = 401
        errorMessage = 'Usuário não autorizado'
      } else if (error.message.includes('obrigatórios')) {
        statusCode = 400
        errorMessage = 'Parâmetros obrigatórios não fornecidos'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}