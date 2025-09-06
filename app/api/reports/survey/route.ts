import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  console.log('🚀 === INÍCIO DA API DE PESQUISAS ===')
  console.log('🚀 Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('🚀 Body recebido:', JSON.stringify(body, null, 2))
    
    const { startDate, endDate, selectedFields, selectedStore } = body

    console.log('📥 API de pesquisas chamada')
    console.log('📋 Campos selecionados:', selectedFields)
    console.log('📅 Período:', { startDate, endDate })
    console.log('🏪 Loja selecionada:', selectedStore)

    // Obter email da sessão através dos cookies
    const cookies = request.headers.get('cookie') || ''
    console.log('🔐 Cookies recebidos:', cookies ? 'Sim' : 'Não')
    console.log('🔐 Cookies (primeiros 100 chars):', cookies.substring(0, 100))
    
    const sessionMatch = cookies.match(/ps_session=([^;]+)/)
    
    if (!sessionMatch) {
      console.error('❌ Nenhuma sessão encontrada')
      console.error('❌ Cookies disponíveis:', cookies)
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
      console.error('❌ Erro ao buscar usuário:', userError)
      console.error('❌ Email buscado:', email)
      console.error('❌ Sistema buscado: Praise Shot')
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
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
        { error: 'Usuário não possui empresa definida' },
        { status: 400 }
      )
    }

    console.log('🏢 Empresa do usuário autenticado:', userEmpresa)

    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      return NextResponse.json(
        { error: 'Campos selecionados são obrigatórios' },
        { status: 400 }
      )
    }

    // Os campos do frontend correspondem diretamente aos campos do banco
    const mappedFields = selectedFields

    // Construir a query
    let query = supabase
      .from('respostas_pesquisas')
      .select(mappedFields.join(', '))
      .eq('rede', userEmpresa)

    // Aplicar filtro de loja se fornecido
    if (selectedStore && selectedStore.trim() !== '') {
      query = query.eq('loja', selectedStore)
      console.log('🏪 Filtro loja aplicado:', selectedStore)
    }

    // Aplicar filtros de data se fornecidos
    if (startDate) {
      query = query.gte('criado_em', startDate)
    }
    
    if (endDate) {
      // Adicionar 23:59:59 ao endDate para incluir todo o dia
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      query = query.lte('criado_em', endDateTime.toISOString())
    }



    // Ordenar por data de criação (mais recentes primeiro) - SEM LIMITE
    query = query.order('criado_em', { ascending: false })

    console.log('🔍 Executando query no banco de dados...')
    console.log('🔍 Query construída - Tabela: respostas_pesquisas')
    console.log('🔍 Query construída - Campos:', mappedFields.join(', '))
    console.log('🔍 Query construída - Filtro rede:', userEmpresa)
    console.log('🔍 Query construída - Filtro loja:', selectedStore)
    console.log('🔍 Query construída - Data inicial:', startDate)
    console.log('🔍 Query construída - Data final:', endDate)

    const { data, error } = await query

    console.log('📊 RESULTADO DA QUERY:')
    console.log('📊 Erro:', error)
    console.log('📊 Dados recebidos:', data ? 'Sim' : 'Não')
    console.log('📊 Tipo dos dados:', typeof data)
    console.log('📊 É array:', Array.isArray(data))

    if (error) {
      console.error('❌ ERRO DETALHADO AO BUSCAR DADOS:', error)
      console.error('❌ Código do erro:', error.code)
      console.error('❌ Mensagem do erro:', error.message)
      console.error('❌ Detalhes do erro:', error.details)
      return NextResponse.json(
        { error: 'Erro ao buscar dados de pesquisas' },
        { status: 500 }
      )
    }

    // LOGS DETALHADOS PARA DEBUG
    console.log('📊 === DADOS BRUTOS DO BANCO DE DADOS ===')
    console.log('📊 Total de registros encontrados:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('📊 Primeiros 3 registros completos:')
      data.slice(0, 3).forEach((item, index) => {
        console.log(`📊 Registro ${index + 1}:`, JSON.stringify(item, null, 2))
      })
      
      // Verificar especificamente os valores da coluna 'resposta'
      if (selectedFields.includes('resposta')) {
        const respostasUnicas = [...new Set(data.map((item: any) => item.resposta).filter(r => r !== null && r !== undefined))]
        console.log('📊 VALORES ÚNICOS na coluna RESPOSTA:', respostasUnicas)
        console.log('📊 Tipos dos valores de resposta:', respostasUnicas.map(r => `"${r}" (${typeof r})`))
      }
    }

    // Retornar dados sem processamento pesado (para debug)
    console.log('🚀 Preparando resposta final...')
    const processedData = data || []
    
    const responseData = {
      success: true,
      data: processedData,
      total: processedData.length,
      userEmpresa: userEmpresa,
      userInfo: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        empresa: userData.empresa,
        rede: userData.rede
      },
      periodo: {
        inicio: startDate,
        fim: endDate
      }
    }
    
    console.log('🚀 === RESPOSTA FINAL SENDO ENVIADA ===')
    console.log('🚀 Estrutura da resposta:', {
      success: responseData.success,
      dataLength: responseData.data.length,
      total: responseData.total,
      userEmpresa: responseData.userEmpresa,
      userInfoPresent: !!responseData.userInfo,
      periodoPresent: !!responseData.periodo
    })
    
    if (responseData.data.length > 0) {
      console.log('🚀 Primeiro registro da resposta:', JSON.stringify(responseData.data[0], null, 2))
    }
    
    console.log('🚀 === FIM DA API DE PESQUISAS ===')

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('💥 === ERRO CRÍTICO NA API DE PESQUISAS ===')
    console.error('💥 Erro na API de relatório de pesquisas:', error)
    console.error('💥 Tipo do erro:', typeof error)
    console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A')
    console.error('💥 === FIM DO ERRO CRÍTICO ===')
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}