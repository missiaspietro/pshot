import { supabase } from './supabase'

export interface CashbackData {
  mes: string
  [key: string]: string | number // Para permitir propriedades dinâmicas das lojas
}

export async function getCashbackData(empresa: string): Promise<{ data: CashbackData[], lojas: string[] }> {
  try {
    // Calcula exatamente os últimos 6 meses completos
    const currentDate = new Date()
    const startOfPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)
    const endOfPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    const startDate = startOfPeriod.toISOString().split('T')[0]
    const endDate = endOfPeriod.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('EnvioCashTemTotal')
      .select('Loja, Envio_novo, Status, Rede_de_loja')
      .eq('Status', 'Enviada')
      .eq('Rede_de_loja', empresa)
      .gte('Envio_novo', startDate)
      .lte('Envio_novo', endDate)

    if (error) {
      return { data: [], lojas: [] }
    }

    if (!data || data.length === 0) {
      return { data: [], lojas: [] }
    }

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

    return { data: result, lojas: lojasArray }
  } catch (error) {
    return { data: [], lojas: [] }
  }
}