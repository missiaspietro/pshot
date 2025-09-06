// Debug específico para investigar problema de clique em produção
console.log('🔍 Investigando problema de clique em produção...');

// Função para verificar se os elementos estão sendo renderizados
function checkButtonElements() {
  console.log('🔘 Verificando elementos de botão...');
  
  // Procurar por botões de QR Code
  const qrButtons = document.querySelectorAll('button');
  console.log(`📊 Total de botões encontrados: ${qrButtons.length}`);
  
  // Filtrar botões que contêm texto relacionado a QR Code
  const qrCodeButtons = Array.from(qrButtons).filter(btn => {
    const text = btn.textContent?.toLowerCase() || '';
    return text.includes('qr') || text.includes('gerar') || text.includes('conectar');
  });
  
  console.log(`📊 Botões relacionados a QR Code: ${qrCodeButtons.length}`);
  
  qrCodeButtons.forEach((btn, index) => {
    console.log(`🔘 Botão ${index + 1}:`, {
      text: btn.textContent?.trim(),
      disabled: btn.disabled,
      className: btn.className,
      hasClickListener: btn.onclick !== null,
      hasEventListeners: getEventListeners ? getEventListeners(btn) : 'N/A'
    });
  });
  
  return qrCodeButtons;
}

// Função para verificar se há erros JavaScript
function checkJavaScriptErrors() {
  console.log('🐛 Verificando erros JavaScript...');
  
  // Capturar erros futuros
  window.addEventListener('error', (event) => {
    console.error('💥 Erro JavaScript capturado:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
  
  // Capturar erros de Promise rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Promise rejeitada capturada:', {
      reason: event.reason,
      promise: event.promise
    });
  });
  
  console.log('✅ Listeners de erro configurados');
}

// Função para verificar o estado do React
function checkReactState() {
  console.log('⚛️ Verificando estado do React...');
  
  // Tentar encontrar elementos React
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
  console.log(`📊 Elementos React encontrados: ${reactElements.length}`);
  
  // Verificar se há componentes com erros
  const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
  console.log(`📊 Error boundaries encontrados: ${errorBoundaries.length}`);
  
  // Verificar console para erros do React
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('React')) {
      console.log('⚛️ Erro do React capturado:', args);
    }
    originalError.apply(console, args);
  };
}

// Função para simular clique nos botões
function simulateClicks() {
  console.log('🖱️ Simulando cliques nos botões...');
  
  const qrButtons = checkButtonElements();
  
  qrButtons.forEach((btn, index) => {
    if (!btn.disabled) {
      console.log(`🖱️ Simulando clique no botão ${index + 1}...`);
      
      try {
        // Tentar diferentes tipos de eventos
        btn.click();
        
        // Também tentar evento manual
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        btn.dispatchEvent(clickEvent);
        
        console.log(`✅ Clique simulado no botão ${index + 1}`);
      } catch (error) {
        console.error(`❌ Erro ao simular clique no botão ${index + 1}:`, error);
      }
    } else {
      console.log(`⏸️ Botão ${index + 1} está desabilitado`);
    }
  });
}

// Função para verificar network requests
function monitorNetworkRequests() {
  console.log('🌐 Monitorando requisições de rede...');
  
  // Interceptar fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('📡 Fetch interceptado:', args[0]);
    
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('📥 Resposta do fetch:', {
          url: args[0],
          status: response.status,
          statusText: response.statusText
        });
        return response;
      })
      .catch(error => {
        console.error('💥 Erro no fetch:', {
          url: args[0],
          error: error.message
        });
        throw error;
      });
  };
  
  console.log('✅ Interceptador de fetch configurado');
}

// Função para verificar variáveis de ambiente no cliente
function checkClientEnvironment() {
  console.log('🌍 Verificando ambiente do cliente...');
  
  console.log('📊 Informações do ambiente:', {
    userAgent: navigator.userAgent,
    url: window.location.href,
    origin: window.location.origin,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isProduction: window.location.hostname !== 'localhost'
  });
  
  // Verificar variáveis de ambiente públicas
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL
  };
  
  console.log('🔧 Variáveis de ambiente:', env);
}

// Função para verificar se há problemas de CSP ou CORS
function checkSecurityPolicies() {
  console.log('🔒 Verificando políticas de segurança...');
  
  // Verificar CSP
  const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
  console.log(`📊 Meta tags CSP encontradas: ${metaTags.length}`);
  
  metaTags.forEach((meta, index) => {
    console.log(`🔒 CSP ${index + 1}:`, meta.content);
  });
  
  // Verificar headers de resposta (se possível)
  fetch(window.location.href, { method: 'HEAD' })
    .then(response => {
      console.log('📊 Headers de resposta:', Object.fromEntries(response.headers.entries()));
    })
    .catch(error => {
      console.log('⚠️ Não foi possível verificar headers:', error.message);
    });
}

// Função principal para executar todos os testes
function runProductionDebug() {
  console.log('🚀 Iniciando debug completo de produção...');
  
  checkClientEnvironment();
  checkJavaScriptErrors();
  checkReactState();
  monitorNetworkRequests();
  checkSecurityPolicies();
  
  // Aguardar um pouco para a página carregar completamente
  setTimeout(() => {
    checkButtonElements();
    
    // Aguardar mais um pouco antes de simular cliques
    setTimeout(() => {
      simulateClicks();
    }, 2000);
  }, 1000);
  
  console.log('✅ Debug de produção configurado');
}

// Executar automaticamente
if (typeof window !== 'undefined') {
  // Aguardar o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runProductionDebug);
  } else {
    runProductionDebug();
  }
}

// Exportar para uso manual
window.productionDebug = {
  checkButtonElements,
  checkJavaScriptErrors,
  checkReactState,
  simulateClicks,
  monitorNetworkRequests,
  checkClientEnvironment,
  checkSecurityPolicies,
  runProductionDebug
};

console.log('💡 Para executar manualmente: window.productionDebug.runProductionDebug()');
console.log('💡 Para verificar botões: window.productionDebug.checkButtonElements()');
console.log('💡 Para simular cliques: window.productionDebug.simulateClicks()');