/**
 * Script de debug para testar a API de usuário
 * Execute no console do navegador na página /birthdays
 */

console.log('🔍 Debug da API de usuário...');

// Testar a API diretamente
fetch('/api/user/profile')
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Resposta da API:', data);
    
    if (data.error) {
      console.error('❌ Erro:', data.error);
    } else {
      console.log('✅ Dados do usuário:');
      console.log('- Email:', data.email);
      console.log('- Nome:', data.nome);
      console.log('- Empresa:', data.empresa);
      console.log('- Sub-rede:', data.sub_rede);
      console.log('- Sistema:', data.sistema);
    }
  })
  .catch(error => {
    console.error('💥 Erro na requisição:', error);
  });