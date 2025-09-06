/**
 * Script de teste para verificar se a API de perfil do usuário está funcionando
 * Execute este script no console do navegador
 */

console.log('🧪 Testando API de perfil do usuário...');

// Função para testar a API
async function testUserProfileAPI() {
  try {
    console.log('\n📋 Teste 1: Verificando cookie de sessão...');
    const cookies = document.cookie;
    const sessionMatch = cookies.match(/ps_session=([^;]+)/);
    
    if (!sessionMatch) {
      console.log('❌ Nenhuma sessão encontrada nos cookies');
      return;
    }
    
    const sessionValue = sessionMatch[1];
    const email = sessionValue.split('_')[0];
    console.log(`✅ Sessão encontrada para email: ${email}`);
    
    console.log('\n📋 Teste 2: Chamando API de perfil...');
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📊 Status da resposta: ${response.status}`);
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Dados do usuário carregados com sucesso:');
      console.log({
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        empresa: userData.empresa,
        rede: userData.rede,
        sub_rede: userData.sub_rede,
        sistema: userData.sistema
      });
      
      console.log('\n📋 Teste 3: Verificando campos necessários...');
      const hasRequiredFields = userData.email && userData.empresa;
      const hasSubRede = userData.sub_rede;
      
      console.log(`✅ Campos obrigatórios: ${hasRequiredFields ? 'OK' : 'FALTANDO'}`);
      console.log(`✅ Sub-rede: ${hasSubRede ? userData.sub_rede : 'NÃO DEFINIDA'}`);
      
      if (hasRequiredFields) {
        console.log('\n🎉 API funcionando corretamente!');
        console.log(`🎯 Sub-rede que será exibida: ${userData.sub_rede || userData.empresa || 'Não definida'}`);
      }
      
    } else {
      const errorData = await response.text();
      console.log('❌ Erro na API:');
      console.log(errorData);
    }
    
  } catch (error) {
    console.error('💥 Erro ao testar API:', error);
  }
}

// Executar o teste
testUserProfileAPI();

console.log('\n💡 Dica: Se ainda houver erro, verifique:');
console.log('1. Se o campo "subrede" existe na tabela users');
console.log('2. Se o usuário tem sistema = "Praise Shot"');
console.log('3. Se o email da sessão corresponde ao email na tabela');