import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cashbackReportService, CASHBACK_ERROR_MESSAGES } from '@/lib/cashback-report-service-new'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('📥 API de cashback com dados reais chamada')
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

    // Validar campos obrigatórios
    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      console.log('❌ Campos não selecionados')
      return NextResponse.json(
        { error: CASHBACK_ERROR_MESSAGES.INVALID_FIELDS },
        { status: 400 }
      )
    }

    // OBTER USUÁRIO REAL DA SESSÃO/COOKIE
    console.log('🔐 Obtendo usuário da sessão...')
    
    // Verificar se há cookie de sessão
    const cookies = request.headers.get('cookie') || ''
    console.log('🍪 Cookies recebidos:', cookies ? 'Presentes' : 'Ausentes')
    console.log('🍪 Cookies (primeiros 100 chars):', cookies.substring(0, 100))
    
    const sessionMatch = cookies.match(/ps_session=([^;]+)/)
    
    if (!sessionMatch) {
      console.error('❌ SESSÃO NÃO ENCONTRADA:')
      console.error('   Cookies disponíveis:', cookies || 'Nenhum')
      console.error('   Padrão procurado: ps_session=...')
      console.error('   Headers da requisição:', Object.fromEntries(request.headers.entries()))
      
      return NextResponse.json(
        { error: CASHBACK_ERROR_MESSAGES.NO_AUTH },
        { status: 401 }
      )
    }

    const sessionValue = sessionMatch[1]
    const email = sessionValue.split('_')[0] // Extrair email da sessão
    
    console.log('👤 Sessão encontrada:', {
      sessionValue: sessionValue.substring(0, 20) + '...',
      emailExtraido: email
    })

    // Buscar dados completos do usuário na tabela users
    console.log('🔍 Buscando dados do usuário na tabela users...')
    console.log('🔍 Query: email =', email, '& sistema = Praise Shot')
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, nome, empresa, rede, sistema')
      .eq('email', email)
      .eq('sistema', 'Praise Shot')
      .single()

    if (userError || !userData) {
      console.error('❌ USUÁRIO NÃO ENCONTRADO:')
      console.error('   Email procurado:', email)
      console.error('   Erro Supabase:', userError?.message)
      console.error('   Código do erro:', userError?.code)
      console.error('   Detalhes:', userError?.details)
      
      // Investigar se o usuário existe com outro sistema
      console.log('🔍 Investigando se usuário existe com outro sistema...')
      const { data: allUserData, error: allUserError } = await supabase
        .from('users')
        .select('email, sistema, empresa, rede')
        .eq('email', email)
      
      if (!allUserError && allUserData) {
        console.log('📋 Usuários encontrados com este email:', allUserData)
      }
      
      return NextResponse.json(
        { error: CASHBACK_ERROR_MESSAGES.NO_AUTH },
        { status: 401 }
      )
    }

    console.log('✅ USUÁRIO ENCONTRADO COM SUCESSO:', {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      empresa: userData.empresa,
      rede: userData.rede,
      sistema: userData.sistema
    })

    // Determinar a empresa do usuário (priorizar 'rede', depois 'empresa')
    const userEmpresa = userData.rede || userData.empresa
    
    if (!userEmpresa) {
      console.error('❌ Usuário sem empresa/rede definida')
      return NextResponse.json(
        { error: CASHBACK_ERROR_MESSAGES.NO_COMPANY },
        { status: 400 }
      )
    }

    console.log('🏢 Empresa do usuário autenticado:', userEmpresa)

    // Validar filtros antes de processar
    const filters = {
      empresa: userEmpresa,
      selectedFields,
      startDate,
      endDate,
      selectedStore
    }

    const validation = cashbackReportService.validateFilters(filters)
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

    // Verificar se a empresa existe na tabela de cashback
    console.log('🔍 Verificando se a empresa existe na tabela EnvioCashTemTotal...')
    const { data: companyCheck, error: companyError } = await supabase
      .from('EnvioCashTemTotal')
      .select('Rede_de_loja')
      .eq('Rede_de_loja', userEmpresa)
      .limit(1)

    if (companyError) {
      console.error('❌ Erro ao verificar empresa:', companyError)
    } else if (!companyCheck || companyCheck.length === 0) {
      console.warn('⚠️ Empresa do usuário não encontrada na tabela de cashback:', userEmpresa)
      
      // Investigar empresas disponíveis na tabela
      console.log('🔍 Investigando empresas disponíveis na tabela...')
      const { data: allCompanies, error: allCompaniesError } = await supabase
        .from('EnvioCashTemTotal')
        .select('Rede_de_loja')
        .not('Rede_de_loja', 'is', null)
        .limit(10)
      
      if (allCompaniesError) {
        console.error('❌ Erro ao buscar empresas:', allCompaniesError)
      } else {
        const uniqueCompanies = [...new Set(allCompanies?.map(c => c.Rede_de_loja) || [])]
        console.log('📊 Empresas disponíveis na tabela:', uniqueCompanies)
        console.log('📊 Empresa do usuário:', userEmpresa)
        console.log('📊 Empresa do usuário está na lista?', uniqueCompanies.includes(userEmpresa))
      }
    } else {
      console.log('✅ Empresa confirmada na tabela de cashback')
    }

    // Buscar dados usando o serviço
    console.log('🔄 Buscando dados de cashback...')
    const data = await cashbackReportService.getCashbackData(filters)

    console.log('📊 Resultado final para usuário', userData.email, ':', data?.length || 0, 'registros')

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
      message: data?.length ? `${data.length} registros encontrados` : CASHBACK_ERROR_MESSAGES.NO_DATA
    })

  } catch (error) {
    console.error('💥 Erro na API de cashback com dados reais:', error)
    
    const errorMessage = error instanceof Error ? error.message : CASHBACK_ERROR_MESSAGES.UNKNOWN
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    )
  }
}