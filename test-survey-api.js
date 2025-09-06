// Teste simples para verificar se a API de pesquisas está funcionando
console.log('🧪 Iniciando teste da API de pesquisas...')

// Simular dados de teste
const testData = {
  selectedFields: ['nome', 'telefone', 'resposta'],
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  responseFilter: '2' // Apenas boas
}

console.log('🧪 Dados de teste:', testData)

// Função para testar a API
async function testSurveyAPI() {
  try {
    console.log('🧪 Fazendo requisição para /api/reports/survey...')
    
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
      console.error('🧪 Erro na API:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('🧪 Resultado da API:', result)
    console.log('🧪 Total de registros:', result.total)
    console.log('🧪 Filtro aplicado:', result.filtered)
    
  } catch (error) {
    console.error('🧪 Erro na requisição:', error)
  }
}

// Executar teste quando a página carregar
if (typeof window !== 'undefined') {
  window.testSurveyAPI = testSurveyAPI
  console.log('🧪 Teste disponível! Execute: testSurveyAPI()')
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testSurveyAPI }
}