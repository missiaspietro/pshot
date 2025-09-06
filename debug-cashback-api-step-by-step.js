// Debug passo a passo da API de cashback
// Execute no console do navegador em http://localhost:3000/reports

console.log('🔍 DEBUG PASSO A PASSO: API de Cashback')

// Função para testar a API passo a passo
async function debugCashbackAPI() {
  console.log('\n🚀 Iniciando debug da API de cashback...')
  
  // 1. Verificar se estamos autenticados
  console.log('\n1️⃣ Verificando autenticação...')
  const cookies = document.cookie
  console.log('🍪 Cookies disponíveis:', cookies)
  
  const sessionMatch = cookies.match(/ps_session=([^;]+)/)
  if (sessionMatch) {
    console.log('✅ Sessão encontrada:', sessionMatch[1].split('_')[0])
  } else {
    console.log('❌ Nenhuma sessão encontrada')
    return
  }
  
  // 2. Testar com dados específicos
  console.log('\n2️⃣ Testando API com dados específicos...')
  
  const testData = {
    selectedFields: ['Nome', 'Whatsapp', 'Loja', 'Envio_novo', 'Status'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    selectedStore: ''
  }
  
  console.log('📤 Dados de teste:', testData)
  
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
    console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Resposta completa:', result)
      
      if (result.data && result.data.length > 0) {
        console.log('\n📊 Análise dos dados recebidos:')
        console.log('   Total de registros:', result.data.length)
        console.log('   Primeiro registro:', result.data[0])
        console.log('   Último registro:', result.data[result.data.length - 1])
        
        // Analisar datas
        const datesWithData = result.data
          .filter(item => item.Envio_novo)
          .map(item => item.Envio_novo.split('T')[0])
          .sort()
        
        if (datesWithData.length > 0) {
          console.log('\n📅 Análise de datas:')
          console.log('   Primeira data:', datesWithData[0])
          console.log('   Última data:', datesWithData[datesWithData.length - 1])
          console.log('   Total de registros com data:', datesWithData.length)
          
          // Verificar se as datas estão dentro do período solicitado
          const startRequested = new Date('2024-01-01')
          const endRequested = new Date('2024-12-31')
          
          const datesOutOfRange = datesWithData.filter(dateStr => {
            const date = new Date(dateStr)
            return date < startRequested || date > endRequested
          })
          
          if (datesOutOfRange.length > 0) {
            console.log('⚠️ PROBLEMA ENCONTRADO: Datas fora do período solicitado:')
            datesOutOfRange.slice(0, 10).forEach(date => {
              console.log('   ❌', date)
            })
          } else {
            console.log('✅ Todas as datas estão dentro do período solicitado')
          }
          
          // Distribuição por mês
          const monthDistribution = datesWithData.reduce((acc, dateStr) => {
            const month = dateStr.substring(0, 7) // YYYY-MM
            acc[month] = (acc[month] || 0) + 1
            return acc
          }, {})
          
          console.log('\n📊 Distribuição por mês:')
          Object.entries(monthDistribution)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 12)
            .forEach(([month, count]) => {
              console.log(`   ${month}: ${count} registros`)
            })
        }
        
        // Analisar empresas
        const companies = [...new Set(result.data.map(item => item.Rede_de_loja).filter(Boolean))]
        console.log('\n🏢 Empresas nos dados:', companies)
        
        // Analisar status
        const statusDistribution = result.data.reduce((acc, item) => {
          const status = item.Status || 'SEM_STATUS'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
        console.log('\n📊 Distribuição por status:', statusDistribution)
        
      } else {
        console.log('📭 Nenhum dado retornado')
      }
    } else {
      const error = await response.json()
      console.error('❌ Erro na API:', error)
    }
  } catch (error) {
    console.error('💥 Erro na requisição:', error)
  }
  
  // 3. Testar sem filtros de data
  console.log('\n3️⃣ Testando sem filtros de data...')
  
  const testDataNoDate = {
    selectedFields: ['Nome', 'Whatsapp', 'Loja', 'Envio_novo', 'Status'],
    startDate: '',
    endDate: '',
    selectedStore: ''
  }
  
  try {
    const response = await fetch('/api/reports/cashback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testDataNoDate)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Sem filtros de data - Total:', result.data?.length || 0)
      
      if (result.data && result.data.length > 0) {
        const datesWithData = result.data
          .filter(item => item.Envio_novo)
          .map(item => item.Envio_novo.split('T')[0])
          .sort()
        
        if (datesWithData.length > 0) {
          console.log('   📅 Primeira data:', datesWithData[0])
          console.log('   📅 Última data:', datesWithData[datesWithData.length - 1])
          
          // Verificar se está retornando sempre o mesmo período
          const uniqueDates = [...new Set(datesWithData)]
          console.log('   📊 Datas únicas:', uniqueDates.length)
          console.log('   📊 Primeiras 10 datas únicas:', uniqueDates.slice(0, 10))
          console.log('   📊 Últimas 10 datas únicas:', uniqueDates.slice(-10))
        }
      }
    } else {
      const error = await response.json()
      console.error('❌ Erro sem filtros:', error)
    }
  } catch (error) {
    console.error('💥 Erro na requisição sem filtros:', error)
  }
  
  // 4. Comparar com diferentes períodos
  console.log('\n4️⃣ Comparando diferentes períodos...')
  
  const periods = [
    { name: 'Janeiro 2024', startDate: '2024-01-01', endDate: '2024-01-31' },
    { name: 'Junho 2024', startDate: '2024-06-01', endDate: '2024-06-30' },
    { name: 'Novembro 2024', startDate: '2024-11-01', endDate: '2024-11-30' },
    { name: 'Dezembro 2024', startDate: '2024-12-01', endDate: '2024-12-31' }
  ]
  
  for (const period of periods) {
    console.log(`\n   🔍 Testando: ${period.name}`)
    
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
        console.log(`      ✅ ${period.name}: ${result.data?.length || 0} registros`)
        
        if (result.data && result.data.length > 0) {
          const dates = result.data
            .filter(item => item.Envio_novo)
            .map(item => item.Envio_novo.split('T')[0])
            .sort()
          
          if (dates.length > 0) {
            console.log(`      📅 Primeira: ${dates[0]}, Última: ${dates[dates.length - 1]}`)
            
            // Verificar se há datas fora do período
            const outsidePeriod = dates.filter(date => 
              date < period.startDate || date > period.endDate
            )
            
            if (outsidePeriod.length > 0) {
              console.log(`      ⚠️ PROBLEMA: ${outsidePeriod.length} datas fora do período`)
              console.log(`      ❌ Exemplos:`, outsidePeriod.slice(0, 3))
            }
          }
        }
      } else {
        const error = await response.json()
        console.log(`      ❌ ${period.name}: ${error.error}`)
      }
    } catch (error) {
      console.log(`      💥 ${period.name}: ${error.message}`)
    }
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n🏁 Debug concluído!')
}

// Executar o debug
console.log('💡 Execute debugCashbackAPI() para iniciar o debug')
window.debugCashbackAPI = debugCashbackAPI