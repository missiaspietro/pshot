// Teste simples para verificar se a API de pesquisas está funcionando
// Execute este script no console do navegador

console.log('🧪 === TESTE SIMPLES DA API DE PESQUISAS ===')

async function testSimpleAPI() {
  try {
    console.log('🧪 Testando requisição básica...')
    
    const response = await fetch('/api/reports/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedFields: ['nome', 'resposta'],
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        responseFilter: ""
      })
    })
    
    console.log('🧪 Status:', response.status)
    console.log('🧪 Status Text:', response.statusText)
    console.log('🧪 Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.status === 401) {
      console.log('❌ Erro de autenticação - usuário não logado ou sessão expirada')
      return
    }
    
    if (response.status === 404) {
      console.log('❌ API não encontrada - verifique se a rota existe')
      return
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Erro da API:', errorText)
      return
    }
    
    const result = await response.json()
    console.log('✅ Resposta da API:', result)
    
    if (result.data) {
      console.log('✅ Dados recebidos:', result.data.length, 'registros')
      if (result.data.length > 0) {
        console.log('✅ Primeiro registro:', result.data[0])
      }
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error)
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.log('❌ Erro de rede - verifique se o servidor está rodando')
    }
  }
}

// Executar o teste
testSimpleAPI()

console.log('🧪 === FIM DO TESTE ===')