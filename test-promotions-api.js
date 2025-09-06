// Script para testar a API de promoções diretamente
// Execute: node test-promotions-api.js

const fetch = require('node-fetch')

async function testPromotionsAPI() {
  console.log('🔍 TESTANDO API DE PROMOÇÕES')
  console.log('===============================')

  try {
    // Simular dados que o modal enviaria
    const requestData = {
      selectedFields: ['Cliente', 'Whatsapp', 'Loja', 'Enviado', 'Data_Envio'],
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    }

    console.log('📤 Dados da requisição:', requestData)

    // Fazer requisição para a API (sem cookie - vai dar erro de auth)
    const response = await fetch('http://localhost:3000/api/reports/promotions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Simular cookie de sessão (substitua pelo seu email real)
        'Cookie': 'ps_session=pi@pi.com_12345'
      },
      body: JSON.stringify(requestData)
    })

    console.log('📥 Status da resposta:', response.status)
    console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('📥 Resposta bruta:', responseText)

    try {
      const responseData = JSON.parse(responseText)
      console.log('📊 Dados da resposta:', responseData)
      
      if (responseData.data) {
        console.log('✅ Registros retornados:', responseData.data.length)
        if (responseData.data.length > 0) {
          console.log('📋 Primeiro registro:', responseData.data[0])
        }
      }
    } catch (parseError) {
      console.log('❌ Erro ao fazer parse da resposta:', parseError.message)
    }

  } catch (error) {
    console.error('💥 Erro na requisição:', error.message)
  }
}

testPromotionsAPI()