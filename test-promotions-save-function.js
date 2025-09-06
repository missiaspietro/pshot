// Teste específico para verificar se a função de salvamento está sendo chamada
console.log('🧪 Teste: Função de Salvamento de Promoções');

// Função para interceptar console.log e verificar se os logs de debug aparecem
const interceptLogs = () => {
  const originalLog = console.log;
  const logs = [];
  
  console.log = function(...args) {
    const message = args.join(' ');
    logs.push(message);
    
    // Se for um log de promoções, destacar
    if (message.includes('[PROMOÇÕES]')) {
      originalLog('🎯 INTERCEPTADO:', ...args);
    } else {
      originalLog(...args);
    }
  };
  
  return {
    getLogs: () => logs,
    restore: () => { console.log = originalLog; }
  };
};

// Função para simular entrada de texto no modal
const fillModalInput = (text) => {
  const modal = document.querySelector('[role="dialog"]');
  if (!modal) {
    console.log('❌ Modal não encontrado');
    return false;
  }
  
  const input = modal.querySelector('input[type="text"]');
  if (!input) {
    console.log('❌ Input não encontrado no modal');
    return false;
  }
  
  console.log('✅ Input encontrado, preenchendo com:', text);
  
  // Simular entrada de texto
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  
  console.log('✅ Texto inserido:', input.value);
  return true;
};

// Função para clicar no botão salvar do modal
const clickModalSaveButton = () => {
  const modal = document.querySelector('[role="dialog"]');
  if (!modal) {
    console.log('❌ Modal não encontrado');
    return false;
  }
  
  const saveButtons = modal.querySelectorAll('button');
  const saveButton = Array.from(saveButtons).find(button => 
    button.textContent?.includes('Salvar') && !button.textContent?.includes('Cancelar')
  );
  
  if (!saveButton) {
    console.log('❌ Botão Salvar não encontrado no modal');
    console.log('📋 Botões encontrados:', Array.from(saveButtons).map(b => b.textContent));
    return false;
  }
  
  console.log('✅ Botão Salvar encontrado');
  console.log('🔧 Disabled:', saveButton.disabled);
  
  if (saveButton.disabled) {
    console.log('⚠️ Botão está desabilitado');
    return false;
  }
  
  console.log('🖱️ Clicando no botão Salvar...');
  saveButton.click();
  return true;
};

// Função para teste completo
const testCompleteSave = async () => {
  console.log('🚀 Iniciando teste completo de salvamento...');
  
  // 1. Interceptar logs
  const logInterceptor = interceptLogs();
  
  // 2. Verificar se modal está aberto
  const modal = document.querySelector('[role="dialog"]');
  if (!modal) {
    console.log('❌ Modal não está aberto. Abra o modal primeiro.');
    return;
  }
  
  console.log('✅ Modal está aberto');
  
  // 3. Preencher input
  const inputFilled = fillModalInput('Teste Promoções ' + Date.now());
  if (!inputFilled) {
    console.log('❌ Falha ao preencher input');
    return;
  }
  
  // 4. Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 5. Clicar no botão salvar
  const clicked = clickModalSaveButton();
  if (!clicked) {
    console.log('❌ Falha ao clicar no botão');
    return;
  }
  
  // 6. Aguardar e verificar logs
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const logs = logInterceptor.getLogs();
  const promotionsLogs = logs.filter(log => log.includes('[PROMOÇÕES]'));
  
  console.log('📊 Total de logs capturados:', logs.length);
  console.log('🎯 Logs de promoções:', promotionsLogs.length);
  
  if (promotionsLogs.length > 0) {
    console.log('✅ SUCESSO: Função de salvamento foi chamada!');
    promotionsLogs.forEach(log => console.log('   -', log));
  } else {
    console.log('❌ FALHA: Função de salvamento não foi chamada');
    console.log('💡 Últimos 10 logs:');
    logs.slice(-10).forEach(log => console.log('   -', log));
  }
  
  // 7. Restaurar console.log
  logInterceptor.restore();
  
  console.log('✅ Teste completo finalizado');
};

// Disponibilizar funções globalmente
window.testPromotionsSaveFunction = {
  interceptLogs,
  fillModalInput,
  clickModalSaveButton,
  testCompleteSave
};

console.log('✅ Teste configurado');
console.log('💡 Para executar teste completo: testCompleteSave()');
console.log('💡 Certifique-se de que o modal está aberto primeiro');

// Disponibilizar função principal globalmente
window.testCompleteSave = testCompleteSave;