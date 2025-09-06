// Teste específico para debugar o problema das datas no cashback
// Execute este arquivo com: node test-cashback-dates-debug.js

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase (use as mesmas variáveis do seu .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'sua_url_aqui'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sua_chave_aqui'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCashbackDates() {
  console.log('🔍 DEBUG: Investigando problema das datas no cashback')
  
  try {
    // 1. Verificar estrutura da tabela
    console.log('\n📊 1. Verificando estrutura da tabela EnvioCashTemTotal...')
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('EnvioCashTemTotal')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.error('❌ Erro ao buscar dados de exemplo:', sampleError)
      return
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ Estrutura da tabela (primeiro registro):')
      console.log('   Campos disponíveis:', Object.keys(sampleData[0]))
      console.log('   Exemplo de Envio_novo:', sampleData[0].Envio_novo)
      console.log('   Tipo de Envio_novo:', typeof sampleData[0].Envio_novo)
    }
    
    // 2. Verificar distribuição de datas
    console.log('\n📅 2. Verificando distribuição de datas...')
    
    const { data: dateData, error: dateError } = await supabase
      .from('EnvioCashTemTotal')
      .select('Envio_novo')
      .not('Envio_novo', 'is', null)
      .order('Envio_novo', { ascending: false })
      .limit(100)
    
    if (dateError) {
      console.error('❌ Erro ao buscar datas:', dateError)
    } else if (dateData && dateData.length > 0) {
      console.log('✅ Distribuição de datas (últimas 10):')
      dateData.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.Envio_novo}`)
      })
      
      console.log(`\n📊 Data mais recente: ${dateData[0].Envio_novo}`)
      console.log(`📊 Data mais antiga (dos 100 últimos): ${dateData[dateData.length - 1].Envio_novo}`)
    }
    
    // 3. Testar filtros de data específicos
    console.log('\n🧪 3. Testando filtros de data específicos...')
    
    const testPeriods = [
      { name: 'Últimos 30 dias', startDate: '2024-11-01', endDate: '2024-11-30' },
      { name: 'Últimos 3 meses', startDate: '2024-09-01', endDate: '2024-11-30' },
      { name: 'Ano de 2024', startDate: '2024-01-01', endDate: '2024-12-31' },
      { name: 'Ano de 2023', startDate: '2023-01-01', endDate: '2023-12-31' }
    ]
    
    for (const period of testPeriods) {
      console.log(`\n   🔍 Testando: ${period.name}`)
      console.log(`      Período: ${period.startDate} até ${period.endDate}`)
      
      const { data: periodData, error: periodError } = await supabase
        .from('EnvioCashTemTotal')
        .select('Envio_novo, Nome, Loja, Status')
        .gte('Envio_novo', period.startDate)
        .lte('Envio_novo', period.endDate)
        .limit(10)
      
      if (periodError) {
        console.log(`      ❌ Erro: ${periodError.message}`)
      } else {
        console.log(`      ✅ Encontrados: ${periodData?.length || 0} registros`)
        if (periodData && periodData.length > 0) {
          console.log(`      📅 Primeira data: ${periodData[0].Envio_novo}`)
          console.log(`      📅 Última data: ${periodData[periodData.length - 1].Envio_novo}`)
        }
      }
    }
    
    // 4. Verificar se há dados sem filtro de data
    console.log('\n🔍 4. Verificando dados sem filtro de data...')
    
    const { data: allData, error: allError } = await supabase
      .from('EnvioCashTemTotal')
      .select('Envio_novo, Nome, Loja, Status')
      .order('Envio_novo', { ascending: false })
      .limit(20)
    
    if (allError) {
      console.error('❌ Erro ao buscar todos os dados:', allError)
    } else if (allData && allData.length > 0) {
      console.log('✅ Dados sem filtro (últimos 20):')
      allData.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.Envio_novo} - ${item.Nome} - Loja: ${item.Loja}`)
      })
    }
    
    // 5. Verificar empresas disponíveis
    console.log('\n🏢 5. Verificando empresas disponíveis...')
    
    const { data: companies, error: companiesError } = await supabase
      .from('EnvioCashTemTotal')
      .select('Rede_de_loja')
      .not('Rede_de_loja', 'is', null)
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError)
    } else if (companies && companies.length > 0) {
      const uniqueCompanies = [...new Set(companies.map(c => c.Rede_de_loja))]
      console.log('✅ Empresas encontradas:')
      uniqueCompanies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company}`)
      })
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

// Executar o debug
debugCashbackDates()