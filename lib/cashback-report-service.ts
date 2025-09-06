import { supabase } from './supabase'
import { getCachedData, setCachedData } from './dashboard-optimizations'

export interface CashbackReportData {
  name: string
  valor: number
}

export interface DetailedCashbackReportData {
  mes: string
  [loja: string]: string | number
}

export interface CustomCashbackReportData {
  [key: string]: any
}

export interface CashbackReportFilters {
  selectedFields: string[]
  startDate?: string
  endDate?: string
  userNetwork: string
}

export async function getCashbackReportByStore(empresa: string): Promise<CashbackReportData[]> {
  try {
    // Verifica cache primeiro
    const cacheKey = `cashback-6m-${empresa}`
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Calcula exatamente os últimos 6 meses completos
    const currentDate = new Date()
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startMonth = new Date(endMonth)
    startMonth.setMonth(endMonth.getMonth() - 5)

    const startDate = startMonth.toISOString().split('T')[0]
    const endDate = currentDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('EnvioCashTemTotal')
      .select('Loja, Envio_novo')
      .eq('Status', 'enviado')
      .eq('Rede_de_loja', empresa)
      .gte('Envio_novo', startDate)
      .lte('Envio_novo', endDate)

    if (error) {
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Agrupa os dados por loja e conta quantos registros cada loja tem
    const storeCount: { [key: string]: number } = {}

    data.forEach((item) => {
      const store = item.Loja || 'Sem Loja'
      storeCount[store] = (storeCount[store] || 0) + 1
    })

    // Converte para o formato esperado pelo gráfico
    const result: CashbackReportData[] = Object.entries(storeCount)
      .map(([store, count]) => ({
        name: store,
        valor: count
      }))
      .sort((a, b) => {
        const aNum = parseInt(a.name)
        const bNum = parseInt(b.name)

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }

        return a.name.localeCompare(b.name)
      })

    // Salva no cache
    setCachedData(cacheKey, result)

    return result
  } catch (error) {
    return []
  }
}

export async function getDetailedCashbackReportByStore(empresa: string): Promise<DetailedCashbackReportData[]> {
  try {
    // Verifica cache primeiro
    const cacheKey = `cashback-detailed-6m-${empresa}`
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Calcula exatamente os últimos 6 meses completos
    const currentDate = new Date()
    const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startMonth = new Date(endMonth)
    startMonth.setMonth(endMonth.getMonth() - 5)

    const startDate = startMonth.toISOString().split('T')[0]
    const endDate = currentDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('EnvioCashTemTotal')
      .select('Loja, Envio_novo')
      .eq('Status', 'enviado')
      .eq('Rede_de_loja', empresa)
      .gte('Envio_novo', startDate)
      .lte('Envio_novo', endDate)
      .order('Envio_novo', { ascending: true })

    if (error) {
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Agrupa os dados por mês e loja
    const grouped: Record<string, Record<string, number>> = {}
    const lojasSet: Set<string> = new Set()

    // Primeiro, coletar todas as lojas únicas
    data.forEach(item => {
      if (item.Loja) {
        const loja = item.Loja.toString().trim()
        lojasSet.add(loja)
      }
    })

    // Agrupar os dados por mês
    data.forEach(item => {
      if (!item.Envio_novo || !item.Loja) return

      const date = new Date(item.Envio_novo)
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      const loja = item.Loja.toString().trim()

      if (!grouped[monthKey]) {
        grouped[monthKey] = {}
        Array.from(lojasSet).forEach(l => grouped[monthKey][l] = 0)
      }

      grouped[monthKey][loja] = (grouped[monthKey][loja] || 0) + 1
    })

    // Criar array final mantendo todas as lojas em ordem consistente
    const allLojas = Array.from(lojasSet).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }

      return a.localeCompare(b)
    })

    // Gerar todos os últimos 6 meses, mesmo que não tenham dados
    const mesesArray: DetailedCashbackReportData[] = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setMonth(currentDate.getMonth() - i)

      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      const mesFormatado = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

      const obj: DetailedCashbackReportData = {
        mes: mesFormatado
      } as DetailedCashbackReportData

      // Adicionar dados das lojas para este mês (0 se não houver dados)
      allLojas.forEach(loja => {
        const valor = grouped[monthKey]?.[loja] ?? 0;
        (obj as any)[loja] = valor;
      });

      mesesArray.push(obj);
    }

    // Salva no cache
    setCachedData(cacheKey, mesesArray)

    return mesesArray
  } catch (error) {
    return []
  }
}

export async function getCustomCashbackReport(filters: CashbackReportFilters): Promise<CustomCashbackReportData[]> {
  try {
    const { selectedFields, startDate, endDate, userNetwork } = filters

    console.log('🔄 CASHBACK SERVICE - Service iniciado com filtros:', filters)

    // Validação básica
    if (!selectedFields || selectedFields.length === 0) {
      console.log('❌ Campos não selecionados')
      return []
    }

    // PRIMEIRA ABORDAGEM: Buscar TODOS os dados sem filtro e depois filtrar manualmente
    console.log('📊 Buscando TODOS os dados da tabela EnvioCashTemTotal (sem filtro inicial)...')
    
    let query = supabase
      .from('EnvioCashTemTotal')
      .select(selectedFields.join(', '))

    // Aplicar apenas filtros de data
    if (startDate) {
      query = query.gte('Envio_novo', startDate)
      console.log('📅 Filtro data inicial aplicado:', startDate)
    }
    
    if (endDate) {
      query = query.lte('Envio_novo', endDate)
      console.log('📅 Filtro data final aplicado:', endDate)
    }

    // Ordenar por data
    query = query.order('Envio_novo', { ascending: false })

    console.log('🔍 Executando query inicial (SEM filtro de empresa)...')
    console.log('🔍 Query construída com campos:', selectedFields.join(', '))
    console.log('🔍 Filtros de data aplicados:', { startDate, endDate })
    
    const { data: allData, error } = await query

    if (error) {
      console.error('❌ Erro na query:', error)
      console.error('❌ Detalhes do erro:', error.message, error.code, error.details)
      return []
    }

    console.log('📈 Dados brutos obtidos:', allData?.length || 0, 'registros')
    
    // Se não há dados, vamos investigar por quê
    if (!allData || allData.length === 0) {
      console.log('🔍 INVESTIGANDO AUSÊNCIA DE DADOS:')
      
      // Testar query sem filtros de data
      console.log('🔍 Testando query SEM filtros de data...')
      const { data: testData, error: testError } = await supabase
        .from('EnvioCashTemTotal')
        .select('Rede_de_loja, Envio_novo')
        .limit(5)
      
      if (testError) {
        console.error('❌ Erro na query de teste:', testError)
      } else {
        console.log('📊 Dados de teste (sem filtros):', testData?.length || 0, 'registros')
        if (testData && testData.length > 0) {
          console.log('📊 Primeiros registros de teste:')
          testData.forEach((item, index) => {
            console.log(`   ${index + 1}. Rede: "${item.Rede_de_loja}", Data: "${item.Envio_novo}"`)
          })
        }
      }
    }

    if (!allData || allData.length === 0) {
      console.log('📭 Nenhum dado encontrado no período')
      return []
    }

    // ANÁLISE DOS DADOS BRUTOS
    console.log('🔍 ANÁLISE DOS DADOS BRUTOS:')
    const validData = allData.filter(item => item && typeof item === 'object' && 'Rede_de_loja' in item) as any[]
    const todasAsRedes = [...new Set(validData.map(item => item.Rede_de_loja).filter(Boolean))]
    console.log('   Todas as redes encontradas:', todasAsRedes)
    
    const contadorPorRede = validData.reduce((acc, item) => {
      const rede = item.Rede_de_loja || 'SEM_REDE'
      acc[rede] = (acc[rede] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('   Distribuição por rede:', contadorPorRede)
    
    // DIAGNÓSTICO DETALHADO
    console.log('🔍 DIAGNÓSTICO DETALHADO:')
    console.log('   Rede do usuário para comparação:', userNetwork)
    console.log('   Tipo da rede do usuário:', typeof userNetwork)
    console.log('   Primeiros 3 registros com suas redes:')
    validData.slice(0, 3).forEach((item, index) => {
      console.log(`     ${index + 1}. Rede: "${item.Rede_de_loja}" (tipo: ${typeof item.Rede_de_loja})`)
      console.log(`        Comparação: "${item.Rede_de_loja}" === "${userNetwork}" = ${item.Rede_de_loja === userNetwork}`)
    })

    // AGORA APLICAR O FILTRO MANUALMENTE
    console.log('🎯 Aplicando filtro manual para rede:', userNetwork)
    console.log('🎯 Gerando relatório de cashback. Empresa do user:', userNetwork)
    
    const dadosFiltrados = validData.filter(item => {
      const redeDoItem = item.Rede_de_loja
      const pertenceAoUsuario = redeDoItem === userNetwork
      
      if (!pertenceAoUsuario) {
        console.log('🚫 Removendo item de rede diferente:', {
          redeItem: redeDoItem,
          redeUsuario: userNetwork,
          nome: item.Nome || 'N/A'
        })
      }
      
      return pertenceAoUsuario
    })

    console.log('✅ Filtro manual aplicado:')
    console.log('   Total original:', validData.length)
    console.log('   Total filtrado:', dadosFiltrados.length)
    console.log('   Removidos:', validData.length - dadosFiltrados.length)

    // Verificação final
    if (dadosFiltrados.length > 0) {
      const redesFinais = [...new Set(dadosFiltrados.map(item => item.Rede_de_loja).filter(Boolean))]
      console.log('🔒 Verificação final - Redes nos dados filtrados:', redesFinais)
      
      if (redesFinais.length > 1) {
        console.error('🚨 ERRO: Ainda há múltiplas redes após filtro!', redesFinais)
      } else if (redesFinais.length === 1 && redesFinais[0] === userNetwork) {
        console.log('✅ SUCESSO: Apenas dados da rede correta')
      }

      // VERIFICAÇÃO ESPECÍFICA DOS NOMES DOS CLIENTES
      console.log('🔍 Verificando integridade dos nomes dos clientes:')
      dadosFiltrados.slice(0, 3).forEach((item, index) => {
        const nome = item.Nome
        console.log(`   ${index + 1}. Nome: "${nome}"`)
        console.log(`      Tipo: ${typeof nome}`)
        console.log(`      Tamanho: ${nome?.length || 0}`)
        console.log(`      Bytes: ${nome ? new TextEncoder().encode(nome).length : 0}`)
        if (nome) {
          console.log(`      Primeiro char: "${nome.charAt(0)}" (code: ${nome.charCodeAt(0)})`)
          console.log(`      Último char: "${nome.charAt(nome.length - 1)}" (code: ${nome.charCodeAt(nome.length - 1)})`)
        }
      })
    }

    return dadosFiltrados
  } catch (error) {
    console.error('💥 Erro na implementação de cashback:', error)
    return []
  }
}

// Função principal para ser usada pelas APIs
export const cashbackReportService = {
  async getCashbackReportData(params: {
    selectedFields: string[]
    startDate?: string
    endDate?: string
    request: Request
  }) {
    try {
      console.log('🔄 Buscando dados de cashback com autenticação...')
      console.log('📋 Campos selecionados:', params.selectedFields)
      console.log('📅 Período:', { startDate: params.startDate, endDate: params.endDate })

      // Obter empresa do usuário logado via cookie ps_session
      const cookies = params.request.headers.get('cookie') || ''
      console.log('🍪 Cookies recebidos')
      
      const sessionMatch = cookies.match(/ps_session=([^;]+)/)

      if (!sessionMatch) {
        console.error('❌ Sessão não encontrada')
        throw new Error('Usuário não autenticado')
      }

      const sessionValue = sessionMatch[1]
      const email = sessionValue.split('_')[0]
      console.log('📧 Email do usuário:', email)

      if (!email) {
        throw new Error('Email não encontrado na sessão')
      }

      // Buscar dados do usuário na tabela users para obter a empresa
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('empresa, rede')
        .eq('email', email)
        .eq('sistema', 'Praise Shot')
        .single()

      if (userError || !userData) {
        console.error('❌ Usuário não encontrado:', userError)
        throw new Error('Usuário não encontrado')
      }

      const userCompany = userData.empresa || userData.rede
      console.log('🏢 Empresa do usuário:', userCompany)

      if (!userCompany) {
        throw new Error('Empresa do usuário não encontrada')
      }

      // PRIMEIRO: Vamos testar sem filtros para ver se há dados na tabela
      console.log('🧪 TESTE 1: Buscando TODOS os dados da tabela EnvioCashTemTotal...')
      const { data: allData, error: allError } = await supabase
        .from('EnvioCashTemTotal')
        .select('*')
        .limit(10)

      if (allError) {
        console.error('❌ Erro ao buscar todos os dados:', allError)
      } else {
        console.log('📊 Total de registros na tabela (amostra):', allData?.length || 0)
        if (allData && allData.length > 0) {
          const validAllData = allData.filter(item => item && typeof item === 'object') as any[]
          if (validAllData.length > 0) {
            console.log('📊 Primeiro registro completo:', validAllData[0])
            console.log('📊 Status únicos encontrados:', [...new Set(validAllData.map(item => item.Status).filter(Boolean))])
            console.log('📊 Redes únicas encontradas:', [...new Set(validAllData.map(item => item.Rede_de_loja).filter(Boolean))])
          }
        }
      }

      // SEGUNDO: Buscar apenas com filtro de Status
      console.log('🧪 TESTE 2: Buscando apenas com Status = "Enviadas"...')
      const { data: statusData, error: statusError } = await supabase
        .from('EnvioCashTemTotal')
        .select('*')
        .eq('Status', 'Enviadas')
        .limit(10)

      if (statusError) {
        console.error('❌ Erro ao buscar por status:', statusError)
      } else {
        console.log('📊 Registros com Status "Enviadas":', statusData?.length || 0)
        if (statusData && statusData.length > 0) {
          console.log('📊 Primeiro registro com status Enviadas:', statusData[0])
        }
      }

      // TERCEIRO: Buscar com filtro de empresa
      console.log('🧪 TESTE 3: Buscando com Rede_de_loja =', userCompany)
      const { data: companyData, error: companyError } = await supabase
        .from('EnvioCashTemTotal')
        .select('*')
        .eq('Rede_de_loja', userCompany)
        .limit(10)

      if (companyError) {
        console.error('❌ Erro ao buscar por empresa:', companyError)
      } else {
        console.log('📊 Registros da empresa', userCompany + ':', companyData?.length || 0)
        if (companyData && companyData.length > 0) {
          console.log('📊 Primeiro registro da empresa:', companyData[0])
        }
      }

      // QUARTO: Buscar com ambos os filtros
      console.log('🧪 TESTE 4: Buscando com Status = "Enviadas" E Rede_de_loja =', userCompany)
      let query = supabase
        .from('EnvioCashTemTotal')
        .select(params.selectedFields.join(', '))
        .eq('Status', 'Enviadas')
        .eq('Rede_de_loja', userCompany)

      // Aplicar filtros de data se fornecidos
      if (params.startDate) {
        query = query.gte('Envio_novo', params.startDate)
        console.log('📅 Filtro data inicial:', params.startDate)
      }
      
      if (params.endDate) {
        query = query.lte('Envio_novo', params.endDate)
        console.log('📅 Filtro data final:', params.endDate)
      }

      // Ordenar por data mais recente
      query = query.order('Envio_novo', { ascending: false })
      
      // REMOVIDO: Limite removido para retornar todos os dados disponíveis

      console.log('🔍 EXECUTANDO QUERY COM FILTROS:')
      console.log('   Tabela: EnvioCashTemTotal')
      console.log('   Campos:', params.selectedFields.join(', '))
      console.log('   Status = "Enviadas"')
      console.log('   Rede_de_loja =', userCompany)
      console.log('   Data inicial >=', params.startDate || 'não definida')
      console.log('   Data final <=', params.endDate || 'não definida')
      console.log('   Ordenação: Envio_novo DESC')
      console.log('   SEM LIMITE - Todos os registros')
      
      const { data, error } = await query

      if (error) {
        console.error('❌ ERRO NA QUERY:', error)
        console.error('❌ Código do erro:', error.code)
        console.error('❌ Mensagem:', error.message)
        console.error('❌ Detalhes:', error.details)
        throw new Error(`Erro ao buscar dados: ${error.message}`)
      }

      console.log('✅ RESULTADO DA QUERY:')
      console.log('   Registros encontrados:', data?.length || 0)
      
      if (data && data.length > 0) {
        console.log('   Primeiro registro:', data[0])
        console.log('   Campos do primeiro registro:', Object.keys(data[0]))
      } else {
        console.log('   ⚠️ NENHUM DADO ENCONTRADO - Investigando...')
        
        // Vamos fazer uma query de teste sem filtros para ver se há dados na tabela
        console.log('🔍 TESTE: Buscando TODOS os dados da tabela (sem filtros)...')
        const { data: testData, error: testError } = await supabase
          .from('EnvioCashTemTotal')
          .select('*')
          .limit(5)
        
        if (testError) {
          console.error('❌ Erro na query de teste:', testError)
        } else {
          console.log('📊 Dados de teste encontrados:', testData?.length || 0)
          if (testData && testData.length > 0) {
            console.log('📊 Primeiro registro de teste:', testData[0])
            console.log('📊 Status disponíveis:', [...new Set(testData.map(item => item.Status))])
            console.log('📊 Redes disponíveis:', [...new Set(testData.map(item => item.Rede_de_loja))])
          }
        }
      }

      return {
        records: data || [],
        total: data?.length || 0
      }
    } catch (error) {
      console.error('💥 Erro no cashbackReportService:', error)
      throw error
    }
  }
}