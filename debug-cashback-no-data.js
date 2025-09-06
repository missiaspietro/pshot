/**
 * Script de debug para investigar problema de "nenhum dado encontrado" no cashback
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugCashbackNoData() {
  console.log('🔍 INVESTIGAÇÃO: Problema de "nenhum dado encontrado" no cashback')
  console.log('=' .repeat(80))

  try {
    // 1. Verificar se a tabela EnvioCashTemTotal existe e tem dados
    console.log('1️⃣ Verificando se a tabela EnvioCashTemTotal existe...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('EnvioCashTemTotal')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ ERRO: Tabela não existe ou não acessível:', tableError.message)
      return
    }

    if (!tableCheck || tableCheck.length === 0) {
      console.error('❌ PROBLEMA: Tabela existe mas está vazia!')
      return
    }

    console.log('✅ Tabela existe e tem dados')
    console.log('📊 Exemplo de registro:', tableCheck[0])

    // 2. Verificar estrutura da tabela
    console.log('\n2️⃣ Verificando estrutura da tabela...')
    const { data: structure, error: structureError } = await supabase
      .from('EnvioCashTemTotal')
      .select('*')
      .limit(5)

    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError.message)
    } else {
      console.log('📋 Campos disponíveis:', Object.keys(structure[0] || {}))
      console.log('📊 Total de registros na amostra:', structure.length)
    }

    // 3. Verificar empresas/redes disponíveis
    console.log('\n3️⃣ Verificando empresas/redes disponíveis...')
    const { data: companies, error: companiesError } = await supabase
      .from('EnvioCashTemTotal')
      .select('Rede_de_loja')
      .not('Rede_de_loja', 'is', null)

    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError.message)
    } else {
      const uniqueCompanies = [...new Set(companies.map(c => c.Rede_de_loja))]
      console.log('🏢 Empresas únicas encontradas:', uniqueCompanies.length)
      console.log('📋 Lista de empresas:')
      uniqueCompanies.slice(0, 10).forEach((company, index) => {
        console.log(`   ${index + 1}. "${company}"`)
      })
      
      if (uniqueCompanies.length > 10) {
        console.log(`   ... e mais ${uniqueCompanies.length - 10} empresas`)
      }
    }

    // 4. Verificar usuários na tabela users
    console.log('\n4️⃣ Verificando usuários na tabela users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, nome, empresa, rede, sistema')
      .eq('sistema', 'Praise Shot')
      .limit(10)

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message)
    } else {
      console.log('👥 Usuários encontrados:', users.length)
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - Empresa: "${user.empresa}" - Rede: "${user.rede}"`)
      })
    }

    // 5. Verificar correspondência entre usuários e dados de cashback
    console.log('\n5️⃣ Verificando correspondência entre usuários e dados de cashback...')
    if (users && users.length > 0) {
      for (const user of users.slice(0, 3)) { // Testar apenas os primeiros 3 usuários
        const userEmpresa = user.rede || user.empresa
        console.log(`\n🔍 Testando usuário: ${user.email} (Empresa: "${userEmpresa}")`)
        
        if (!userEmpresa) {
          console.log('   ⚠️ Usuário sem empresa/rede definida')
          continue
        }

        // Buscar dados de cashback para este usuário
        const { data: cashbackData, error: cashbackError } = await supabase
          .from('EnvioCashTemTotal')
          .select('*')
          .eq('Rede_de_loja', userEmpresa)
          .limit(5)

        if (cashbackError) {
          console.log('   ❌ Erro ao buscar dados:', cashbackError.message)
        } else if (!cashbackData || cashbackData.length === 0) {
          console.log('   ❌ PROBLEMA: Nenhum dado encontrado para esta empresa!')
          
          // Verificar se existe empresa similar
          const { data: similarCompanies, error: similarError } = await supabase
            .from('EnvioCashTemTotal')
            .select('Rede_de_loja')
            .ilike('Rede_de_loja', `%${userEmpresa}%`)
            .limit(5)

          if (!similarError && similarCompanies && similarCompanies.length > 0) {
            console.log('   🔍 Empresas similares encontradas:')
            similarCompanies.forEach(comp => {
              console.log(`      - "${comp.Rede_de_loja}"`)
            })
          }
        } else {
          console.log('   ✅ Dados encontrados:', cashbackData.length, 'registros')
          console.log('   📊 Exemplo:', {
            Nome: cashbackData[0].Nome,
            Status: cashbackData[0].Status,
            Envio_novo: cashbackData[0].Envio_novo
          })
        }
      }
    }

    // 6. Verificar dados recentes
    console.log('\n6️⃣ Verificando dados recentes...')
    const { data: recentData, error: recentError } = await supabase
      .from('EnvioCashTemTotal')
      .select('Rede_de_loja, Envio_novo, Status')
      .not('Envio_novo', 'is', null)
      .order('Envio_novo', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('❌ Erro ao buscar dados recentes:', recentError.message)
    } else {
      console.log('📅 Dados mais recentes:')
      recentData.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.Rede_de_loja} - ${item.Envio_novo} - ${item.Status}`)
      })
    }

    // 7. Verificar distribuição por status
    console.log('\n7️⃣ Verificando distribuição por status...')
    const { data: statusData, error: statusError } = await supabase
      .from('EnvioCashTemTotal')
      .select('Status')

    if (statusError) {
      console.error('❌ Erro ao buscar status:', statusError.message)
    } else {
      const statusCount = statusData.reduce((acc, item) => {
        const status = item.Status || 'NULL'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
      
      console.log('📊 Distribuição por status:')
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} registros`)
      })
    }

    // 8. Testar query específica como a API faz
    console.log('\n8️⃣ Testando query específica como a API faz...')
    
    // Simular uma empresa comum
    const uniqueCompanies = [...new Set(companies.map(c => c.Rede_de_loja))]
    const testEmpresa = uniqueCompanies[0] // Usar a primeira empresa encontrada
    if (testEmpresa) {
      console.log(`🧪 Testando com empresa: "${testEmpresa}"`)
      
      const testFields = ['Nome', 'Whatsapp', 'Loja', 'Status', 'Envio_novo', 'id']
      
      const { data: testData, error: testError } = await supabase
        .from('EnvioCashTemTotal')
        .select(testFields.join(', '))
        .eq('Rede_de_loja', testEmpresa)
        .order('Envio_novo', { ascending: false })
        .order('id', { ascending: false })
        .limit(10)

      if (testError) {
        console.error('❌ Erro na query de teste:', testError.message)
      } else {
        console.log('✅ Query de teste bem-sucedida:', testData.length, 'registros')
        if (testData.length > 0) {
          console.log('📊 Exemplo de dados retornados:')
          console.log(testData[0])
        }
      }
    }

  } catch (error) {
    console.error('💥 Erro geral na investigação:', error)
  }

  console.log('\n' + '='.repeat(80))
  console.log('🔍 INVESTIGAÇÃO CONCLUÍDA')
}

// Executar se chamado diretamente
if (require.main === module) {
  debugCashbackNoData()
    .then(() => {
      console.log('✅ Debug concluído')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Erro no debug:', error)
      process.exit(1)
    })
}

module.exports = { debugCashbackNoData }