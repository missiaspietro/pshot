// 🔍 TESTE: Estrutura da Tabela de Promoções
// Verificar se a tabela existe e quais campos estão disponíveis

console.log('🔍 TESTANDO ESTRUTURA DA TABELA DE PROMOÇÕES')
console.log('=' .repeat(60))

// Dados que você mencionou que existem na tabela
console.log('📋 INFORMAÇÕES DA TABELA QUE VOCÊ FORNECEU:')
console.log('   Nome: "Relatorio Envio de Promoções"')
console.log('   Status: Não está vazia (tem dados)')
console.log('')

// Campos que o código está tentando buscar
const camposBuscados = [
  'Cliente',
  'Obs', 
  'Whatsapp',
  'Sub_rede',
  'Loja',
  'Id',
  'Data_Envio'
]

console.log('🎯 CAMPOS QUE O CÓDIGO ESTÁ BUSCANDO:')
camposBuscados.forEach((campo, index) => {
  console.log(`   ${index + 1}. ${campo}`)
})

console.log('')
console.log('❓ VERIFICAÇÕES CRÍTICAS NECESSÁRIAS:')
console.log('')

console.log('1. 🏢 CAMPO "Rede" (usado para filtrar por empresa):')
console.log('   - Este campo existe na tabela?')
console.log('   - Quais valores únicos existem neste campo?')
console.log('   - Exemplo de query: SELECT DISTINCT "Rede" FROM "Relatorio Envio de Promoções"')
console.log('')

console.log('2. 📅 CAMPO "Data_Envio" (usado para filtrar por período):')
console.log('   - Este campo existe na tabela?')
console.log('   - Qual é o formato dos dados? (YYYY-MM-DD, DD/MM/YYYY, timestamp?)')
console.log('   - Exemplo de query: SELECT "Data_Envio" FROM "Relatorio Envio de Promoções" LIMIT 5')
console.log('')

console.log('3. 👤 EMPRESA DO USUÁRIO LOGADO:')
console.log('   - Qual é o valor exato da empresa/rede do usuário?')
console.log('   - Este valor confere com algum valor no campo "Rede"?')
console.log('')

console.log('4. 📊 ESTRUTURA COMPLETA DA TABELA:')
console.log('   - Quais são TODOS os campos disponíveis?')
console.log('   - Algum campo tem nome diferente do esperado?')
console.log('')

console.log('🔧 QUERIES DE TESTE PARA EXECUTAR NO SUPABASE:')
console.log('')
console.log('-- 1. Ver estrutura da tabela')
console.log('SELECT column_name, data_type FROM information_schema.columns')
console.log('WHERE table_name = \'Relatorio Envio de Promoções\';')
console.log('')

console.log('-- 2. Ver primeiros registros')
console.log('SELECT * FROM "Relatorio Envio de Promoções" LIMIT 3;')
console.log('')

console.log('-- 3. Ver valores únicos do campo Rede')
console.log('SELECT DISTINCT "Rede" FROM "Relatorio Envio de Promoções";')
console.log('')

console.log('-- 4. Contar total de registros')
console.log('SELECT COUNT(*) FROM "Relatorio Envio de Promoções";')
console.log('')

console.log('-- 5. Ver formato das datas')
console.log('SELECT "Data_Envio", typeof("Data_Envio") FROM "Relatorio Envio de Promoções" LIMIT 5;')
console.log('')

console.log('🎯 APÓS EXECUTAR ESSAS QUERIES, VOCÊ SABERÁ:')
console.log('✓ Se a tabela existe e tem a estrutura esperada')
console.log('✓ Quais empresas/redes estão disponíveis')
console.log('✓ Se os nomes dos campos estão corretos')
console.log('✓ Se o formato das datas está compatível')
console.log('✓ Quantos registros existem na tabela')

console.log('')
console.log('📝 DEPOIS DE EXECUTAR, ME INFORME:')
console.log('1. Quantos registros tem a tabela?')
console.log('2. Quais valores aparecem no campo "Rede"?')
console.log('3. Como estão formatadas as datas no campo "Data_Envio"?')
console.log('4. Todos os campos esperados existem?')