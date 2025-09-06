// Script de teste para verificar a conexão com a tabela de promoções
// Execute este script para testar se há dados na tabela "Relatorio Envio de Promoções"

console.log('🔍 Testando conexão com tabela de promoções...')

// Simular uma requisição para a API de promoções
async function testPromotionsConnection() {
  try {
    console.log('📤 Enviando requisição de teste...')
    
    const response = await fetch('http://localhost:3000/api/reports/promotions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione aqui o cookie de sessão se necessário
        'Cookie': 'ps_session=seu_email_aqui_teste'
      },
      body: JSON.stringify({
        selectedFields: ['Cliente', 'Whatsapp', 'Loja', 'Enviado', 'Data_Envio'],
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
    })

    console.log('📥 Status da resposta:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', errorText)
      return
    }

    const result = await response.json()
    console.log('✅ Resposta recebida:', {
      success: result.success,
      total: result.total,
      dataLength: result.data?.length || 0,
      userEmpresa: result.userEmpresa,
      message: result.message
    })

    if (result.data && result.data.length > 0) {
      console.log('📊 Primeiro registro:', result.data[0])
    } else {
      console.log('📭 Nenhum dado encontrado')
      console.log('🔍 Possíveis causas:')
      console.log('   1. Tabela vazia')
      console.log('   2. Filtro por empresa não encontrou dados')
      console.log('   3. Problema de autenticação')
      console.log('   4. Filtro de data muito restritivo')
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error.message)
  }
}

// Executar o teste
testPromotionsConnection()

console.log('📝 Para usar este script:')
console.log('   1. Certifique-se de que o servidor está rodando')
console.log('   2. Substitua "seu_email_aqui_teste" pelo email real de um usuário')
console.log('   3. Execute: node test-promotions-connection.js')