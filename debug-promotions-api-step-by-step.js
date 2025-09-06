// 🔍 DEBUG: API de Promoções Passo a Passo
// Simular exatamente o que acontece na API para identificar onde falha

console.log('🔍 DEBUG PASSO A PASSO DA API DE PROMOÇÕES')
console.log('=' .repeat(60))

// PASSO 1: Dados recebidos
console.log('📥 PASSO 1: DADOS RECEBIDOS PELA API')
const dadosRecebidos = {
  selectedFields: ['Cliente', 'Whatsapp', 'Loja', 'Data_Envio'],
  startDate: '2024-01-01',
  endDate: '2024-12-31'
}
console.log('   selectedFields:', dadosRecebidos.selectedFields)
console.log('   startDate:', dadosRecebidos.startDate)
console.log('   endDate:', dadosRecebidos.endDate)
console.log('')

// PASSO 2: Validação de campos
console.log('🔍 PASSO 2: VALIDAÇÃO DE CAMPOS')
const camposDisponiveis = [
  'Cliente',
  'Obs',
  'Whatsapp', 
  'Sub_rede',
  'Loja',
  'Id',
  'Data_Envio'
]

const camposValidos = dadosRecebidos.selectedFields.filter(campo => {
  const isValid = camposDisponiveis.includes(campo)
  console.log(`   ${campo}: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`)
  return isValid
})

// Sempre adicionar Id
if (!camposValidos.includes('Id')) {
  camposValidos.push('Id')
  console.log('   Id: ✅ ADICIONADO AUTOMATICAMENTE')
}

console.log('   Campos finais para query:', camposValidos)
console.log('')

// PASSO 3: Autenticação (simulação)
console.log('🔐 PASSO 3: AUTENTICAÇÃO')
console.log('   Cookie ps_session: [PRECISA SER TESTADO]')
console.log('   Email extraído: [PRECISA SER VERIFICADO]')
console.log('   Usuário encontrado na tabela users: [PRECISA SER VERIFICADO]')
console.log('   Empresa/Rede do usuário: [VALOR CRÍTICO - PRECISA SER CONFIRMADO]')
console.log('')

// PASSO 4: Construção da Query
console.log('🔨 PASSO 4: CONSTRUÇÃO DA QUERY SUPABASE')
const empresaSimulada = 'NOME_DA_EMPRESA_AQUI' // Você precisa informar o valor real
console.log('   Tabela: "Relatorio Envio de Promoções"')
console.log('   SELECT:', camposValidos.join(', '))
console.log('   WHERE Rede =', `"${empresaSimulada}"`)
console.log('   AND Data_Envio >=', `"${dadosRecebidos.startDate}"`)
console.log('   AND Data_Envio <=', `"${dadosRecebidos.endDate}"`)
console.log('   ORDER BY Data_Envio DESC, Id DESC')
console.log('   LIMIT 1000')
console.log('')

// PASSO 5: Query SQL equivalente
console.log('📝 PASSO 5: QUERY SQL EQUIVALENTE')
const sqlQuery = `
SELECT ${camposValidos.join(', ')}
FROM "Relatorio Envio de Promoções" 
WHERE "Rede" = '${empresaSimulada}'
  AND "Data_Envio" >= '${dadosRecebidos.startDate}'
  AND "Data_Envio" <= '${dadosRecebidos.endDate}'
ORDER BY "Data_Envio" DESC, "Id" DESC
LIMIT 1000;
`
console.log(sqlQuery)

// PASSO 6: Pontos de falha possíveis
console.log('⚠️ PASSO 6: POSSÍVEIS PONTOS DE FALHA')
console.log('')
console.log('1. 🏢 EMPRESA INCORRETA:')
console.log('   - O valor da empresa do usuário não confere com "Rede"')
console.log('   - Verificar: SELECT DISTINCT "Rede" FROM "Relatorio Envio de Promoções"')
console.log('')

console.log('2. 📅 FORMATO DE DATA INCOMPATÍVEL:')
console.log('   - Campo "Data_Envio" pode estar em formato diferente')
console.log('   - Verificar: SELECT "Data_Envio" FROM "Relatorio Envio de Promoções" LIMIT 3')
console.log('')

console.log('3. 🔐 PROBLEMA DE AUTENTICAÇÃO:')
console.log('   - Cookie ps_session inválido ou expirado')
console.log('   - Usuário não encontrado na tabela users')
console.log('   - Campo empresa/rede vazio no usuário')
console.log('')

console.log('4. 📋 NOME DA TABELA OU CAMPOS:')
console.log('   - Tabela "Relatorio Envio de Promoções" não existe')
console.log('   - Campos com nomes diferentes do esperado')
console.log('')

console.log('5. 🔒 PERMISSÕES DO SUPABASE:')
console.log('   - RLS (Row Level Security) bloqueando acesso')
console.log('   - Service role key sem permissões adequadas')
console.log('')

// PASSO 7: Testes para executar
console.log('🧪 PASSO 7: TESTES PARA EXECUTAR')
console.log('')
console.log('A. No Supabase Dashboard:')
console.log('   1. SELECT COUNT(*) FROM "Relatorio Envio de Promoções";')
console.log('   2. SELECT DISTINCT "Rede" FROM "Relatorio Envio de Promoções";')
console.log('   3. SELECT * FROM "Relatorio Envio de Promoções" LIMIT 3;')
console.log('')

console.log('B. No Browser (DevTools):')
console.log('   1. Verificar cookie ps_session no Application tab')
console.log('   2. Verificar logs do console quando chama a API')
console.log('   3. Verificar Network tab para ver request/response')
console.log('')

console.log('C. No Servidor (logs):')
console.log('   1. Verificar logs da API /api/reports/promotions')
console.log('   2. Verificar se a autenticação está funcionando')
console.log('   3. Verificar qual empresa está sendo usada no filtro')
console.log('')

console.log('📋 INFORMAÇÕES NECESSÁRIAS PARA CONTINUAR:')
console.log('1. Qual é o valor exato no campo "Rede" da tabela?')
console.log('2. Qual é a empresa/rede do usuário logado?')
console.log('3. Como estão formatadas as datas na tabela?')
console.log('4. Quantos registros tem a tabela no total?')
console.log('5. Há algum erro nos logs do servidor?')