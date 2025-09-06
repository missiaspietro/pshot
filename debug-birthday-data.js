// Script para debugar os dados de aniversários e verificar o problema de filtro
// Execute com: node debug-birthday-data.js

const { createClient } = require('@supabase/supabase-js')

// Configure suas variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugBirthdayData() {
  console.log('🔍 Investigando dados de aniversários...\n')

  try {
    // 1. Verificar todas as redes disponíveis
    console.log('1️⃣ Verificando redes disponíveis...')
    const { data: networks, error: networkError } = await supabase
      .from('relatorio_niver_decor_fabril')
      .select('rede')
      .not('rede', 'is', null)

    if (networkError) {
      console.error('❌ Erro ao buscar redes:', networkError)
      return
    }

    const uniqueNetworks = [...new Set(networks.map(n => n.rede))]
    console.log('📊 Redes encontradas:', uniqueNetworks)
    console.log('📊 Total de redes:', uniqueNetworks.length)

    // 2. Contar registros por rede
    console.log('\n2️⃣ Contando registros por rede...')
    for (const network of uniqueNetworks) {
      const { data, error } = await supabase
        .from('relatorio_niver_decor_fabril')
        .select('id')
        .eq('rede', network)

      if (!error) {
        console.log(`   ${network}: ${data.length} registros`)
      }
    }

    // 3. Verificar usuário mock na tabela users
    console.log('\n3️⃣ Verificando usuário mock...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, rede, empresa')
      .eq('id', 1)
      .single()

    if (userError) {
      console.log('⚠️ Usuário mock não encontrado na tabela users')
      console.log('   Isso pode causar o problema de filtro!')
    } else {
      console.log('✅ Usuário mock encontrado:', userData)
    }

    // 4. Testar query com filtro específico
    console.log('\n4️⃣ Testando query com filtro...')
    const testNetwork = uniqueNetworks[0] // Usar primeira rede para teste
    
    const { data: filteredData, error: filterError } = await supabase
      .from('relatorio_niver_decor_fabril')
      .select('rede, criado_em, cliente')
      .eq('rede', testNetwork)
      .limit(5)

    if (filterError) {
      console.error('❌ Erro na query filtrada:', filterError)
    } else {
      console.log(`✅ Query filtrada funcionando para rede "${testNetwork}":`)
      filteredData.forEach((item, index) => {
        console.log(`   ${index + 1}. Rede: ${item.rede}, Cliente: ${item.cliente}`)
      })
    }

    // 5. Testar query SEM filtro (para comparar)
    console.log('\n5️⃣ Testando query SEM filtro...')
    const { data: unfilteredData, error: unfilteredError } = await supabase
      .from('relatorio_niver_decor_fabril')
      .select('rede, criado_em, cliente')
      .limit(10)

    if (unfilteredError) {
      console.error('❌ Erro na query sem filtro:', unfilteredError)
    } else {
      console.log('⚠️ Query SEM filtro (PERIGOSO):')
      const redesEncontradas = [...new Set(unfilteredData.map(item => item.rede))]
      console.log('   Redes nos primeiros 10 registros:', redesEncontradas)
      
      if (redesEncontradas.length > 1) {
        console.log('🚨 CONFIRMADO: Existem dados de múltiplas redes!')
      }
    }

  } catch (error) {
    console.error('💥 Erro durante debug:', error)
  }
}

// Executar debug
debugBirthdayData()