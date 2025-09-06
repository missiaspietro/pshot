import { supabase } from './supabase'
import { getCachedData, setCachedData } from './dashboard-optimizations'

export interface BirthdayReportData {
  name: string
  valor: number
}

export interface DetailedBirthdayReportData {
  mes: string
  [loja: string]: string | number
}

export interface CustomBirthdayReportData {
  [key: string]: any
}

export interface BirthdayReportFilters {
  selectedFields: string[]
  startDate?: string
  endDate?: string
  userNetwork: string
}

export async function getBirthdayReportByStore(empresa: string): Promise<BirthdayReportData[]> {
  try {
    // Verifica cache primeiro
    const cacheKey = `birthday-6m-${empresa}`
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
      .from('relatorio_niver_decor_fabril')
      .select('loja, criado_em')
      .eq('mensagem_entrege', 'sim')
      .eq('rede', empresa)
      .gte('criado_em', startDate)
      .lte('criado_em', endDate)

    if (error) {
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Agrupa os dados por loja e conta quantos registros cada loja tem
    const storeCount: { [key: string]: number } = {}

    data.forEach((item) => {
      const store = item.loja || 'Sem Loja'
      storeCount[store] = (storeCount[store] || 0) + 1
    })

    // Converte para o formato esperado pelo gráfico
    const result: BirthdayReportData[] = Object.entries(storeCount)
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

export async function getDetailedBirthdayReportByStore(empresa: string): Promise<DetailedBirthdayReportData[]> {
  try {
    // Verifica cache primeiro
    const cacheKey = `birthday-detailed-6m-${empresa}`
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
      .from('relatorio_niver_decor_fabril')
      .select('loja, criado_em')
      .eq('mensagem_entrege', 'sim')
      .eq('rede', empresa)
      .gte('criado_em', startDate)
      .lte('criado_em', endDate)
      .order('criado_em', { ascending: true })

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
      if (item.loja) {
        const loja = item.loja.toString().trim()
        lojasSet.add(loja)
      }
    })

    // Agrupar os dados por mês
    data.forEach(item => {
      if (!item.criado_em || !item.loja) return

      const date = new Date(item.criado_em)
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      const loja = item.loja.toString().trim()

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
    const mesesArray: DetailedBirthdayReportData[] = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setMonth(currentDate.getMonth() - i)

      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      const mesFormatado = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

      const obj: DetailedBirthdayReportData = {
        mes: mesFormatado
      } as DetailedBirthdayReportData

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

export async function getCustomBirthdayReport(filters: BirthdayReportFilters): Promise<CustomBirthdayReportData[]> {
  try {
    const { selectedFields, startDate, endDate, userNetwork } = filters

    console.log('🔄 NOVA IMPLEMENTAÇÃO - Service iniciado com filtros:', filters)

    // Validação básica
    if (!selectedFields || selectedFields.length === 0) {
      console.log('❌ Campos não selecionados')
      return []
    }

    // PRIMEIRA ABORDAGEM: Buscar TODOS os dados sem filtro e depois filtrar manualmente
    console.log('📊 Buscando TODOS os dados da tabela (sem filtro inicial)...')
    
    let query = supabase
      .from('relatorio_niver_decor_fabril')
      .select(selectedFields.join(', '))

    // Aplicar apenas filtros de data
    if (startDate) {
      query = query.gte('criado_em', startDate)
      console.log('📅 Filtro data inicial aplicado:', startDate)
    }
    
    if (endDate) {
      query = query.lte('criado_em', endDate)
      console.log('📅 Filtro data final aplicado:', endDate)
    }

    // Ordenar por data
    query = query.order('criado_em', { ascending: false })

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
        .from('relatorio_niver_decor_fabril')
        .select('rede, criado_em')
        .limit(5)
      
      if (testError) {
        console.error('❌ Erro na query de teste:', testError)
      } else {
        console.log('📊 Dados de teste (sem filtros):', testData?.length || 0, 'registros')
        if (testData && testData.length > 0) {
          console.log('📊 Primeiros registros de teste:')
          testData.forEach((item, index) => {
            console.log(`   ${index + 1}. Rede: "${item.rede}", Data: "${item.criado_em}"`)
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
    const validData = allData.filter(item => item && typeof item === 'object' && 'rede' in item) as any[]
    const todasAsRedes = [...new Set(validData.map(item => item.rede).filter(Boolean))]
    console.log('   Todas as redes encontradas:', todasAsRedes)
    
    const contadorPorRede = validData.reduce((acc, item) => {
      const rede = item.rede || 'SEM_REDE'
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
      console.log(`     ${index + 1}. Rede: "${item.rede}" (tipo: ${typeof item.rede})`)
      console.log(`        Comparação: "${item.rede}" === "${userNetwork}" = ${item.rede === userNetwork}`)
    })

    // AGORA APLICAR O FILTRO MANUALMENTE
    console.log('🎯 Aplicando filtro manual para rede:', userNetwork)
    console.log('🎯 Gerando relatório. Empresa do user:', userNetwork)
    
    const dadosFiltrados = validData.filter(item => {
      const redeDoItem = item.rede
      const pertenceAoUsuario = redeDoItem === userNetwork
      
      if (!pertenceAoUsuario) {
        console.log('🚫 Removendo item de rede diferente:', {
          redeItem: redeDoItem,
          redeUsuario: userNetwork,
          cliente: item.cliente || 'N/A'
        })
      }
      
      return pertenceAoUsuario
    })

    console.log('✅ Filtro manual aplicado:')
    console.log('   Total original:', allData.length)
    console.log('   Total filtrado:', dadosFiltrados.length)
    console.log('   Removidos:', allData.length - dadosFiltrados.length)

    // Verificação final
    if (dadosFiltrados.length > 0) {
      const redesFinais = [...new Set(dadosFiltrados.map(item => item.rede).filter(Boolean))]
      console.log('🔒 Verificação final - Redes nos dados filtrados:', redesFinais)
      
      if (redesFinais.length > 1) {
        console.error('🚨 ERRO: Ainda há múltiplas redes após filtro!', redesFinais)
      } else if (redesFinais.length === 1 && redesFinais[0] === userNetwork) {
        console.log('✅ SUCESSO: Apenas dados da rede correta')
      }

      // VERIFICAÇÃO ESPECÍFICA DOS NOMES DOS CLIENTES
      console.log('🔍 Verificando integridade dos nomes dos clientes:')
      dadosFiltrados.slice(0, 3).forEach((item, index) => {
        const cliente = item.cliente
        console.log(`   ${index + 1}. Cliente: "${cliente}"`)
        console.log(`      Tipo: ${typeof cliente}`)
        console.log(`      Tamanho: ${cliente?.length || 0}`)
        console.log(`      Bytes: ${cliente ? new TextEncoder().encode(cliente).length : 0}`)
        if (cliente) {
          console.log(`      Primeiro char: "${cliente.charAt(0)}" (code: ${cliente.charCodeAt(0)})`)
          console.log(`      Último char: "${cliente.charAt(cliente.length - 1)}" (code: ${cliente.charCodeAt(cliente.length - 1)})`)
        }
      })
    }

    return dadosFiltrados
  } catch (error) {
    console.error('💥 Erro na nova implementação:', error)
    return []
  }
}