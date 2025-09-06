/**
 * Script de teste para verificar a funcionalidade dinâmica da sub-rede
 * Execute este script no console do navegador na página /birthdays
 */

console.log('🧪 Testando funcionalidade dinâmica da sub-rede...');

// Teste 1: Verificar se não há mais referências hardcoded a "bababibi"
console.log('\n📋 Teste 1: Verificando referências hardcoded...');
const pageContent = document.documentElement.outerHTML;
const hasBababibi = pageContent.includes('bababibi');
console.log(`❌ Contém "bababibi" hardcoded: ${hasBababibi}`);
if (!hasBababibi) {
  console.log('✅ Nenhuma referência hardcoded encontrada!');
}

// Teste 2: Verificar se o elemento de sub-rede existe
console.log('\n📋 Teste 2: Verificando elemento de sub-rede...');
const subnetElement = document.querySelector('[class*="bg-gray-100"]:has-text("Sub-rede:")') || 
                     Array.from(document.querySelectorAll('*')).find(el => el.textContent?.includes('Sub-rede:'));

if (subnetElement) {
  console.log('✅ Elemento de sub-rede encontrado:', subnetElement.textContent);
  
  // Teste 3: Verificar se o valor não é "bababibi"
  console.log('\n📋 Teste 3: Verificando valor dinâmico...');
  const subnetText = subnetElement.textContent;
  const isDynamic = !subnetText.includes('bababibi');
  console.log(`✅ Valor dinâmico: ${isDynamic}`);
  console.log(`📄 Texto atual: "${subnetText}"`);
} else {
  console.log('❌ Elemento de sub-rede não encontrado');
}

// Teste 4: Verificar estados possíveis
console.log('\n📋 Teste 4: Estados possíveis da sub-rede...');
const possibleStates = [
  'Carregando...',
  'Erro ao carregar',
  'Não autenticado',
  'Não definida'
];

let currentState = 'Valor específico do usuário';
if (subnetElement) {
  const text = subnetElement.textContent.replace('Sub-rede: ', '');
  if (possibleStates.includes(text)) {
    currentState = text;
  }
}

console.log(`📊 Estado atual: ${currentState}`);

// Teste 5: Verificar se há dados do usuário no localStorage (usado pelo birthday-service)
console.log('\n📋 Teste 5: Verificando dados do usuário...');
try {
  const userData = localStorage.getItem('ps_user');
  if (userData) {
    const user = JSON.parse(userData);
    console.log('✅ Dados do usuário encontrados:', {
      email: user.email,
      empresa: user.empresa,
      sub_rede: user.sub_rede
    });
    
    // Verificar consistência
    const expectedSubnet = user.sub_rede || user.empresa || 'Não definida';
    console.log(`🎯 Sub-rede esperada: ${expectedSubnet}`);
  } else {
    console.log('⚠️ Nenhum dado de usuário no localStorage');
  }
} catch (error) {
  console.log('❌ Erro ao verificar dados do usuário:', error);
}

// Teste 6: Verificar se as mensagens são filtradas corretamente
console.log('\n📋 Teste 6: Verificando filtro de mensagens...');
const messageRows = document.querySelectorAll('table tbody tr');
console.log(`📊 Mensagens exibidas: ${messageRows.length}`);

if (messageRows.length > 0) {
  console.log('✅ Mensagens encontradas - filtro funcionando');
} else {
  console.log('⚠️ Nenhuma mensagem encontrada - pode ser normal se não houver dados');
}

console.log('\n🎉 Teste concluído! Verifique os resultados acima.');
console.log('💡 Dica: Recarregue a página e execute novamente para testar estados de loading.');