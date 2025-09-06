// Script para debugar por que nenhum dado está aparecendo
// Execute com: node debug-nenhum-dado.js

const { createClient } = require('@supabase/supabase-js')

// Configure suas variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugNenhumDado() {
  console.log('🔍 Investigando por que nenhum dado está aparecendo...\n')

  try {
    // 1. Verificar se a tabela existe e tem dados
    console.log('1️⃣ Verificando se a tabela relatorio_niver_decor_fabril existe e tem dados...')
    const { data: allData, error: allError, count } = await supabase
      .from('relatorio_niver_decor_fabril')
      .select('*', { count: 'exact' })
      .limit(5)

    if (allError) {
      console.error('❌ Erro ao acessar tabela:', allError)
      return
    }

    console.log(`📊 Total de registros na tabela: ${count}`)
    console.log(`📊 Primeiros 5 registros:`)
    allData?.forEach((item, index) => {
      console.log(`   ${index + 1}. ID: ${item.id}, Rede: "${item.rede}", Cliente: "${item.cliente}", Data: ${item.criado_em}`)
    })

    if (!allData || allData.length === 0) {
      console.log('❌ A tabela está vazia!')
      return
    }

    // 2. Verificar redes disponíveis
    console.log('\n2️⃣ Verificando redes disponíveis...')
    const { data: networks } = await supabase
      .from('relatorio_niver_decor_fabril')
      .select('rede')
      .not('rede', 'is', null)

    const uniqueNetworks = [...new Set(networks?.map(n => n.rede) || [])]
    console.log('📊 Redes únicas encontradas:', uniqueNetworks)

    // 3. Verificar usuários na tabela users
    console.log('\n3️⃣ Verificando usuários na tabela users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, empresa, rede, sistema')
      .eq('sistema', 'Praise Shot')
      .limit(5)

    if (usersError) {
      console.error('❌ Erro ao acessar tabela users:', usersError)
    } else {
      console.log('📊 Usuários encontrados:')
      users?.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}, Empresa: "${user.empresa}", Rede: "${user.rede}"`)
      })
    }

    // 4. Verificar correspondência entre redes
    console.log('\n4️⃣ Verificando correspondência entre redes...')
    if (users && users.length > 0) {
      users.forEach((user, index) => {
        const userNetwork = user.rede || user.empresa
        const hasMatch = uniqueNetworks.includes(userNetwork)
        console.log(`   ${index + 1}. Usuário: ${user.email}`)
        console.log(`      Rede/Empresa: "${userNetwork}"`)
        console.log(`      Tem dados na tabela de relatórios: ${hasMatch ? '✅ SIM' : '❌ NÃO'}`)
      })
    }

    // 5. Testar filtros de data
    console.log('\n5️⃣ Testando filtros de data...')
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    const startDate = lastMonth.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]

    console.log(`📅 Testando período: ${startDate} até ${endDate}`)

    const { data: dateFiltered, error: dateError } = await supabase
      .from('relatorio_niver_decor_fabril')
      .select('criado_em, rede, cliente')
      .gte('criado_em', startDate)
      .lte('criado_em', endDate)
      .limit(10)

    if (dateError) {
      console.error('❌ Erro no filtro de data:', dateError)
    } else {
      console.log(`📊 Registros no período: ${dateFiltered?.length || 0}`)
      dateFiltered?.forEach((item, index) => {
        console.log(`   ${index + 1}. Data: ${item.criado_em}, Rede: "${item.rede}", Cliente: "${item.cliente}"`)
      })
    }

    // 6. Testar query completa como na aplicação
    console.log('\n6️⃣ Testando query completa como na aplicação...')
    if (uniqueNetworks.length > 0) {
      const testNetwork = uniqueNetworks[0]
      console.log(`🧪 Testando com rede: "${testNetwork}"`)

      const { data: fullTest, error: fullError } = await supabase
        .from('relatorio_niver_decor_fabril')
        .select('criado_em, cliente, whatsApp, rede, loja')
        .gte('criado_em', startDate)
        .lte('criado_em', endDate)
        .order('criado_em', { ascending: false })

      if (fullError) {
        console.error('❌ Erro na query completa:', fullError)
      } else {
        console.log(`📊 Dados brutos (sem filtro de rede): ${fullTest?.length || 0}`)
        
        // Aplicar filtro manual
        const filtered = fullTest?.filter(item => item.rede === testNetwork) || []
        console.log(`📊 Dados após filtro de rede "${testNetwork}": ${filtered.length}`)
        
        if (filtered.length > 0) {
          console.log('📊 Primeiros registros filtrados:')
          filtered.slice(0, 3).forEach((item, index) => {
            console.log(`   ${index + 1}. Cliente: "${item.cliente}", Rede: "${item.rede}"`)
          })
        }
      }
    }

  } catch (error) {
    console.error('💥 Erro durante debug:', error)
  }
}

// Executar debug
debugNenhumDado()