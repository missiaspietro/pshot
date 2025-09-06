// Script para testar a exportação Excel de pesquisas
// Execute este script no console do navegador

console.log('🧪 === TESTE DE EXPORTAÇÃO EXCEL PESQUISAS ===')

// Dados de teste simulados
const testData = [
  {
    nome: 'João Silva',
    telefone: '11999999999',
    loja: '1',
    rede: 'Teste Rede',
    resposta: '1'
  },
  {
    nome: 'Maria Santos',
    telefone: '11888888888',
    loja: '2',
    rede: 'Teste Rede',
    resposta: '2'
  },
  {
    nome: 'Pedro Costa',
    telefone: '11777777777',
    loja: '1',
    rede: 'Teste Rede',
    resposta: '3'
  }
]

const testFields = ['nome', 'telefone', 'loja', 'rede', 'resposta']
const testLabels = {
  'nome': 'Nome',
  'telefone': 'Telefone',
  'loja': 'Loja',
  'rede': 'Rede',
  'resposta': 'Resposta'
}

console.log('🧪 Dados de teste:', testData)
console.log('🧪 Campos de teste:', testFields)
console.log('🧪 Labels de teste:', testLabels)

// Testar se o serviço existe
if (typeof excelExportService !== 'undefined') {
  console.log('✅ excelExportService encontrado')
  
  if (typeof excelExportService.exportCustomSurveyReportToExcel === 'function') {
    console.log('✅ Função exportCustomSurveyReportToExcel encontrada')
    
    try {
      console.log('🧪 Executando exportação de teste...')
      excelExportService.exportCustomSurveyReportToExcel(testData, testFields, testLabels)
      console.log('✅ Exportação executada com sucesso!')
    } catch (error) {
      console.error('❌ Erro na exportação:', error)
    }
  } else {
    console.error('❌ Função exportCustomSurveyReportToExcel não encontrada')
  }
} else {
  console.error('❌ excelExportService não encontrado')
}

console.log('🧪 === FIM DO TESTE ===')