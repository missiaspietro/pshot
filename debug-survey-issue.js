// Debug para investigar o problema do filtro de pesquisas

console.log('🔍 === DEBUG SURVEY ISSUE ===')

// Função para testar se a API está funcionando
async function testSurveyAPI() {
  console.log('🔍 Testando API de pesquisas...')
  
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
    
    console.log('🔍 Status:', response.status)
    console.log('🔍 Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('🔍 Resposta da API:', data)
      return data
    } else {
      const error = await response.text()
      console.error('🔍 Erro da API:', error)
      return null
    }
  } catch (error) {
    console.error('🔍 Erro na requisição:', error)
    return null
  }
}

// Função para verificar se o modal está funcionando
function checkModalState() {
  console.log('🔍 Verificando estado do modal...')
  
  // Verificar se há elementos do modal na página
  const modal = document.querySelector('[role="dialog"]')
  console.log('🔍 Modal encontrado:', !!modal)
  
  if (modal) {
    console.log('🔍 Modal HTML:', modal.outerHTML.substring(0, 200) + '...')
  }
  
  // Verificar se há botões de preview
  const previewButtons = document.querySelectorAll('button')
  const surveyButton = Array.from(previewButtons).find(btn => 
    btn.textContent?.includes('Preview') || btn.textContent?.includes('Gerar')
  )
  console.log('🔍 Botão de preview encontrado:', !!surveyButton)
  
  if (surveyButton) {
    console.log('🔍 Texto do botão:', surveyButton.textContent)
  }
}

// Função para verificar dropdowns
function checkDropdowns() {
  console.log('🔍 Verificando dropdowns...')
  
  const dropdowns = document.querySelectorAll('[role="button"]')
  console.log('🔍 Dropdowns encontrados:', dropdowns.length)
  
  dropdowns.forEach((dropdown, index) => {
    if (dropdown.textContent?.includes('Apenas') || dropdown.textContent?.includes('Todas')) {
      console.log(`🔍 Dropdown ${index}:`, dropdown.textContent)
    }
  })
}

// Função para verificar checkboxes
function checkCheckboxes() {
  console.log('🔍 Verificando checkboxes...')
  
  const checkboxes = document.querySelectorAll('input[type="checkbox"]')
  console.log('🔍 Checkboxes encontrados:', checkboxes.length)
  
  checkboxes.forEach((checkbox, index) => {
    const label = checkbox.nextElementSibling?.textContent || 
                  checkbox.parentElement?.textContent ||
                  'Sem label'
    console.log(`🔍 Checkbox ${index}: ${label} - Checked: ${checkbox.checked}`)
  })
}

// Função para verificar se há erros de rede
function checkNetworkErrors() {
  console.log('🔍 Verificando erros de rede...')
  
  // Interceptar fetch para ver todas as requisições
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    console.log('🔍 Fetch interceptado:', args[0], args[1])
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('🔍 Resposta interceptada:', response.status, response.url)
        return response
      })
      .catch(error => {
        console.error('🔍 Erro interceptado:', error)
        throw error
      })
  }
}

// Executar todos os testes
function runAllTests() {
  console.log('🔍 === EXECUTANDO TODOS OS TESTES ===')
  
  checkModalState()
  checkDropdowns()
  checkCheckboxes()
  checkNetworkErrors()
  
  console.log('🔍 Para testar a API diretamente, execute: testSurveyAPI()')
}

// Disponibilizar funções globalmente
if (typeof window !== 'undefined') {
  window.testSurveyAPI = testSurveyAPI
  window.checkModalState = checkModalState
  window.checkDropdowns = checkDropdowns
  window.checkCheckboxes = checkCheckboxes
  window.runAllTests = runAllTests
  
  console.log('🔍 Funções disponíveis:')
  console.log('🔍 - testSurveyAPI()')
  console.log('🔍 - checkModalState()')
  console.log('🔍 - checkDropdowns()')
  console.log('🔍 - checkCheckboxes()')
  console.log('🔍 - runAllTests()')
}

// Auto-executar alguns testes
setTimeout(() => {
  runAllTests()
}, 1000)