import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { promotionsReportService, PROMOTIONS_ERROR_MESSAGES } from '@/lib/promotions-report-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API de promoções com dados reais chamada')
    console.log('🌐 URL da requisição:', request.url)
    console.log('🔗 Método:', request.method)
    
    const body = await request.json()
    const { selectedFields, startDate, endDate, selectedStore } = body

    console.log('📋 DADOS RECEBIDOS NA API:')
    console.log('   selectedFields:', selectedFields)
    console.log('   startDate:', startDate)
    console.log('   endDate:', endDate)
    console.log('   selectedStore:', selectedStore)
    console.log('   Tipo selectedFields:', typeof selectedFields)
    console.log('   É array?:', Array.isArray(selectedFields))
    console.log('   Tamanho do array:', selectedFields?.length)

    // Validar campos obrigatórios - se não houver campos, usar campos padrão
    let fieldsToUse = selectedFields
    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      console.log('⚠️ Nenhum campo selecionado, usando campos padrão')
      fieldsToUse = ['Cliente', 'Whatsapp', 'Loja', 'Enviado', 'Data_Envio']
    }

    // OBTER USUÁRIO REAL DA SESSÃO/COOKIE
    console.log('🔐 Obtendo usuário da sessão...')
    
    // Verificar se há cookie de sessão
    const cookies = request.headers.get('cookie') || ''
    const sessionMatch = cookies.match(/ps_session=([^;]+)/)
    
    if (!sessionMatch) {
      console.error('❌ Nenhuma sessão encontrada')
      return NextResponse.json(
        { error: PROMOTIONS_ERROR_MESSAGES.NO_AUTH },
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
        { error: PROMOTIONS_ERROR_MESSAGES.NO_AUTH },
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
  // Determinar a empresa do usuário (priorizar 'rede', depois 'empresa')
    const userEmpresa = userData.rede || userData.empresa
    
    if (!userEmpresa) {
      console.error('❌ Usuário sem empresa/rede definida')
      return NextResponse.json(
        { error: PROMOTIONS_ERROR_MESSAGES.NO_COMPANY },
        { status: 400 }
      )
    }

    console.log('🏢 Empresa do usuário autenticado:', userEmpresa)

    // Validar filtros antes de processar
    const filters = {
      empresa: userEmpresa,
      selectedFields: fieldsToUse,
      startDate,
      endDate,
      selectedStore
    }

    const validation = promotionsReportService.validateFilters(filters)
    if (!validation.isValid) {
      console.error('❌ Filtros inválidos:', validation.errors)
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Log dos dados do usuário para debug
    console.log('👤 Dados do usuário autenticado:', {
      email: userData.email,
      nome: userData.nome,
      empresa: userData.empresa,
      rede: userData.rede,
      empresaUsada: userEmpresa
    })

    // Buscar dados usando o serviço
    console.log('🔄 Buscando dados de promoções...')
    console.log('🔍 FILTROS ENVIADOS PARA O SERVIÇO:')
    console.log('   empresa:', filters.empresa)
    console.log('   selectedFields:', filters.selectedFields)
    console.log('   startDate:', filters.startDate)
    console.log('   endDate:', filters.endDate)
    
    const data = await promotionsReportService.getPromotionsData(filters)

    console.log('📊 Resultado final para usuário', userData.email, ':', data?.length || 0, 'registros')
    
    if (!data || data.length === 0) {
      console.log('📭 NENHUM DADO RETORNADO - ANÁLISE DETALHADA:')
      console.log('   1. 👤 USUÁRIO:')
      console.log('      Email:', userData.email)
      console.log('      Nome:', userData.nome)
      console.log('      Empresa:', userData.empresa)
      console.log('      Rede:', userData.rede)
      console.log('      Empresa usada no filtro:', userEmpresa)
      console.log('   2. 🔍 FILTROS APLICADOS:')
      console.log('      selectedFields:', filters.selectedFields)
      console.log('      startDate:', filters.startDate)
      console.log('      endDate:', filters.endDate)
      console.log('      empresa:', filters.empresa)
      console.log('   3. 💡 POSSÍVEIS SOLUÇÕES:')
      console.log('      - Verificar se existem registros na tabela "Relatorio Envio de Promoções"')
      console.log('      - Verificar se o campo "Rede" nos registros confere com "' + userEmpresa + '"')
      console.log('      - Verificar se as datas estão no período especificado')
      console.log('      - Considerar que registros podem ter Rede null/undefined')
    } else {
      console.log('✅ DADOS ENCONTRADOS COM SUCESSO:')
      console.log('   📊 Total de registros:', data.length)
      console.log('   👤 Usuário:', userData.email)
      console.log('   🏢 Empresa filtrada:', userEmpresa)
      console.log('   📅 Período:', filters.startDate, 'até', filters.endDate)
      console.log('   📋 Campos selecionados:', filters.selectedFields.length)
      console.log('   🔍 Primeiro registro (exemplo):')
      if (data[0]) {
        Object.keys(data[0]).forEach(key => {
          console.log('      ' + key + ':', (data[0] as any)[key])
        })
      }
    }

    // Resposta com dados reais
    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
      userEmpresa: userEmpresa,
      userInfo: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        empresa: userData.empresa,
        rede: userData.rede
      },
      message: data?.length ? `${data.length} registros encontrados` : PROMOTIONS_ERROR_MESSAGES.NO_DATA
    })

  } catch (error) {
    console.error('💥 Erro na API de promoções com dados reais:', error)
    
    const errorMessage = error instanceof Error ? error.message : PROMOTIONS_ERROR_MESSAGES.UNKNOWN
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    )
  }
}