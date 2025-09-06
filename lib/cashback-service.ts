import { supabase } from './supabase'

export interface CashbackData {
  mes: string
  [key: string]: string | number // Para permitir propriedades dinâmicas das lojas
}

export async function getCashbackData(
  empresa: string, 
  startDate?: string, 
  endDate?: string
): Promise<{ data: CashbackData[], lojas: string[] }> {
  try {
    // Validação do parâmetro empresa
    if (!empresa || typeof empresa !== 'string' || empresa.trim() === '') {
      console.error('❌ Erro no getCashbackData: Parâmetro empresa é obrigatório e deve ser uma string válida')
      throw new Error('Parâmetro empresa é obrigatório para filtrar dados de cashback')
    }

    // Validação das datas se fornecidas
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('❌ Erro no getCashbackData: Datas fornecidas são inválidas', { startDate, endDate })
        throw new Error('Datas fornecidas são inválidas')
      }
      
      if (start > end) {
        console.error('❌ Erro no getCashbackData: Data inicial não pode ser posterior à data final', { startDate, endDate })
        throw new Error('Data inicial não pode ser posterior à data final')
      }
    }

    // Se não foram fornecidas datas, usar os últimos 6 meses completos
    let queryStartDate: string
    let queryEndDate: string
    
    if (startDate && endDate) {
      queryStartDate = startDate
      queryEndDate = endDate
    } else {
      // Calcula exatamente os últimos 6 meses completos
      const currentDate = new Date()
      const startOfPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)
      const endOfPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      queryStartDate = startOfPeriod.toISOString().split('T')[0]
      queryEndDate = endOfPeriod.toISOString().split('T')[0]
    }

    console.log('📊 Buscando dados de cashback para dashboard:', {
      empresa: empresa.trim(),
      startDate: queryStartDate,
      endDate: queryEndDate,
      filtroPersonalizado: !!(startDate && endDate)
    })

    const { data, error } = await supabase
      .from('EnvioCashTemTotal')
      .select('Loja, Envio_novo, Status, Rede_de_loja')
      .eq('Status', 'Enviada')
      .eq('Rede_de_loja', empresa.trim())
      .gte('Envio_novo', queryStartDate)
      .lte('Envio_novo', queryEndDate)

    if (error) {
      console.error('❌ Erro na consulta Supabase para dados de cashback:', {
        error: error.message,
        empresa: empresa.trim(),
        startDate: queryStartDate,
        endDate: queryEndDate
      })
      throw new Error(`Erro ao buscar dados de cashback: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ Nenhum dado de cashback encontrado para os filtros aplicados:', {
        empresa: empresa.trim(),
        startDate: queryStartDate,
        endDate: queryEndDate
      })
      return { data: [], lojas: [] }
    }

    console.log('✅ Dados de cashback encontrados:', {
      empresa: empresa.trim(),
      totalRegistros: data.length,
      startDate: queryStartDate,
      endDate: queryEndDate
    })

    // Agrupa os dados por mês e loja e coleta lojas únicas
    const groupedData: { [key: string]: { [loja: string]: number } } = {}
    const lojasUnicas = new Set<string>()

    data.forEach((item) => {
      if (!item.Envio_novo) return

      const date = new Date(item.Envio_novo)
      const monthKey = `${date.toLocaleString('pt-BR', { month: 'long' })} ${date.getFullYear()}`
      const loja = item.Loja || 'Sem Loja'

      lojasUnicas.add(loja)

      if (!groupedData[monthKey]) {
        groupedData[monthKey] = {}
      }

      groupedData[monthKey][loja] = (groupedData[monthKey][loja] || 0) + 1
    })

    // Converte para o formato esperado pelo gráfico
    const result: CashbackData[] = Object.entries(groupedData)
      .map(([mes, lojas]) => {
        const monthData: CashbackData = { mes }

        Object.entries(lojas).forEach(([loja, count]) => {
          monthData[`loja${loja}`] = count
        })

        return monthData
      })
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split(' ')
        const [mesB, anoB] = b.mes.split(' ')

        const yearDiff = parseInt(anoA) - parseInt(anoB)
        if (yearDiff !== 0) return yearDiff

        const meses = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ]

        const indexA = meses.indexOf(mesA.toLowerCase())
        const indexB = meses.indexOf(mesB.toLowerCase())

        return indexA - indexB
      })

    const lojasArray = Array.from(lojasUnicas).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }

      return a.localeCompare(b)
    })

    console.log('✅ Processamento de dados de cashback concluído:', {
      empresa: empresa.trim(),
      totalMeses: result.length,
      totalLojas: lojasArray.length,
      lojas: lojasArray
    })

    return { data: result, lojas: lojasArray }
  } catch (error) {
    console.error('❌ Erro geral no getCashbackData:', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      empresa,
      startDate,
      endDate
    })
    
    // Re-throw o erro para que o componente possa tratá-lo adequadamente
    throw error
  }
}