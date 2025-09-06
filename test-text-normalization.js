// Script para testar a normalização de texto
const { normalizeText, normalizeDataRow } = require('./lib/text-utils')

function testNormalization() {
  console.log('🔄 Testando normalização de texto...')
  
  // Casos de teste com caracteres corrompidos mais comuns
  const testCases = [
    {
      input: 'LUZIA PL�CIDO DA SILVA',
      expected: 'LUZIA PLÁCIDO DA SILVA',
      description: 'Nome com acento corrompido (caso principal)'
    },
    {
      input: 'JO�O DA SILVA',
      expected: 'JOÃO DA SILVA', 
      description: 'Nome com ã corrompido'
    },
    {
      input: 'MARIA CONCEI��O',
      expected: 'MARIA CONCEIÇÃO',
      description: 'Nome com ç e ã corrompidos'
    },
    {
      input: 'JOS� ANTÔNIO',
      expected: 'JOSÉ ANTÔNIO',
      description: 'Nome com é corrompido'
    },
    {
      input: 'ANA L�CIA',
      expected: 'ANA LÚCIA',
      description: 'Nome com ú corrompido'
    },
    {
      input: 'PEDRO HENRIQUE',
      expected: 'PEDRO HENRIQUE',
      description: 'Nome sem acentos (deve permanecer igual)'
    },
    {
      input: null,
      expected: '',
      description: 'Valor null'
    },
    {
      input: '',
      expected: '',
      description: 'String vazia'
    }
  ]
  
  console.log('\n📋 Testando casos individuais:')
  testCases.forEach((testCase, index) => {
    const result = normalizeText(testCase.input)
    const passed = result === testCase.expected
    
    console.log(`   ${index + 1}. ${testCase.description}`)
    console.log(`      Input:    "${testCase.input}"`)
    console.log(`      Expected: "${testCase.expected}"`)
    console.log(`      Result:   "${result}"`)
    console.log(`      Status:   ${passed ? '✅ PASSOU' : '❌ FALHOU'}`)
    console.log('')
  })
  
  // Testar normalização de objeto
  console.log('📋 Testando normalização de objeto:')
  const testData = {
    cliente: 'LUZIA PL�CIDO DA SILVA',
    whatsApp: '11999999999',
    status: 'Mensagem enviada',
    rede: 'EMPRESA XYZ',
    numero: 123
  }
  
  const normalizedData = normalizeDataRow(testData)
  console.log('   Input:', testData)
  console.log('   Output:', normalizedData)
  
  // Verificar se cliente foi normalizado
  const clienteNormalizado = normalizedData.cliente === 'LUZIA PLÁCIDO DA SILVA'
  console.log(`   Cliente normalizado: ${clienteNormalizado ? '✅ SIM' : '❌ NÃO'}`)
  
  console.log('\n🎉 Teste de normalização concluído!')
}

// Executar teste
try {
  testNormalization()
} catch (error) {
  console.error('💥 Erro no teste:', error)
}