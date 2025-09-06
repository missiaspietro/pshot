// Teste específico para verificar problemas de autenticação

console.log('🔐 === TESTE DE AUTENTICAÇÃO ===')

function checkAuthentication() {
  console.log('🔐 Verificando autenticação...')
  
  // 1. Verificar se cookie ps_session existe
  const cookies = document.cookie
  console.log('🔐 Todos os cookies:', cookies)
  
  const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('ps_session='))
  console.log('🔐 Cookie ps_session:', sessionCookie)
  
  if (!sessionCookie) {
    console.error('🔐 ❌ PROBLEMA: Cookie ps_session não encontrado!')
    console.log('🔐 Possíveis causas:')
    console.log('🔐 - Usuário não está logado')
    console.log('🔐 - Cookie expirou')
    console.log('🔐 - Problema no sistema de login')
    return false
  }
  
  // 2. Verificar formato do cookie
  const sessionValue = sessionCookie.split('=')[1]
  console.log('🔐 Valor da sessão:', sessionValue)
  
  if (!sessionValue.includes('_')) {
    console.error('🔐 ❌ PROBLEMA: Formato do cookie inválido!')
    console.log('🔐 Esperado: email_alguma_coisa')
    console.log('🔐 Recebido:', sessionValue)
    return false
  }
  
  // 3. Extrair email
  const email = sessionValue.split('_')[0]
  console.log('🔐 Email extraído:', email)
  
  if (!email || !email.includes('@')) {
    console.error('🔐 ❌ PROBLEMA: Email inválido no cookie!')
    console.log('🔐 Email extraído:', email)
    return false
  }
  
  console.log('🔐 ✅ Cookie ps_session parece válido')
  return true
}

async function testAPIWithAuth() {
  console.log('🔐 Testando API com autenticação...')
  
  try {
    const response = await fetch('/api/reports/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedFields: ['nome', 'telefone', 'resposta'],
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        responseFilter: '2'
      })
    })
    
    console.log('🔐 Status da resposta:', response.status)
    console.log('🔐 Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    if (response.status === 401) {
      console.error('🔐 ❌ PROBLEMA DE AUTENTICAÇÃO CONFIRMADO!')
      const errorData = await response.json()
      console.log('🔐 Erro retornado:', errorData)
      return false
    }
    
    if (response.status === 404) {
      console.error('🔐 ❌ PROBLEMA: Usuário não encontrado no banco!')
      const errorData = await response.json()
      console.log('🔐 Erro retornado:', errorData)
      return false
    }
    
    if (response.ok) {
      console.log('🔐 ✅ Autenticação funcionando!')
      const data = await response.json()
      console.log('🔐 Dados recebidos:', data)
      return true
    }
    
    console.error('🔐 ❌ Erro inesperado:', response.status)
    const errorData = await response.text()
    console.log('🔐 Erro:', errorData)
    return false
    
  } catch (error) {
    console.error('🔐 ❌ Erro na requisição:', error)
    return false
  }
}

function checkUserInDatabase() {
  console.log('🔐 Para verificar se usuário existe no banco, execute:')
  console.log('🔐 SELECT * FROM users WHERE email = \'SEU_EMAIL\' AND sistema = \'Praise Shot\';')
}

async function runAuthTests() {
  console.log('🔐 === EXECUTANDO TESTES DE AUTENTICAÇÃO ===')
  
  const cookieOK = checkAuthentication()
  
  if (!cookieOK) {
    console.log('🔐 ❌ Problema no cookie - usuário precisa fazer login novamente')
    return
  }
  
  const apiOK = await testAPIWithAuth()
  
  if (!apiOK) {
    console.log('🔐 ❌ Problema na API - verificar banco de dados')
    checkUserInDatabase()
    return
  }
  
  console.log('🔐 ✅ Autenticação funcionando perfeitamente!')
  console.log('🔐 O problema NÃO é autenticação - vamos para próxima opção')
}

// Disponibilizar funções globalmente
if (typeof window !== 'undefined') {
  window.checkAuthentication = checkAuthentication
  window.testAPIWithAuth = testAPIWithAuth
  window.runAuthTests = runAuthTests
  
  console.log('🔐 Funções disponíveis:')
  console.log('🔐 - checkAuthentication()')
  console.log('🔐 - testAPIWithAuth()')
  console.log('🔐 - runAuthTests() ← Execute esta!')
}

// Auto-executar teste
setTimeout(() => {
  console.log('🔐 Executando teste automático...')
  runAuthTests()
}, 500)