// Teste para verificar autenticação na API de pesquisas
// Execute este script no console do navegador

console.log('🧪 === TESTE DE AUTENTICAÇÃO ===')

function checkCookies() {
  console.log('🍪 Verificando cookies...')
  console.log('🍪 document.cookie:', document.cookie)
  
  const cookies = document.cookie
  const sessionMatch = cookies.match(/ps_session=([^;]+)/)
  
  if (sessionMatch) {
    console.log('✅ Cookie ps_session encontrado:', sessionMatch[1])
    const email = sessionMatch[1].split('_')[0]
    console.log('✅ Email extraído:', email)
  } else {
    console.log('❌ Cookie ps_session não encontrado')
    console.log('❌ Cookies disponíveis:', cookies)
  }
}

async function testAuthAPI() {
  try {
    console.log('🧪 Testando autenticação na API...')
    
    // Primeiro, verificar cookies
    checkCookies()
    
    // Testar uma API simples primeiro (se existir)
    console.log('🧪 Testando requisição com headers de debug...')
    
    const response = await fetch('/api/reports/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug': 'true'
      },
      body: JSON.stringify({
        selectedFields: ['nome'],
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        responseFilter: ""
      })
    })
    
    console.log('🧪 Status da resposta:', response.status)
    console.log('🧪 Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    if (response.status === 401) {
      console.log('❌ PROBLEMA DE AUTENTICAÇÃO')
      console.log('❌ Verifique se você está logado no sistema')
      console.log('❌ Tente fazer logout e login novamente')
      return
    }
    
    const responseText = await response.text()
    console.log('🧪 Resposta completa:', responseText)
    
    try {
      const result = JSON.parse(responseText)
      console.log('✅ JSON parseado:', result)
    } catch (e) {
      console.log('❌ Resposta não é JSON válido')
    }
    
  } catch (error) {
    console.error('💥 Erro no teste de autenticação:', error)
  }
}

// Executar testes
checkCookies()
testAuthAPI()

console.log('🧪 === FIM DO TESTE DE AUTENTICAÇÃO ===')