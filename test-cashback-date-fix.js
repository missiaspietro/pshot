// Teste para verificar se a correção das datas no cashback está funcionando
// Execute no console do navegador em http://localhost:3000/reports

console.log('🧪 TESTE: Verificando correção das datas no cashback')

async function testCashbackDateFix() {
  console.log('\n🚀 Iniciando teste da correção...')
  
  // Teste 1: Período específico (Janeiro 2024)
  console.log('\n1️⃣ Teste: Janeiro 2024')
  await testPeriod('Janeiro 2024', '2024-01-01', '2024-01-31')
  
  // Teste 2: Período específico (Novembro 2024)
  console.log('\n2️⃣ Teste: Novembro 2024')
  await testPeriod('Novembro 2024', '2024-11-01', '2024-11-30')
  
  // Teste 3: Período amplo (Ano todo 2024)
  console.log('\n3️⃣ Teste: Ano todo 2024')
  await testPeriod('Ano todo 2024', '2024-01-01', '2024-12-31')
  
  // Teste 4: Sem filtros de data
  console.log('\n4️⃣ Teste: Sem filtros de data')
  await testPeriod('Sem filtros', '', '')
  
  console.log('\n🏁 Testes concluídos!')
}

async function testPeriod(name, startDate, endDate) {
  console.log(`\n🔍 Testando: ${name}`)
  console.log(`   Período: ${startDate || 'Não definido'} até ${endDate || 'Não definido'}`)
  
  try {
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
    
    if (response.ok) {
      const result = await response.json()
      console.log(`   ✅ Resultado: ${result.data?.length || 0} registros`)
      
      if (result.data && result.data.length > 0) {
        // Analisar datas nos dados
        const datesInData = result.data
          .filter(item => item.Envio_novo)
          .map(item => item.Envio_novo.split('T')[0])
          .sort()
        
        if (datesInData.length > 0) {
          console.log(`   📅 Primeira data: ${datesInData[0]}`)
          console.log(`   📅 Última data: ${datesInData[datesInData.length - 1]}`)
          
          // Verificar se as datas estão dentro do período solicitado
          if (startDate && endDate) {
            const outsideRange = datesInData.filter(date => 
              date < startDate || date > endDate
            )
            
            if (outsideRange.length > 0) {
              console.log(`   ❌ PROBLEMA: ${outsideRange.length} datas fora do período`)
              console.log(`   ❌ Exemplos fora do período:`, outsideRange.slice(0, 5))
            } else {
              console.log(`   ✅ Todas as datas estão dentro do período solicitado`)
            }
          }
          
          // Mostrar distribuição por mês
          const monthDistribution = datesInData.reduce((acc, date) => {
            const month = date.substring(0, 7) // YYYY-MM
            acc[month] = (acc[month] || 0) + 1
            return acc
          }, {})
          
          const topMonths = Object.entries(monthDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
          
          console.log(`   📊 Top 5 meses:`, topMonths.map(([month, count]) => `${month}: ${count}`).join(', '))
        }
      } else {
        console.log(`   📭 Nenhum dado encontrado`)
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

// Função para testar especificamente o problema relatado
async function testCurrentProblem() {
  console.log('\n🎯 TESTE ESPECÍFICO: Problema atual do usuário')
  console.log('Simulando o uso do datepicker na tela de relatórios...')
  
  // Simular valores que o usuário pode estar usando
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  
  const startDate = lastMonth.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]
  
  console.log(`📅 Datas simuladas do datepicker:`)
  console.log(`   Data inicial: ${startDate}`)
  console.log(`   Data final: ${endDate}`)
  
  await testPeriod('Problema atual', startDate, endDate)
}

console.log('💡 Funções disponíveis:')
console.log('   testCashbackDateFix() - Executa todos os testes')
console.log('   testCurrentProblem() - Testa o problema específico atual')
console.log('\n🔧 Execute uma das funções para testar as correções')

// Disponibilizar as funções globalmente
window.testCashbackDateFix = testCashbackDateFix
window.testCurrentProblem = testCurrentProblem