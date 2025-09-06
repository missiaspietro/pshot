// Teste para validar a correção do problema de QR Code
console.log('🔧 Testando correção do problema de QR Code...');

// Função para testar o webhook correto
async function testWebhookFix() {
  console.log('🚀 Testando webhook corrigido...');
  
  const correctWebhookUrl = 'https://praisewhk.praisesistemas.uk/webhook/criarqrpshot';
  
  console.log('🔗 URL correta do webhook:', correctWebhookUrl);
  
  const requestBody = {
    nome: "teste-correcao",
    token: "teste-token",
    rededeLoja: "teste-rede",
    subRede: "teste-sub",
    loja: "teste-loja",
    qrcode: true,
    integration: "WHATSAPP-BAILEYS"
  };
  
  console.log('📤 Enviando requisição de teste...');
  console.log('📋 Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    // Teste direto no webhook externo
    const directResponse = await fetch(correctWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Resposta direta do webhook:');
    console.log('- Status:', directResponse.status, directResponse.statusText);
    console.log('- Headers:', Object.fromEntries(directResponse.headers.entries()));
    
    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log('✅ Webhook externo funcionando:', data);
    } else {
      const error = await directResponse.text();
      console.log('❌ Erro no webhook externo:', error);
    }
    
    // Teste através da API local (que deve redirecionar para o webhook correto)
    console.log('\n🔄 Testando através da API local...');
    
    const apiResponse = await fetch('/api/webhook', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Resposta da API local:');
    console.log('- Status:', apiResponse.status, apiResponse.statusText);
    console.log('- Headers:', Object.fromEntries(apiResponse.headers.entries()));
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('✅ API local redirecionando corretamente:', data);
    } else {
      const error = await apiResponse.json();
      console.log('❌ Erro na API local:', error);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Função para verificar a configuração atual
function checkCurrentConfig() {
  console.log('🔍 Verificando configuração atual...');
  
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
  console.log('🔗 NEXT_PUBLIC_WEBHOOK_URL:', webhookUrl);
  
  if (webhookUrl === 'https://praisewhk.praisesistemas.uk/webhook/criarqrpshot') {
    console.log('✅ Configuração correta! Webhook aponta para o serviço externo.');
  } else if (webhookUrl === 'https://pshot.praisechat.com.br/api/webhook') {
    console.log('❌ Configuração incorreta! Webhook criaria loop infinito.');
  } else {
    console.log('⚠️ Configuração desconhecida:', webhookUrl);
  }
}

// Executar testes
checkCurrentConfig();
testWebhookFix();

console.log('\n📝 RESUMO DA CORREÇÃO:');
console.log('- Problema: Loop infinito na URL do webhook em produção');
console.log('- Causa: NEXT_PUBLIC_WEBHOOK_URL apontava para a própria aplicação');
console.log('- Solução: Corrigir URL para apontar para o webhook externo');
console.log('- Arquivos corrigidos: docker-compose.yml e Dockerfile');