// Teste final para verificar se o salvamento de promoções funciona
console.log('🎯 Teste Final: Salvamento de Promoções');

const testPromotionsSave = () => {
  console.log('🚀 Iniciando teste...');
  
  // 1. Verificar se há configurações de promoções
  console.log('🔍 Verificando configurações existentes...');
  
  // 2. Simular abertura do modal
  console.log('📱 Para testar:');
  console.log('   1. Selecione alguns campos no card de Promoções');
  console.log('   2. Clique no botão "Salvar" do card');
  console.log('   3. Digite um nome no modal (ex: "Teste Promoções")');
  console.log('   4. Clique no botão "Salvar" do modal');
  console.log('   5. Verifique se aparece nos logs: 🎯 [PROMOÇÕES] Iniciando salvamento...');
  
  // 3. Interceptar logs para verificar se a função é chamada
  const originalLog = console.log;
  let promotionsLogFound = false;
  
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('[PROMOÇÕES]')) {
      promotionsLogFound = true;
      originalLog('✅ FUNÇÃO CHAMADA:', ...args);
    } else {
      originalLog(...args);
    }
  };
  
  // Restaurar após 30 segundos
  setTimeout(() => {
    console.log = originalLog;
    if (promotionsLogFound) {
      console.log('✅ SUCESSO: Função de salvamento foi chamada!');
    } else {
      console.log('❌ Função de salvamento não foi chamada ainda');
    }
  }, 30000);
  
  console.log('✅ Interceptação ativa por 30 segundos');
  console.log('💡 Execute o teste manual agora');
};

// Executar automaticamente
testPromotionsSave();

// Disponibilizar globalmente
window.testPromotionsSave = testPromotionsSave;