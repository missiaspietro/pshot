// Teste simples para verificar se o modal de salvamento de promoções está funcionando
// Este arquivo pode ser executado no console do navegador para testar a funcionalidade

console.log('🧪 Teste do Modal de Salvamento de Promoções');

// Verificar se os elementos existem na página
const checkElements = () => {
  console.log('🔍 Verificando elementos na página...');
  
  // Procurar pelo botão Salvar no card de promoções
  const saveButtons = document.querySelectorAll('button');
  const promotionsSaveButton = Array.from(saveButtons).find(button => 
    button.textContent?.includes('Salvar') && 
    button.closest('.bg-gradient-to-br')?.textContent?.includes('Relatório de Promoções')
  );
  
  if (promotionsSaveButton) {
    console.log('✅ Botão "Salvar" do card de promoções encontrado');
    console.log('📍 Elemento:', promotionsSaveButton);
    
    // Verificar se o botão está habilitado
    if (promotionsSaveButton.disabled) {
      console.log('⚠️ Botão está desabilitado (normal se nenhum campo estiver selecionado)');
    } else {
      console.log('✅ Botão está habilitado');
    }
    
    return promotionsSaveButton;
  } else {
    console.log('❌ Botão "Salvar" do card de promoções não encontrado');
    return null;
  }
};

// Verificar se o modal existe no DOM
const checkModal = () => {
  console.log('🔍 Verificando se o modal existe no DOM...');
  
  // Procurar por elementos de modal
  const modals = document.querySelectorAll('[role="dialog"], .modal, [data-state]');
  console.log(`📊 Total de modais encontrados: ${modals.length}`);
  
  modals.forEach((modal, index) => {
    console.log(`   Modal ${index + 1}:`, modal);
  });
};

// Simular clique no botão (se estiver habilitado)
const testButtonClick = (button) => {
  if (!button) return;
  
  console.log('🖱️ Simulando clique no botão...');
  
  if (button.disabled) {
    console.log('⚠️ Não é possível clicar - botão desabilitado');
    console.log('💡 Dica: Selecione alguns campos de promoções primeiro');
    return;
  }
  
  // Simular clique
  button.click();
  
  // Aguardar um pouco e verificar se o modal apareceu
  setTimeout(() => {
    console.log('🔍 Verificando se o modal apareceu após o clique...');
    checkModal();
    
    // Procurar especificamente por modal de salvamento
    const saveModal = document.querySelector('[role="dialog"]');
    if (saveModal && saveModal.textContent?.includes('Salvar')) {
      console.log('✅ Modal de salvamento apareceu!');
      console.log('📍 Modal:', saveModal);
    } else {
      console.log('❌ Modal de salvamento não apareceu');
    }
  }, 100);
};

// Executar testes
const runTests = () => {
  console.log('🚀 Iniciando testes...');
  
  const button = checkElements();
  checkModal();
  
  if (button) {
    console.log('');
    console.log('🧪 Para testar o clique, execute: testButtonClick(button)');
    console.log('💡 Certifique-se de que alguns campos estejam selecionados primeiro');
    
    // Disponibilizar função globalmente para teste manual
    window.testPromotionsSaveButton = () => testButtonClick(button);
  }
  
  console.log('');
  console.log('✅ Testes concluídos');
  console.log('📝 Para testar manualmente: window.testPromotionsSaveButton()');
};

// Executar
runTests();