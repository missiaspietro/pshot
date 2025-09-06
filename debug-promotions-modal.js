// Script para debugar o problema do modal de promoções
// Execute: node debug-promotions-modal.js

const { createClient } = require('@supabase/supabase-js')

// Usando variáveis de ambiente para configuração segura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
)

async function debugPromotionsData() {
  console.log('🔍 DEBUGANDO DADOS DE PROMOÇÕES')
  console.log('=====================================')

  try {
    // 1. Verificar se a tabela existe e tem dados
    console.log('\n1. Verificando se a tabela tem dados...')
    const { data: allData, error: allError } = await supabase
      .from('Relatorio Envio de Promoções')
      .select('*')
      .limit(5)

    if (allError) {
      console.error('❌ Erro ao buscar dados:', allError)
      return
    }

    console.log('✅ Total de registros encontrados:', allData?.length || 0)
    if (allData && allData.length > 0) {
      console.log('📋 Primeiro registro:', allData[0])
      console.log('📋 Campos disponíveis:', Object.keys(allData[0]))
    }

    // 2. Verificar valores únicos do campo "Rede"
    console.log('\n2. Verificando valores únicos do campo "Rede"...')
    const { data: redesData, error: redesError } = await supabase
      .from('Relatorio Envio de Promoções')
      .select('Rede')
      .not('Rede', 'is', null)

    if (redesError) {
      console.error('❌ Erro ao buscar redes:', redesError)
    } else {
      const redesUnicas = [...new Set(redesData.map(item => item.Rede))]
      console.log('🏢 Redes encontradas:', redesUnicas)
    }

    // 3. Testar filtro por uma rede específica
    if (redesData && redesData.length > 0) {
      const primeiraRede = redesData[0].Rede
      console.log(`\n3. Testando filtro pela rede: "${primeiraRede}"...`)
      
      const { data: filteredData, error: filteredError } = await supabase
        .from('Relatorio Envio de Promoções')
        .select('Cliente, Whatsapp, Loja, Enviado, Data_Envio')
        .eq('Rede', primeiraRede)
        .limit(10)

      if (filteredError) {
        console.error('❌ Erro ao filtrar por rede:', filteredError)
      } else {
        console.log('✅ Registros filtrados por rede:', filteredData?.length || 0)
        if (filteredData && filteredData.length > 0) {
          console.log('📋 Primeiro registro filtrado:', filteredData[0])
        }
      }
    }

    // 4. Verificar usuários na tabela users
    console.log('\n4. Verificando usuários na tabela users...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('email, empresa, rede, sistema')
      .eq('sistema', 'Praise Shot')
      .limit(5)

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
    } else {
      console.log('👥 Usuários encontrados:', usersData?.length || 0)
      if (usersData && usersData.length > 0) {
        usersData.forEach((user, index) => {
          console.log(`   ${index + 1}. Email: ${user.email}, Empresa: ${user.empresa}, Rede: ${user.rede}`)
        })
      }
    }

    // 5. Verificar se há correspondência entre usuários e dados de promoções
    if (usersData && usersData.length > 0 && redesData && redesData.length > 0) {
      console.log('\n5. Verificando correspondência entre usuários e dados...')
      
      for (const user of usersData) {
        const userEmpresa = user.rede || user.empresa
        if (userEmpresa) {
          const { data: userPromotions, error: userError } = await supabase
            .from('Relatorio Envio de Promoções')
            .select('*')
            .eq('Rede', userEmpresa)
            .limit(3)

          if (userError) {
            console.error(`❌ Erro para usuário ${user.email}:`, userError)
          } else {
            console.log(`📊 Usuário ${user.email} (${userEmpresa}): ${userPromotions?.length || 0} registros`)
          }
        }
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

debugPromotionsData()