// Teste específico para produção
console.log('🚀 Testando webhook em produção...');

// Função para testar conectividade com o webhook
async function testWebhookConnectivity() {
  const webhookUrl = 'https://praisewhk.praisesistemas.uk/webhook/criarqrpshot';
  
  console.log('🔗 Testando conectividade com:', webhookUrl);
  
  try {
    // Teste básico de conectividade
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: "teste-conectividade",
        token: "teste",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📊 Response Body:', text);
    
  } catch (error) {
    console.error('💥 Erro de conectividade:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🚫 Possível problema de CORS ou rede');
    }
  }
}

// Função para verificar se a API local está funcionando
async function testLocalAPI() {
  console.log('🏠 Testando API local /api/webhook...');
  
  try {
    const response = await fetch('/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: "teste-local",
        token: "teste",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    });
    
    console.log('📊 API Local Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Local funcionando:', data);
    } else {
      const error = await response.json();
      console.error('❌ Erro na API Local:', error);
    }
    
  } catch (error) {
    console.error('💥 Erro na API Local:', error);
  }
}

// Executar testes
testLocalAPI();
testWebhookConnectivity();