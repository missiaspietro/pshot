// Script para testar se a requisição está sendo feita para a API de pesquisas
// Execute este script no console do navegador após abrir o modal

console.log('🧪 === TESTE DE REQUISIÇÃO DE PESQUISAS ===')

// Interceptar todas as requisições fetch
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('🌐 [INTERCEPTOR] Requisição fetch detectada:', args[0])
  
  if (args[0].includes('/api/reports/survey')) {
    console.log('🎯 [INTERCEPTOR] Requisição para API de pesquisas detectada!')
    console.log('🎯 [INTERCEPTOR] URL:', args[0])
    console.log('🎯 [INTERCEPTOR] Opções:', args[1])
    
    if (args[1] && args[1].body) {
      try {
        const body = JSON.parse(args[1].body)
        console.log('🎯 [INTERCEPTOR] Body da requisição:', body)
      } catch (e) {
        console.log('🎯 [INTERCEPTOR] Body (não JSON):', args[1].body)
      }
    }
  }
  
  return originalFetch.apply(this, args)
    .then(response => {
      if (args[0].includes('/api/reports/survey')) {
        console.log('🎯 [INTERCEPTOR] Resposta da API de pesquisas:', response.status, response.statusText)
      }
      return response
    })
    .catch(error => {
      if (args[0].includes('/api/reports/survey')) {
        console.log('🎯 [INTERCEPTOR] Erro na API de pesquisas:', error)
      }
      throw error
    })
}

console.log('🧪 Interceptor de fetch instalado. Agora abra o modal de pesquisas.')
console.log('🧪 Para restaurar o fetch original, execute: window.fetch = originalFetch')

// Salvar referência para restaurar depois
window.originalFetch = originalFetch