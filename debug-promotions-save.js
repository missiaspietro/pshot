// Debug para testar o salvamento de configurações de promoções
console.log('🔧 Debug: Salvamento de Configurações de Promoções');

// Função para testar se a função handleSavePromotionsConfiguration existe
const testSaveFunction = () => {
  console.log('🔍 Verificando se as funções de salvamento existem...');
  
  // Tentar acessar o React DevTools para ver o estado do componente
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('✅ React DevTools disponível');
  }
  
  // Verificar se há elementos com data attributes ou classes específicas
  const promotionsCard = document.querySelector('[data-testid="promotions-card"], .bg-gradient-to-br');
  if (promotionsCard && promotionsCard.textContent?.includes('Promoções')) {
    console.log('✅ Card de promoções encontrado');
    
    // Verificar se há checkboxes selecionados
    const checkboxes = promotionsCard.querySelectorAll('input[type="checkbox"]:checked');
    console.log(`📊 Checkboxes selecionados: ${checkboxes.length}`);
    
    checkboxes.forEach((checkbox, index) => {
      const label = checkbox.closest('div')?.querySelector('label')?.textContent;
      console.log(`   ${index + 1}. ${label || 'Sem label'} (${checkbox.id})`);
    });
  }
};

// Função para interceptar chamadas de salvamento
const interceptSaveCall = () => {
  console.log('🕵️ Configurando interceptação de chamadas de salvamento...');
  
  // Interceptar fetch calls
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1];
    
    if (typeof url === 'string' && url.includes('report-filters')) {
      console.log('🚀 Interceptada chamada de salvamento!');
      console.log('📍 URL:', url);
      console.log('📋 Options:', options);
      
      if (options && options.body) {
        try {
          const body = JSON.parse(options.body);
          console.log('📦 Body da requisição:', body);
        } catch (e) {
          console.log('📦 Body (raw):', options.body);
        }
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Interceptação configurada');
};

// Função para simular salvamento manual
const simulateSave = () => {
  console.log('🧪 Simulando salvamento manual...');
  
  // Encontrar o botão de salvar no modal
  const saveButtons = document.querySelectorAll('button');
  const modalSaveButton = Array.from(saveButtons).find(button => 
    button.textContent?.includes('Salvar') && 
    button.closest('[role="dialog"]')
  );
  
  if (modalSaveButton) {
    console.log('✅ Botão de salvar do modal encontrado');
    console.log('📍 Botão:', modalSaveButton);
    console.log('🔧 Disabled:', modalSaveButton.disabled);
    
    if (!modalSaveButton.disabled) {
      console.log('🖱️ Clicando no botão...');
      modalSaveButton.click();
    } else {
      console.log('⚠️ Botão está desabilitado');
    }
  } else {
    console.log('❌ Botão de salvar do modal não encontrado');
    console.log('💡 Certifique-se de que o modal está aberto');
  }
};

// Função para verificar o estado do modal
const checkModalState = () => {
  console.log('🔍 Verificando estado do modal...');
  
  const modals = document.querySelectorAll('[role="dialog"]');
  console.log(`📊 Modais encontrados: ${modals.length}`);
  
  modals.forEach((modal, index) => {
    console.log(`   Modal ${index + 1}:`);
    console.log(`     - Visível: ${modal.style.display !== 'none'}`);
    console.log(`     - Conteúdo inclui "Salvar": ${modal.textContent?.includes('Salvar')}`);
    console.log(`     - Conteúdo inclui "Configuração": ${modal.textContent?.includes('Configuração')}`);
    
    // Verificar inputs no modal
    const inputs = modal.querySelectorAll('input');
    console.log(`     - Inputs: ${inputs.length}`);
    inputs.forEach((input, inputIndex) => {
      console.log(`       Input ${inputIndex + 1}: ${input.type} = "${input.value}"`);
    });
  });
};

// Executar testes
const runDebug = () => {
  console.log('🚀 Iniciando debug...');
  console.log('');
  
  testSaveFunction();
  console.log('');
  
  interceptSaveCall();
  console.log('');
  
  checkModalState();
  console.log('');
  
  console.log('✅ Debug configurado');
  console.log('💡 Para simular salvamento: simulateSave()');
  console.log('💡 Para verificar modal: checkModalState()');
};

// Disponibilizar funções globalmente
window.debugPromotionsSave = {
  runDebug,
  testSaveFunction,
  interceptSaveCall,
  simulateSave,
  checkModalState
};

// Executar automaticamente
runDebug();