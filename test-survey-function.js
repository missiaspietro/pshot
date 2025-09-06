// Script para testar a função fetchSurveyData isoladamente
// Execute este script no console do navegador

console.log('🧪 === TESTE DA FUNÇÃO FETCHSURVEYDATA ===')

// Simular dados de teste
const testData = {
  selectedFields: ['nome', 'telefone', 'loja', 'rede', 'resposta'],
  startDate: '2025-07-12',
  endDate: '2025-08-12',
  responseFilter: '1'
}

console.log('🧪 Dados de teste:', testData)

// Testar a requisição diretamente
async function testSurveyAPI() {
  console.log('🧪 Iniciando teste da API...')
  
  try {
    const response = await fetch('/api/reports/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    console.log('🧪 Status da resposta:', response.status)
    console.log('🧪 Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('🧪 Erro da API:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('🧪 Resposta da API:', result)
    console.log('🧪 Dados recebidos:', result.data?.length || 0, 'registros')
    
    if (result.data && result.data.length > 0) {
      console.log('🧪 Primeiro registro:', result.data[0])
    }
    
  } catch (error) {
    console.error('🧪 Erro no teste:', error)
  }
}

// Executar o teste
testSurveyAPI()

console.log('🧪 === FIM DO TESTE ===')