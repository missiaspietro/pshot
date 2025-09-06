import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { selectedFields, startDate, endDate, selectedStore } = body

    // Mapear campos da interface para colunas da tabela relatorio_niver_decor_fabril
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

    // Mapear campos selecionados para colunas do banco
    const mappedFields = selectedFields.map(mapFieldToColumn)

    console.log('🔄 API de Aniversários - Tabela relatorio_niver_decor_fabril:', { selectedFields, mappedFields, startDate, endDate, selectedStore })

    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      return NextResponse.json(
        { error: 'Campos selecionados são obrigatórios' },
        { status: 400 }
      )
    }

    // OBTER USUÁRIO REAL DA SESSÃO/COOKIE
    console.log('🔐 Obtendo usuário da sessão...')
    
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
    console.log('🎯 Buscando dados na tabela relatorio_niver_decor_fabril para empresa:', userNetwork)

    // Construir query para a tabela relatorio_niver_decor_fabril
    let query = supabase
      .from('relatorio_niver_decor_fabril')
      .select(mappedFields.join(', '))
      .eq('rede', userNetwork) // Filtrar pela rede do usuário

    // Aplicar filtro de loja se fornecido
    if (selectedStore && selectedStore.trim() !== '') {
      query = query.eq('loja', selectedStore)
      console.log('🏪 Filtro loja aplicado:', selectedStore)
    }

    // Aplicar filtros de data se fornecidos
    if (startDate) {
      query = query.gte('criado_em', startDate)
      console.log('📅 Filtro data inicial aplicado:', startDate)
    }
    
    if (endDate) {
      query = query.lte('criado_em', endDate)
      console.log('📅 Filtro data final aplicado:', endDate)
    }

    // Ordenar por data de criação (mais recentes primeiro)
    query = query.order('criado_em', { ascending: false })

    console.log('🔍 Executando query na tabela relatorio_niver_decor_fabril...')
    console.log('🔍 Campos selecionados:', mappedFields.join(', '))
    console.log('🔍 Filtros aplicados:', { rede: userNetwork, loja: selectedStore, startDate, endDate })
    
    const { data, error } = await query

    if (error) {
      console.error('❌ Erro na query relatorio_niver_decor_fabril:', error)
      console.error('❌ Detalhes do erro:', error.message, error.code, error.details)
      return NextResponse.json(
        { error: `Erro ao buscar dados: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('📈 Dados obtidos da relatorio_niver_decor_fabril:', data?.length || 0, 'registros')
    
    // Debug específico para campo obs/status
    if (data && data.length > 0 && selectedFields.includes('status')) {
      console.log('🔍 DEBUG Campo Status/Obs:')
      console.log('   Campos mapeados incluem obs:', mappedFields.includes('obs'))
      console.log('   Primeiro registro:', data[0])
      console.log('   Campo obs no primeiro registro:', (data[0] as any)?.obs)
      console.log('   Tipo do campo obs:', typeof (data[0] as any)?.obs)
    }
    
    // Se não há dados, investigar por quê
    if (!data || data.length === 0) {
      console.log('🔍 INVESTIGANDO AUSÊNCIA DE DADOS:')
      
      // Verificar se há dados na tabela para esta rede
      const { data: allDataForNetwork, error: allDataError } = await supabase
        .from('relatorio_niver_decor_fabril')
        .select('id, rede, criado_em')
        .eq('rede', userNetwork)
        .limit(5)
      
      if (allDataError) {
        console.error('❌ Erro ao investigar dados:', allDataError)
      } else {
        console.log('📊 Dados encontrados para a rede', userNetwork, ':', allDataForNetwork?.length || 0)
        if (allDataForNetwork && allDataForNetwork.length > 0) {
          console.log('📊 Primeiros registros:', allDataForNetwork)
        }
      }
      
      // Verificar quais redes existem na tabela
      const { data: availableNetworks, error: networksError } = await supabase
        .from('relatorio_niver_decor_fabril')
        .select('rede')
        .not('rede', 'is', null)
        .limit(10)
      
      if (!networksError && availableNetworks) {
        const uniqueNetworks = [...new Set(availableNetworks.map(n => n.rede))]
        console.log('📊 Redes disponíveis na relatorio_niver_decor_fabril:', uniqueNetworks)
      }
    }

    console.log('📊 Resultado final para usuário', userData.email, ':', data?.length || 0, 'registros')

    // Resposta com dados da tabela relatorio_niver_decor_fabril
    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
      userNetwork: userNetwork,
      userInfo: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        empresa: userData.empresa,
        rede: userData.rede
      },
      source: 'relatorio_niver_decor_fabril' // Indicar que os dados vêm da tabela correta
    })

  } catch (error) {
    console.error('💥 Erro na API de aniversários (relatorio_niver_decor_fabril):', error)
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    )
  }
}