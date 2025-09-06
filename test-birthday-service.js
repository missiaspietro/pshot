/**
 * Script de teste para verificar se o birthday-service está funcionando
 * Execute no console do navegador na página /birthdays
 */

console.log('🧪 Testando birthday-service...');

// Testar busca de mensagens
async function testBirthdayService() {
  try {
    console.log('\n📋 Teste 1: Verificando localStorage...');
    const localUser = localStorage.getItem('ps_user');
    console.log('Dados no localStorage:', localUser ? JSON.parse(localUser) : 'Nenhum');
    
    console.log('\n📋 Teste 2: Testando busca de mensagens...');
    
    // Importar o service (se disponível globalmente)
    if (typeof birthdayService !== 'undefined') {
      const messages = await birthdayService.getBirthdayMessages();
      console.log('✅ Mensagens encontradas:', messages.length);
      console.log('Mensagens:', messages);
    } else {
      console.log('⚠️ birthdayService não disponível globalmente');
      
      // Testar diretamente via fetch
      console.log('\n📋 Teste 3: Testando via fetch...');
      const response = await fetch('/api/user/profile');
      const userData = await response.json();
      console.log('Dados do usuário via API:', userData);
      
      if (userData && !userData.error) {
        // Salvar no localStorage para o service usar
        localStorage.setItem('ps_user', JSON.stringify(userData));
        console.log('✅ Dados salvos no localStorage');
        
        // Recarregar a página para testar
        console.log('💡 Recarregue a página e tente criar uma mensagem novamente');
      }
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testBirthdayService();