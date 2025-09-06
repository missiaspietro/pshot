/**
 * Teste específico para simular a chamada da API de cashback como o modal faz
 */

require('dotenv').config({ path: '.env.local' })

async function testCashbackApiCall() {
  console.log('🧪 TESTE: Simulando chamada da API de cashback como o modal faz')
  console.log('=' .repeat(80))

  try {
    // Simular dados que o modal enviaria
    const requestData = {
      selectedFields: ['Nome', 'Whatsapp', 'Loja', 'Status', 'Envio_novo'],
      startDate: '2024-01-01',
      endDate: '2025-12-31'
    }

    console.log('📤 Dados da requisição:', requestData)

    // Fazer a chamada HTTP como o modal faz
    const response = await fetch('http://localhost:3000/api/reports/cashback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Simular cookie de sessão (você pode precisar ajustar isso)
        'Cookie': 'ps_session=pi@pi.com_authenticated'
      },
      body: JSON.stringify(requestData)
    })

    console.log('📥 Status da resposta:', response.status)
    console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro da API:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        console.error('❌ Erro estruturado:', errorData)
      } catch {
        console.error('❌ Erro não é JSON válido')
      }
      
      return
    }

    const result = await response.json()
    console.log('✅ Resposta da API:', {
      success: result.success,
      total: result.total,
      dataLength: result.data?.length || 0,
      userEmpresa: result.userEmpresa,
      userInfo: result.userInfo,
      message: result.message
    })

    if (result.data && result.data.length > 0) {
      console.log('📊 Exemplo de dados retornados:')
      console.log(result.data[0])
    } else {
      console.log('📭 Nenhum dado retornado')
    }

  } catch (error) {
    console.error('💥 Erro na chamada da API:', error)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 PROBLEMA: Servidor não está rodando!')
      console.log('💡 SOLUÇÃO: Execute "npm run dev" para iniciar o servidor')
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('🧪 TESTE CONCLUÍDO')
}

// Executar se chamado diretamente
if (require.main === module) {
  testCashbackApiCall()
    .then(() => {
      console.log('✅ Teste concluído')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Erro no teste:', error)
      process.exit(1)
    })
}

module.exports = { testCashbackApiCall }