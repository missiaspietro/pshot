// Debug específico para investigar problema de QR Code em produção
console.log('🔍 Iniciando investigação do problema de QR Code...');

// Verificar ambiente
console.log('🌍 Ambiente atual:');
console.log('- URL:', window.location.href);
console.log('- Origin:', window.location.origin);
console.log('- Hostname:', window.location.hostname);
console.log('- Protocol:', window.location.protocol);

// Verificar se é produção ou desenvolvimento
const isProduction = window.location.hostname !== 'localhost';
console.log('🏭 Modo:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');

// Função para testar a API webhook local
async function testWebhookAPI() {
  console.log('🚀 Testando API webhook local...');
  
  const requestBody = {
    nome: "teste-debug",
    token: "teste-token",
    rededeLoja: "teste-rede",
    subRede: "teste-sub",
    loja: "teste-loja",
    qrcode: true,
    integration: "WHATSAPP-BAILEYS"
  };
  
  console.log('📤 Enviando requisição para /api/webhook');
  console.log('📋 Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch('/api/webhook', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Status:', response.status, response.statusText);
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na resposta:', errorData);
      return { success: false, error: errorData };
    }
    
    const data = await response.json();
    console.log('✅ Resposta da API:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('💥 Erro de rede:', error);
    return { success: false, error: error.message };
  }
}

// Função para verificar variáveis de ambiente (lado cliente)
function checkEnvironmentVariables() {
  console.log('🔧 Verificando variáveis de ambiente...');
  
  // Estas são as únicas variáveis visíveis no cliente
  const publicVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_WEBHOOK_URL': process.env.NEXT_PUBLIC_WEBHOOK_URL
  };
  
  Object.entries(publicVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: CONFIGURADA`);
      if (key === 'NEXT_PUBLIC_WEBHOOK_URL') {
        console.log(`🔗 URL: ${value}`);
      }
    } else {
      console.log(`❌ ${key}: NÃO CONFIGURADA`);
    }
  });
}

// Função para testar conectividade direta com o webhook externo
async function testExternalWebhook() {
  console.log('🌐 Testando webhook externo...');
  
  // URLs conhecidas baseadas nos arquivos de configuração
  const webhookUrls = [
    'https://praisewhk.praisesistemas.uk/webhook/criarqrpshot', // Local
    'https://pshot.praisechat.com.br/api/webhook' // Produção
  ];
  
  for (const url of webhookUrls) {
    console.log(`🔗 Testando: ${url}`);
    
    try {
      const response = await fetch(url, {
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
      
      console.log(`📊 ${url} - Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${url} - Resposta:`, data);
      } else {
        const error = await response.text();
        console.log(`❌ ${url} - Erro:`, error);
      }
      
    } catch (error) {
      console.error(`💥 ${url} - Erro de rede:`, error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🚫 Possível problema de CORS, DNS ou conectividade');
      }
    }
  }
}

// Função para simular o fluxo completo como na tela de robôs
async function simulateRobotFlow() {
  console.log('🤖 Simulando fluxo completo da tela de robôs...');
  
  const botData = {
    nome: "teste-simulacao",
    token: "teste-token",
    rede: "teste-rede",
    sub_rede: "teste-sub",
    loja: "teste-loja",
    status: "disconnected"
  };
  
  console.log('📋 Dados do bot simulado:', botData);
  
  // Simular a requisição exata que é feita na tela de robôs
  const requestBody = {
    nome: botData.nome,
    token: botData.token || botData.nome,
    rededeLoja: botData.rede || "",
    subRede: botData.sub_rede || "",
    loja: botData.loja || "",
    qrcode: true,
    integration: "WHATSAPP-BAILEYS"
  };
  
  console.log('📤 Simulando requisição da tela de robôs...');
  console.log('📋 Body da requisição:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch('/api/webhook', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Status da simulação:', response.status, response.statusText);
    console.log('📥 Headers da simulação:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na simulação:', errorData);
    } else {
      const data = await response.json();
      console.log('✅ Sucesso na simulação:', data);
    }
    
  } catch (error) {
    console.error('💥 Erro na simulação:', error);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🎯 Executando todos os testes de debug...');
  
  checkEnvironmentVariables();
  
  await testWebhookAPI();
  
  await testExternalWebhook();
  
  await simulateRobotFlow();
  
  console.log('🏁 Testes de debug concluídos!');
}

// Executar automaticamente se estiver no browser
if (typeof window !== 'undefined') {
  runAllTests();
}

// Exportar para uso manual
window.debugQRCode = {
  testWebhookAPI,
  checkEnvironmentVariables,
  testExternalWebhook,
  simulateRobotFlow,
  runAllTests
};

console.log('💡 Para executar manualmente, use: window.debugQRCode.runAllTests()');