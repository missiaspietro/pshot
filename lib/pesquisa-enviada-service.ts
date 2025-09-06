import { createClient } from './supabase-client'

// Função auxiliar para obter o usuário do localStorage
const getUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ps_user')
    return saved ? JSON.parse(saved) : null
  }
  return null
}

interface PesquisaEnviada {
  id: string;
  criado_em: string;
  telefone: string | null;
  nome: string | null;
  loja: string | null;
  rede: string | null;
  sub_rede: string | null;
  pergunta: string | null;
  vendedor: string | null;
  Caixa: string | null;
}

export const pesquisaEnviadaService = {
  // Buscar todas as pesquisas enviadas da empresa do usuário logado
  async getPesquisasEnviadas() {
    const user = getUserFromLocalStorage()
    
    if (!user) {
      return []
    }
    
    const empresa = user.empresa || user.rede;
    if (!empresa) {
      return []
    }
    
    try {
      const supabase = createClient()
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('pesquisas_enviadas')
        .select('*')
        .limit(1)
      
      if (sampleError) {
        return []
      }
      
      const hasEmpresa = sampleData.length > 0 && 'empresa' in sampleData[0]
      const hasRede = sampleData.length > 0 && 'rede' in sampleData[0]
      
      let query = supabase
        .from('pesquisas_enviadas')
        .select('*', { count: 'exact' })
        .order('criado_em', { ascending: true })
      
      // Calcular data de 6 meses atrás
      const seisMesesAtras = new Date()
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
      const dataFormatada = seisMesesAtras.toISOString().split('T')[0]
      
      query = query.gte('criado_em', dataFormatada)
      
      if (hasEmpresa) {
        query = query.eq('empresa', empresa)
      } else if (hasRede) {
        query = query.eq('rede', empresa)
      }
      
      const { data, error } = await query
      
      if (error) {
        throw new Error('Erro ao buscar pesquisas enviadas: ' + error.message)
      }
      
      return data as PesquisaEnviada[]
    } catch (error) {
      throw error
    }
  },
  
  // Processar dados para o gráfico
  async getDadosParaGrafico() {
    try {
      const pesquisas = await this.getPesquisasEnviadas()
      
      if (pesquisas.length === 0) {
        return { dados: [], lojas: [] }
      }
      
      // Agrupar por mês e loja
      const dadosAgrupados = pesquisas.reduce((acc: Record<string, Record<string, number>>, pesquisa) => {
        if (!pesquisa.loja || !pesquisa.criado_em) {
          return acc
        }
        
        const data = new Date(pesquisa.criado_em)
        const mes = data.toLocaleString('pt-BR', { month: 'long' })
        const mesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1)
        
        if (!acc[mesFormatado]) {
          acc[mesFormatado] = {}
        }
        
        if (!acc[mesFormatado][pesquisa.loja]) {
          acc[mesFormatado][pesquisa.loja] = 0
        }
        
        acc[mesFormatado][pesquisa.loja]++
        
        return acc
      }, {})
      
      // Converter para o formato esperado pelo gráfico
      const meses = Object.keys(dadosAgrupados)
      const lojas = Array.from(new Set(pesquisas.map(p => p.loja).filter(Boolean) as string[]))
      
      if (meses.length === 0 || lojas.length === 0) {
        return { dados: [], lojas: [] }
      }
      
      const dadosFormatados = meses.map(mes => {
        const mesDados: Record<string, any> = { mes }
        
        lojas.forEach(loja => {
          mesDados[loja] = dadosAgrupados[mes]?.[loja] || 0
        })
        
        return mesDados
      })
      
      return {
        dados: dadosFormatados,
        lojas
      }
    } catch (error) {
      return {
        dados: [],
        lojas: []
      }
    }
  }
}