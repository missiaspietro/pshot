// Teste para verificar se o limite de 1000 registros foi removido
// Execute no console do navegador em http://localhost:3000/reports

console.log('🧪 TESTE: Verificando remoção do limite de 1000 registros')

async function testCashbackNoLimit() {
  console.log('\n🚀 Testando se o limite foi removido...')
  
  // Teste 1: Período amplo que deve retornar mais de 1000 registros
  console.log('\n1️⃣ Teste: Período amplo (ano todo 2024)')
  await testNoLimit('Ano todo 2024', '2024-01-01', '2024-12-31')
  
  // Teste 2: Sem filtros de data (deve retornar todos os dados)
  console.log('\n2️⃣ Teste: Sem filtros de data (todos os dados)')
  await testNoLimit('Todos os dados', '', '')
  
  // Teste 3: Período de vários anos
  console.log('\n3️⃣ Teste: Múltiplos anos (2023-2024)')
  await testNoLimit('2023-2024', '2023-01-01', '2024-12-31')
  
  console.log('\n🏁 Testes de limite concluídos!')
}

async function testNoLimit(testName, startDate, endDate) {
  console.log(`\n🔍 Testando: ${testName}`)
  console.log(`   Período: ${startDate || 'Não definido'} até ${endDate || 'Não definido'}`)
  
  try {
    const startTime = Date.now()
    
    const response = await fetch('/api/reports/cashback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        selectedFields: ['Nome', 'Whatsapp', 'Loja', 'Envio_novo', 'Status'],
        startDate: startDate,
        endDate: endDate,
        selectedStore: ''
      })
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (response.ok) {
      const result = await response.json()
      const totalRecords = result.data?.length || 0
      
      console.log(`   ✅ Resultado: ${totalRecords} registros`)
      console.log(`   ⏱️ Tempo de resposta: ${duration}ms`)
      
      // Verificar se ultrapassou o limite anterior de 1000
      if (totalRecords > 1000) {
        console.log(`   🎉 SUCESSO: Limite removido! Retornou ${totalRecords} registros (mais que 1000)`)
      } else if (totalRecords === 1000) {
        console.log(`   ⚠️ ATENÇÃO: Exatamente 1000 registros - pode ainda ter limite`)
      } else {
        console.log(`   ℹ️ INFO: ${totalRecords} registros (menos que 1000, normal para este período)`)
      }
      
      if (result.data && result.data.length > 0) {
        // Analisar distribuição de datas
        const datesInData = result.data
          .filter(item => item.Envio_novo)
          .map(item => item.Envio_novo.split('T')[0])
          .sort()
        
        if (datesInData.length > 0) {
          console.log(`   📅 Primeira data: ${datesInData[0]}`)
          console.log(`   📅 Última data: ${datesInData[datesInData.length - 1]}`)
          
          // Mostrar distribuição por ano
          const yearDistribution = datesInData.reduce((acc, date) => {
            const year = date.substring(0, 4)
            acc[year] = (acc[year] || 0) + 1
            return acc
          }, {})
          
          console.log(`   📊 Distribuição por ano:`, yearDistribution)
          
          // Verificar se há dados de múltiplos anos (indicativo de que não há limite)
          const years = Object.keys(yearDistribution)
          if (years.length > 1) {
            console.log(`   🎯 INDICATIVO: Dados de ${years.length} anos diferentes - limite provavelmente removido`)
          }
        }
        
        // Analisar performance
        if (duration > 5000) {
          console.log(`   ⚠️ PERFORMANCE: Resposta demorou ${duration}ms - considere otimizações`)
        } else if (duration > 2000) {
          console.log(`   ⏱️ PERFORMANCE: Resposta em ${duration}ms - aceitável`)
        } else {
          console.log(`   ⚡ PERFORMANCE: Resposta rápida em ${duration}ms`)
        }
      }
    } else {
      const error = await response.json()
      console.log(`   ❌ Erro: ${error.error}`)
    }
  } catch (error) {
    console.log(`   💥 Erro na requisição: ${error.message}`)
  }
  
  // Aguardar um pouco entre os testes
  await new Promise(resolve => setTimeout(resolve, 1000))
}

// Função para comparar antes e depois
async function compareLimitRemoval() {
  console.log('\n🔄 COMPARAÇÃO: Testando diferentes cenários para confirmar remoção do limite')
  
  const scenarios = [
    { name: 'Janeiro 2024', startDate: '2024-01-01', endDate: '2024-01-31' },
    { name: 'Primeiro semestre 2024', startDate: '2024-01-01', endDate: '2024-06-30' },
    { name: 'Ano todo 2024', startDate: '2024-01-01', endDate: '2024-12-31' },
    { name: 'Últimos 2 anos', startDate: '2023-01-01', endDate: '2024-12-31' }
  ]
  
  console.log('\n📊 Testando cenários progressivos:')
  
  for (const scenario of scenarios) {
    await testNoLimit(scenario.name, scenario.startDate, scenario.endDate)
  }
  
  console.log('\n📈 Análise: Se os números aumentam progressivamente, o limite foi removido com sucesso!')
}

// Função para testar especificamente se ainda há limite de 1000
async function testSpecific1000Limit() {
  console.log('\n🎯 TESTE ESPECÍFICO: Verificando se ainda há limite de 1000')
  
  try {
    const response = await fetch('/api/reports/cashback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        selectedFields: ['Nome', 'Whatsapp', 'Loja', 'Envio_novo'],
        startDate: '', // Sem filtro para pegar o máximo possível
        endDate: '',
        selectedStore: ''
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      const total = result.data?.length || 0
      
      console.log(`📊 Total de registros retornados: ${total}`)
      
      if (total === 1000) {
        console.log('❌ PROBLEMA: Ainda há limite de 1000 registros!')
        console.log('   Verifique se a correção foi aplicada corretamente')
      } else if (total > 1000) {
        console.log('✅ SUCESSO: Limite de 1000 removido com sucesso!')
        console.log(`   Retornou ${total} registros (${total - 1000} a mais que o limite anterior)`)
      } else {
        console.log(`ℹ️ INFO: ${total} registros (menos que 1000, pode ser normal)`)
        console.log('   Pode não haver mais de 1000 registros na base de dados para esta empresa')
      }
    }
  } catch (error) {
    console.error('💥 Erro no teste:', error)
  }
}

console.log('💡 Funções disponíveis:')
console.log('   testCashbackNoLimit() - Testa vários cenários')
console.log('   compareLimitRemoval() - Compara cenários progressivos')
console.log('   testSpecific1000Limit() - Teste específico do limite de 1000')
console.log('\n🔧 Execute uma das funções para testar a remoção do limite')

// Disponibilizar as funções globalmente
window.testCashbackNoLimit = testCashbackNoLimit
window.compareLimitRemoval = compareLimitRemoval
window.testSpecific1000Limit = testSpecific1000Limit