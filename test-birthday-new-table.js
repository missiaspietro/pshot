// Script para testar a tabela relatorio_niver_decor_fabril
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testBirthdayTable() {
  console.log('🔄 Testando conexão com a tabela relatorio_niver_decor_fabril...')
  
  try {
    // 1. Verificar se a tabela existe e tem dados
    console.log('\n📊 1. Verificando estrutura da tabela...')
    const { data: allData, error: allError } = await supabase
      .from('relatorio_niver_decor_fabril')
      .select('*')
      .limit(5)
    
    if (allError) {
      console.error('❌ Erro ao acessar tabela:', allError)
      return
    }
    
    console.log('✅ Tabela acessível!')
    console.log('📈 Total de registros encontrados:', allData?.length || 0)
    
    if (allData && allData.length > 0) {
      console.log('📋 Estrutura do primeiro registro:')
      console.log(JSON.stringify(allData[0], null, 2))
      
      // 2. Verificar quais redes existem
      console.log('\n📊 2. Verificando redes disponíveis...')
      const { data: networks, error: networkError } = await supabase
        .from('relatorio_niver_decor_fabril')
        .select('rede')
        .not('rede', 'is', null)
      
      if (!networkError && networks) {
        const uniqueNetworks = [...new Set(networks.map(n => n.rede))]
        console.log('🏢 Redes encontradas:', uniqueNetworks)
      }
      
      // 3. Testar query com filtros
      console.log('\n📊 3. Testando query com filtros...')
      const testNetwork = allData[0].rede
      console.log('🎯 Testando com rede:', testNetwork)
      
      const { data: filteredData, error: filterError } = await supabase
        .from('relatorio_niver_decor_fabril')
        .select('id, criado_em, cliente, obs, rede, loja')
        .eq('rede', testNetwork)
        .order('criado_em', { ascending: false })
        .limit(3)
      
      if (!filterError && filteredData) {
        console.log('✅ Query com filtros funcionando!')
        console.log('📋 Dados filtrados:', filteredData.length, 'registros')
        filteredData.forEach((item, index) => {
          console.log(`   ${index + 1}. ID: ${item.id}, Data: ${item.criado_em}, Cliente: ${item.cliente}, Obs: ${item.obs}`)
        })
      } else {
        console.error('❌ Erro na query filtrada:', filterError)
      }
      
    } else {
      console.log('⚠️ Tabela vazia ou sem dados')
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error)
  }
}

// Executar teste
testBirthdayTable()