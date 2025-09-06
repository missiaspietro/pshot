// 🔍 DEBUG: Conexão de Promoções - Investigar por que retorna vazio
// Este arquivo vai testar cada etapa da conexão para identificar o problema

console.log('🔍 INICIANDO DEBUG DA CONEXÃO DE PROMOÇÕES')
console.log('=' .repeat(60))

// Simular dados que seriam enviados pelo modal
const testData = {
  selectedFields: ['Cliente', 'Whatsapp', 'Loja', 'Data_Envio'],
  startDate: '2024-01-01',
  endDate: '2024-12-31'
}

console.log('📤 DADOS DE TESTE:')
console.log('   selectedFields:', testData.selectedFields)
console.log('   startDate:', testData.startDate)
console.log('   endDate:', testData.endDate)
console.log('')

// Testar a API de promoções
async function testPromotionsAPI() {
  try {
    console.log('🔄 TESTANDO API /api/reports/promotions...')
    
    const response = await fetch('http://localhost:3000/api/reports/promotions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Simular cookie de sessão (você precisa pegar o cookie real do browser)
        'Cookie': 'ps_session=seu_email_aqui_teste@empresa.com'
      },
      body: JSON.stringify(testData)
    })

    console.log('📥 STATUS DA RESPOSTA:', response.status)
    console.log('📥 HEADERS DA RESPOSTA:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ ERRO NA API:', errorText)
      return
    }

    const result = await response.json()
    console.log('✅ RESPOSTA DA API:')
    console.log('   success:', result.success)
    console.log('   total:', result.total)
    console.log('   userEmpresa:', result.userEmpresa)
    console.log('   userInfo:', result.userInfo)
    console.log('   message:', result.message)
    console.log('   data length:', result.data?.length || 0)
    
    if (result.data && result.data.length > 0) {
      console.log('📋 PRIMEIRO REGISTRO:')
      console.log('   ', result.data[0])
    } else {
      console.log('📭 NENHUM DADO RETORNADO')
      
      // Investigar possíveis causas
      console.log('')
      console.log('🔍 POSSÍVEIS CAUSAS DO PROBLEMA:')
      console.log('1. ❓ Empresa do usuário não confere com campo "Rede" na tabela')
      console.log('2. ❓ Filtros de data muito restritivos')
      console.log('3. ❓ Campos selecionados inválidos')
      console.log('4. ❓ Problema de autenticação')
      console.log('5. ❓ Nome da tabela incorreto')
    }

  } catch (error) {
    console.error('💥 ERRO NO TESTE:', error.message)
  }
}

// Testar conexão direta com Supabase (simulação)
function testSupabaseQuery() {
  console.log('')
  console.log('🔍 SIMULANDO QUERY DO SUPABASE:')
  console.log('   Tabela: "Relatorio Envio de Promoções"')
  console.log('   Campos: Cliente, Whatsapp, Loja, Data_Envio, Id')
  console.log('   Filtro: .eq("Rede", userEmpresa)')
  console.log('   Filtro: .gte("Data_Envio", "2024-01-01")')
  console.log('   Filtro: .lte("Data_Envio", "2024-12-31")')
  console.log('   Limite: 1000 registros')
  console.log('')
  console.log('❓ VERIFICAÇÕES NECESSÁRIAS:')
  console.log('1. A tabela "Relatorio Envio de Promoções" existe?')
  console.log('2. O campo "Rede" existe e tem dados?')
  console.log('3. O campo "Data_Envio" está no formato correto?')
  console.log('4. Qual é o valor exato da empresa do usuário?')
}

// Executar testes
console.log('🚀 EXECUTANDO TESTES...')
console.log('')

testSupabaseQuery()

// Para testar a API, descomente a linha abaixo e ajuste o cookie
// testPromotionsAPI()

console.log('')
console.log('📋 PRÓXIMOS PASSOS PARA DEBUG:')
console.log('1. Verificar logs do servidor quando a API é chamada')
console.log('2. Confirmar estrutura exata da tabela no Supabase')
console.log('3. Verificar valor da empresa do usuário logado')
console.log('4. Testar query diretamente no Supabase')
console.log('5. Verificar se os filtros de data estão corretos')