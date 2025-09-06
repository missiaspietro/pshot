// Script para debugar o problema das datas no relatório de cashback
// Execute no console do navegador na página http://localhost:3000/reports

console.log('🔍 DEBUG: Investigando problema das datas no relatório de cashback')

// 1. Verificar se as datas estão sendo definidas corretamente
const startDateInput = document.getElementById('start-date')
const endDateInput = document.getElementById('end-date')

console.log('📅 Valores dos inputs de data:')
console.log('   Start Date Input:', startDateInput?.value)
console.log('   End Date Input:', endDateInput?.value)

// 2. Interceptar chamadas para a API de cashback
const originalFetch = window.fetch
window.fetch = function(...args) {
  if (args[0].includes('/api/reports/cashback')) {
    console.log('🎯 INTERCEPTANDO chamada para API de cashback:')
    console.log('   URL:', args[0])
    
    if (args[1] && args[1].body) {
      try {
        const body = JSON.parse(args[1].body)
        console.log('   Body da requisição:', body)
        console.log('   startDate enviado:', body.startDate)
        console.log('   endDate enviado:', body.endDate)
        console.log('   selectedFields:', body.selectedFields)
        console.log('   selectedStore:', body.selectedStore)
      } catch (e) {
        console.log('   Erro ao parsear body:', e)
      }
    }
  }
  
  return originalFetch.apply(this, args)
}

// 3. Função para testar manualmente a API
async function testCashbackAPI() {
  console.log('🧪 TESTE MANUAL: Chamando API de cashback com datas específicas')
  
  const testData = {
    selectedFields: ['Nome', 'Whatsapp', 'Loja', 'Envio_novo'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    selectedStore: ''
  }
  
  console.log('📤 Enviando dados de teste:', testData)
  
  try {
    const response = await fetch('/api/reports/cashback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testData)
    })
    
    console.log('📥 Status da resposta:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Dados recebidos:', result)
      console.log('   Total de registros:', result.data?.length || 0)
      
      if (result.data && result.data.length > 0) {
        console.log('   Primeiro registro:', result.data[0])
        console.log('   Último registro:', result.data[result.data.length - 1])
        
        // Verificar distribuição por data
        const dateDistribution = result.data.reduce((acc, item) => {
          if (item.Envio_novo) {
            const date = item.Envio_novo.split('T')[0] // Pegar apenas a data
            acc[date] = (acc[date] || 0) + 1
          }
          return acc
        }, {})
        
        console.log('📊 Distribuição por data (primeiras 10):')
        Object.entries(dateDistribution)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 10)
          .forEach(([date, count]) => {
            console.log(`   ${date}: ${count} registros`)
          })
      }
    } else {
      const error = await response.json()
      console.error('❌ Erro na API:', error)
    }
  } catch (error) {
    console.error('💥 Erro na requisição:', error)
  }
}

// 4. Função para testar com diferentes períodos
async function testDifferentPeriods() {
  console.log('🧪 TESTE: Diferentes períodos de data')
  
  const periods = [
    { name: 'Último mês', startDate: '2024-11-01', endDate: '2024-11-30' },
    { name: 'Últimos 3 meses', startDate: '2024-09-01', endDate: '2024-11-30' },
    { name: 'Ano todo', startDate: '2024-01-01', endDate: '2024-12-31' },
    { name: 'Sem filtro', startDate: '', endDate: '' }
  ]
  
  for (const period of periods) {
    console.log(`\n📅 Testando período: ${period.name}`)
    console.log(`   Data inicial: ${period.startDate || 'Não definida'}`)
    console.log(`   Data final: ${period.endDate || 'Não definida'}`)
    
    try {
      const response = await fetch('/api/reports/cashback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          selectedFields: ['Nome', 'Whatsapp', 'Loja', 'Envio_novo'],
          startDate: period.startDate,
          endDate: period.endDate,
          selectedStore: ''
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`   ✅ Resultado: ${result.data?.length || 0} registros`)
        
        if (result.data && result.data.length > 0) {
          const dates = result.data
            .map(item => item.Envio_novo)
            .filter(date => date)
            .sort()
          
          console.log(`   📊 Primeira data: ${dates[0]}`)
          console.log(`   📊 Última data: ${dates[dates.length - 1]}`)
        }
      } else {
        const error = await response.json()
        console.log(`   ❌ Erro: ${error.error}`)
      }
    } catch (error) {
      console.log(`   💥 Erro na requisição: ${error.message}`)
    }
    
    // Aguardar um pouco entre as requisições
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

console.log('🎯 Funções disponíveis:')
console.log('   testCashbackAPI() - Testa a API com dados específicos')
console.log('   testDifferentPeriods() - Testa diferentes períodos de data')
console.log('\n💡 Execute uma das funções acima para investigar o problema')