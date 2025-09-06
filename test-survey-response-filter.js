// Script para testar especificamente o filtro de resposta das pesquisas
// Execute este script no console do navegador

console.log('🧪 === TESTE DO FILTRO DE RESPOSTA ===')

// Função para testar diferentes valores de filtro
async function testResponseFilter(filterValue) {
  console.log(`\n🧪 Testando filtro: "${filterValue}" (tipo: ${typeof filterValue})`)
  
  const testData = {
    selectedFields: ['nome', 'telefone', 'loja', 'rede', 'resposta'],
    startDate: '2025-07-12',
    endDate: '2025-08-12',
    responseFilter: filterValue
  }
  
  console.log('🧪 Dados enviados:', testData)
  
  try {
    const response = await fetch('/api/reports/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    console.log(`🧪 Status da resposta para filtro "${filterValue}":`, response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`🧪 Erro para filtro "${filterValue}":`, errorText)
      return
    }
    
    const result = await response.json()
    console.log(`🧪 Resposta para filtro "${filterValue}":`)
    console.log('  - Total de registros:', result.data?.length || 0)
    console.log('  - Filtrado:', result.filtered)
    console.log('  - responseFilter na resposta:', result.responseFilter)
    
    if (result.data && result.data.length > 0) {
      const respostasUnicas = [...new Set(result.data.map(item => item.resposta))]
      console.log('  - Valores únicos de resposta nos dados:', respostasUnicas)
    }
    
  } catch (error) {
    console.error(`🧪 Erro no teste para filtro "${filterValue}":`, error)
  }
}

// Testar diferentes valores
async function runAllTests() {
  console.log('🧪 Iniciando testes de filtro...')
  
  // Teste sem filtro
  await testResponseFilter("")
  
  // Teste com filtros válidos
  await testResponseFilter("1")
  await testResponseFilter("2")
  await testResponseFilter("3")
  await testResponseFilter("4")
  
  // Teste com valores inválidos
  await testResponseFilter("5")
  await testResponseFilter("0")
  await testResponseFilter("abc")
  await testResponseFilter(null)
  await testResponseFilter(undefined)
  
  console.log('\n🧪 === TESTES CONCLUÍDOS ===')
}

// Executar todos os testes
runAllTests()

console.log('🧪 Testes iniciados. Aguarde os resultados...')